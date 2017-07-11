// import modulers from '../modulers'
import {fieldNormaliser} from '../fieldsNormaliser'
import {defaultActions, defaultGetters} from './defaultActions'
import constants from '../constants'
// const {useId, allowNull} = constants
const {dataTypes, dataTypesExportable} = constants
const {BOOLEAN} = dataTypesExportable


const actionsNormaliser = module=> {
	const {actions: _actions, getters: _getters} = module
	const fieldFixer = fieldNormaliser(module)

	const actionPathGenerator = ({key})=> key.replace(/[A-Z]/g, l=> '-'+l.toLowerCase())

	// actionsFixer
	const actionsFixer = (defaults, custom, fn)=> {
		const actions = Object.assign({}, custom)
		Object.keys(defaults).forEach(k=> {
			if (actions[k]===undefined) actions[k] = {}
			if (!actions[k]) return delete actions[k]

			actions[k] = Object.assign({}, defaults[k], actions[k])
		})



		Object.keys(actions).forEach(actionName=> {
			const fields = actions[actionName]

			// action type specific
			fn(fields)


			// fields.path
			if (typeof fields.path === 'string') {
				const str = fields.path
				fields.path = ()=> str
			}
			if (typeof fields.path !== 'function')
				fields.path = actionPathGenerator


			// params and useId
			if (!fields.params) fields.params = {}
			if (fields.useId) {
				fields.params.id = dataTypes.INT
				const oldPath = fields.path
				fields.path = opt=> ':id/'+oldPath(opt)
			}

			// fix params
			const fixedParams = {}
			Object.keys(fields.params).forEach(k=> {
				fixedParams[k] = fieldFixer(fields.params[k])
			})
			fields.params = fixedParams


			// type
			// throw new Error(`data-moduler: action/getter ${actionName}
			// 	in module ${module.name} needs a type field`)
			const typeKeyNamed = Object.keys(dataTypes).find(k=>
				Object.keys(fields).indexOf(k)>=0)
			const typeKey = typeKeyNamed || 'type'
			if (!fields[typeKey]) fields.type = BOOLEAN
			fields.type = fieldFixer({[typeKey]: fields[typeKey]}).type
			if (typeKeyNamed) delete fields[typeKeyNamed]

		})

		return actions
	}

	const getters = actionsFixer(defaultGetters, _getters, fields=> {
		fields.method = fields.method || 'GET'
	})
	const actions = actionsFixer(defaultActions, _actions, fields=> {
		fields.method = fields.method || 'POST'
	})

	return { actions, getters }
}



// export
export default actionsNormaliser
