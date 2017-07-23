// getDefaultGetters
export const getDefaultGetters = ({ dataFlags, dataTypes })=> module=> {
	const {useId} = dataFlags
	const {LIST, SELF} = dataTypes

	if (!module.useCRUD) return {}
	
	return {
		list: { type: LIST.of(SELF),
			// method: 'GET', implicit because it's a getter
			path: '', // if not set to empty, path would be /list
			resolve: ({ _action, args, rootValue: {models}, module: {name} })=>
				models[name].findAll({where: args}),
		},
		load: { SELF,
			useId, path: '', // if not set to empty, path would be :id/load
			resolve: ({ _action, args, rootValue: {models}, module: {name} })=>
				models[name].findAll({where: args}),
		},
	}
}


// getDefaultActions
export const getDefaultActions = ({ dataFlags, dataTypes })=> module=> {
	const {useId} = dataFlags
	const {SELF, BOOLEAN, STRING} = dataTypes
	
	if (!module.useCRUD) return {}

	return {
		create: { SELF,
			// method: 'POST', implicit because it's an action
			path: '',
			params: {name: STRING},
			resolve: ({ _action, args, rootValue: {models}, module: {name} })=>
				models[name].create(args),
		},
		update: { SELF,
			useId, path: '',
		},
		remove: { BOOLEAN,
			method: 'DELETE',
			useId, path: '',
		},
	}
}


const initialiseModule = _moduler=> module=> {
	module.crud = Object.assign({
		enabled: true,
	}, module.crud)

	if (!module.isEntity) module.crud.enabled = false
}


export default {
	namespace: 'crud',
	initialiseModule,
}
