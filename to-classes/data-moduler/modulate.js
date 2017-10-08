// @flow
import {type DataModuleClassType} from './DataModule'
import {performModuleModifications} from './moduleModifications'
import {DataType, getTypeInstance} from './dataTypes'
import {getActionInstance, Action} from './actions'
import plugins from './plugins'

// normalises fields
// text: String, -> text: new STRING(config),
export const modulateFields = ({Module, fields}: {
	Module: DataModuleClassType,
	fields: {[string]: DataType<*> | Object}
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
export const modulateActions = ({Module, fields, isGetter}: {
	Module: DataModuleClassType,
	fields: {[string]: Action | Object},
	isGetter: boolean,
})=> {
	const resFields = {}
	Object.keys(fields).forEach(fieldName=> {
		const objectOrAction = fields[fieldName]
		const actionInstance = getActionInstance(objectOrAction, {Module, isGetter})
		resFields[fieldName] = actionInstance
	})
	return resFields
}

// normalises fields and actions/getters
// + executes moduleModifications matching self's submodule tree
const modulate = (Module: DataModuleClassType)=> {
	Module.fields = modulateFields({Module, fields: Module.fields})
	Module.actions = modulateFields({Module, fields: Module.actions})
	Module.getters = modulateFields({Module, fields: Module.getters, isGetter: true})

	Module.moduleModifications = performModuleModifications(
		Module.moduleModifications, [Module, ...Module.allSubmodules()])

	// TODO: apply plugins?
	console.warn('wip: will apply all available plugins in registration order')
	Object.keys(plugins).forEach(key=> plugins[key].apply(Module))
}
export default modulate
