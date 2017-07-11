// import modulers from '../modulers'
// import fieldsNormaliser from '../fieldsNormaliser'
import constants from '../constants'
const {useId} = constants
const {LIST, SELF, BOOLEAN, STRING} = constants.dataTypesExportable


// defaultGetters
export const defaultGetters = {
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


// defaultActions
export const defaultActions = {
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
