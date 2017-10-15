// @flow
import {type DataModuleClassType} from './DataModule'
import {performModuleModifications} from './moduleModifications'
import {DataType, getTypeInstance} from './dataTypes'
import {getActionInstance, Action} from './actions'
import plugins from './plugins'
import context from './context'

// normalises fields
// text: String, -> text: new STRING(config),
export const modulateFields = ({Module, fields}: {
	Module: DataModuleClassType,
	fields: {[string]: DataType<*> | Object},
})=> {
	const resFields = {}
	Object.keys(fields).forEach(fieldName=> {
		const objectOrRawType = fields[fieldName]
		const typeInstance = getTypeInstance(objectOrRawType, {Module})
		resFields[fieldName] = typeInstance
	})
	return resFields
}

// normalises actions
// ql/querylanguage is a plugin
// create: ql | new Action(config) | fn | config, -> create: new Action(config),
let wipWarningLogged = false
export const modulateActions = ({Module, fields, isGetter = false}: {
	Module: DataModuleClassType,
	fields: {[string]: Action | Object},
	isGetter?: boolean,
})=> {
	const resFields = {}
	Object.keys(fields).forEach(actionName=> {
		const objectOrAction = fields[actionName]
		const action = getActionInstance(objectOrAction, {Module, isGetter})

		action.name = actionName
		action.fn = (value: mixed, baseCtx)=> {
			const ctx = context.get({Module, action}, baseCtx)
			const input = action.inputType.validate(value, {Module})
			return action.defaultFn({...baseCtx, ...ctx, input})
		}

		resFields[actionName] = action
	})
	return resFields
}

// normalises fields and actions/getters
// + executes moduleModifications matching self's submodule tree
const modulate = (Module: DataModuleClassType)=> {
	Module.fields = modulateFields({Module, fields: Module.fields})
	Module.actions = modulateActions({Module, fields: Module.actions})
	Module.getters = modulateActions({Module, fields: Module.getters, isGetter: true})

	Module.moduleModifications = performModuleModifications(
		Module.moduleModifications, [Module, ...Module.allSubmodules()])

	// TODO: apply plugins?
	if (!wipWarningLogged) {
		console.warn('wip: will apply all available plugins in registration order')
		wipWarningLogged = true
	}
	Object.keys(plugins).forEach(key=> plugins[key].apply(Module))
}
export default modulate
