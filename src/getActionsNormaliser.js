import {getFieldNormaliser} from './getFieldsNormaliser'

// helpers
const actionPathGenerator = ({key})=> key.replace(/[A-Z]/g, l=> '-'+l.toLowerCase())


// getActionNormaliser -> (...) -> actionNormaliser
const getActionNormaliser = ({dataTypes})=> (module, fieldNormaliser)=> action=> {
	const {INT, BOOLEAN} = dataTypes


	// action.path
	if (typeof action.path === 'string') {
		const str = action.path
		action.path = ()=> str
	}
	if (typeof action.path !== 'function')
		action.path = actionPathGenerator


	// params and useId
	if (!action.params) action.params = {}
	if (action.useId) {
		action.params.id = INT
		const oldPath = action.path
		action.path = opt=> ':id/'+oldPath(opt)
	}

	// fix params
	const fixedParams = {}
	Object.keys(action.params).forEach(k=> {
		fixedParams[k] = fieldNormaliser(action.params[k])
	})
	action.params = fixedParams


	// type
	// throw new Error(`data-moduler: action/getter ${actionName}
	// 	in module ${module.name} needs a type field`)
	const typeKeyNamed = Object.keys(dataTypes).find(k=>
		Object.keys(action).indexOf(k)>=0)
	const typeKey = typeKeyNamed || 'type'
	if (!action[typeKey]) action.type = BOOLEAN.type
	action.type = fieldNormaliser({[typeKey]: action[typeKey]}).type
	if (typeKeyNamed) delete action[typeKeyNamed]
}


// singleActionsNormaliser
const getSingleActionsNormaliser = actionNormaliser=> ({defaults, custom, preNormaliseAction})=> {
	const actions = Object.assign({}, custom)

	// extend or remove default actions
	Object.keys(defaults).forEach(k=> {
		if (actions[k]===undefined) actions[k] = {}
		if (!actions[k]) return delete actions[k]

		actions[k] = Object.assign({}, defaults[k], actions[k])
	})

	// process action
	Object.keys(actions).forEach(actionName=> {
		const action = actions[actionName]
		preNormaliseAction(action)
		actionNormaliser(action)
	})

	return actions
}



// getActionsNormaliser
const getActionsNormaliser = moduler=> module=> {
	const {actions: rawActions, getters: rawGetters} = module

	const fieldNormaliser = getFieldNormaliser(moduler)(module)
	const actionNormaliser = getActionNormaliser(moduler)(module, fieldNormaliser)
	const singleActionsNormaliser = getSingleActionsNormaliser(actionNormaliser)

	const getters = singleActionsNormaliser({
		key: 'actions',
		module,
		// defaultGetters = getDefaultGetters(moduler)(module) from plugins
		// custom: module[key],
		preNormaliseActioni
	})

	// const defaultActions = getDefaultActions(moduler)(module)
	// const actions = singleActionsNormaliser(defaultActions, rawActions, fields=> {
	// 	fields.method = fields.method || 'POST'
	// })

	return { actions, getters }
}



// export
export default getActionsNormaliser
