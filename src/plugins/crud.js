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
	const {STRING, MODULE, LIST, ID, SELF, OBJECT} = moduler.dataTypes


	// setup default entity fields
	if (module.fields.id===undefined) module.fields.id = { ID,
		// allowNull: {mutations: true, getters: false, default: false},
		// fieldSectionName= fields/getters/mutations
		ignore: ({fieldSectionName})=> fieldSectionName==='mutations',
	}


	// setup actions
	const mutations = {}
	const getters = {}

	mutations.create = { SELF, isStatic,
		returnTypeDescription: 'If ok or not',
		input: ()=> ({
			item: {SELF, onlyNew},
		}),
	}

	getters.load = {
		type: {SELF, allowNull},
		input: ()=> ({id: ID}),
	}

	getters.list = { isStatic,
		comment: 'Has filter ability',
		type: LIST.of(SELF),
		input: ()=> {
			const obj = {}

			const filters = {}
			Object.keys(module.fields).forEach(name=> {
				const field = module.fields[name]
				if (field.type._module) return
				filters[name] = {...field.type, allowNull}
			})
			if (Object.keys(filters).length)
				obj.q = {type: OBJECT.of(filters, 'Filter'), allowNull}

			return obj
		},
	}

	// mutations.update = {
	// 	input: {name: STRING},
	// 	[namespace]: ({module, self}, input)=>
	// 		Object.assign(module.getters.load[namespace](self)(), input),
	// }

	mutations.delete = {
		input: ()=> ({id: ID}),
	}

	// attach plugins
	plugins.filter(v=> v[namespace]).forEach((plugin, i, filteredPlugins)=> {
		const {namespace: pluginNamespace, [namespace]: data} = plugin
		if (!data) return

		const {actions: pluginActions} = data

		const assign = actions=> Object.keys(actions).forEach(actionName=> {
			const action = actions[actionName]

			const misc = {}
			misc.nextPlugin = i>0 && filteredPlugins[i-1]
			const rawResolver = pluginActions[actionName]
			if (!rawResolver) return
			// resolver.middlewares = []

			action[pluginNamespace] = rawResolver(misc)
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