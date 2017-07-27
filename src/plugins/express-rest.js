// import express from 'express'

const dataTypes = {
	STRING: 	{ },
	BOOLEAN: 	{ },
	DATE: 		{ },
	INT: 			{ },
	DECIMAL: 	{ },
	LIST: 		{ },
}


// helpers
const actionPathGenerator = ({key})=> key.replace(/[A-Z]/g, l=> '-'+l.toLowerCase())

// ...
const ___getActionNormaliser = ({dataTypes})=> (module, fieldNormaliser)=> action=> {
	const {INT} = dataTypes

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
}


export default {
	namespace: 'rest',
	dataTypes,
	___getActionNormaliser,
}
