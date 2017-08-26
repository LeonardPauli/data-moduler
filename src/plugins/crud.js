// namespace
const namespace = 'crud'

const initialiseModule = moduler=> module=> {
	module[namespace] = Object.assign({
		enabled: module.isEntity,
	}, module[namespace])
	const opt = module[namespace]
	if (!opt.enabled) return

	const {plugins} = moduler
	const {isStatic, allowNull, onlyNew} = moduler.dataFlags
	const {STRING, MODULE, LIST, ID} = moduler.dataTypes


	// setup default entity fields
	if (module.fields.id===undefined) module.fields.id = { ID,
		// allowNull: {mutations: true, getters: false, default: false},
		// fieldSectionName= fields/getters/mutations
		ignore: ({fieldSectionName})=> fieldSectionName==='mutations',
	}


	// setup actions
	const mutations = {}
	const getters = {}

	mutations.create = { isStatic,
		type: MODULE.of(module),
		returnTypeDescription: 'If ok or not',
		input: ()=> ({
			item: {...MODULE.of(module), onlyNew},
		}),
	}

	getters.load = {
		type: MODULE.of(module),
		input: ()=> ({id: ID}),
	}

	// getters.list = { isStatic,
	// 	comment: 'Has filter ability',
	// 	type: LIST.of(MODULE.of(module)),
	// 	input: ()=> ({
	// 		q: { STRING, allowNull,
	// 			comment: 'Filter name',
	// 		},
	// 	}),
	// 	[namespace]: ({store, module: {name}}, input)=> store.collections[name]
	// 		.documents.filter(d=> {
	// 			const keys = input? Object.keys(input): []
	// 			if (!keys.length) return true
	// 			return keys.some(k=>
	// 				d[k].match(new RegExp(`.*${input[k]}.*`, 'ig'))
	// 			)
	// 		}),
	// 	graphql: ({thisAction}, input)=> thisAction[namespace](input.q),
	// }

	// mutations.update = {
	// 	input: {name: STRING},
	// 	[namespace]: ({module, self}, input)=>
	// 		Object.assign(module.getters.load[namespace](self)(), input),
	// }

	// mutations.delete = {
	// 	[namespace]: ({store, module, self})=> {
	// 		const doc = module.getters.load[namespace](self)()
	// 		return store.collections[module.name].removeDocument(doc)
	// 	},
	// }

	// attach plugins
	plugins.filter(v=> v[namespace]).forEach((plugin, i, filteredPlugins)=> {
		const {namespace: pluginNamespace, [namespace]: data} = plugin
		if (!data) return

		const {actions: pluginActions} = data

		const assign = actions=> Object.keys(actions).forEach(actionName=> {
			const action = actions[actionName]

			const misc = {}
			misc.nextPlugin = i>0 && filteredPlugins[i-1]
			const resolver = pluginActions[actionName](misc)
			// resolver.middlewares = []

			action[pluginNamespace] = resolver
		})
		assign(mutations)
		assign(getters)
	})

	Object.assign(module.mutations, mutations)
	Object.assign(module.getters, getters)
}


export default function CrudPlugin (_defaults) {
	return {
		namespace,
		initialiseModule,
	}
}


// // getDefaultGetters
// export const getDefaultGetters = ({ dataFlags, dataTypes })=> module=> {
// 	const {useId} = dataFlags
// 	const {LIST, SELF} = dataTypes

// 	if (!module.useCRUD) return {}
	
// 	return {
// 		list: { type: LIST.of(SELF),
// 			// method: 'GET', implicit because it's a getter
// 			path: '', // if not set to empty, path would be /list
// 			resolve: ({ _action, args, rootValue: {models}, module: {name} })=>
// 				models[name].findAll({where: args}),
// 		},
// 		load: { SELF,
// 			useId, path: '', // if not set to empty, path would be :id/load
// 			resolve: ({ _action, args, rootValue: {models}, module: {name} })=>
// 				models[name].findAll({where: args}),
// 		},
// 	}
// }


// // getDefaultActions
// export const getDefaultActions = ({ dataFlags, dataTypes })=> module=> {
// 	const {useId} = dataFlags
// 	const {SELF, BOOLEAN, STRING} = dataTypes
	
// 	if (!module.useCRUD) return {}

// 	return {
// 		create: { SELF,
// 			// method: 'POST', implicit because it's an action
// 			path: '',
// 			params: {name: STRING},
// 			resolve: ({ _action, args, rootValue: {models}, module: {name} })=>
// 				models[name].create(args),
// 		},
// 		update: { SELF,
// 			useId, path: '',
// 		},
// 		remove: { BOOLEAN,
// 			method: 'DELETE',
// 			useId, path: '',
// 		},
// 	}
// }