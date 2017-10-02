import {plugins, dataTypes, flags} from '../index'
const {Plugin, registerPlugin} = plugins
const {ID, SELF, FILTER} = dataTypes
const {isStatic, allowNull, onlyNew} = flags


@registerPlugin
class CrudPlugin extends Plugin {
	static namespace = 'crud'

	static getAddMiddleware = module=> middleware=> {
		const {namespace} = middleware
		
		const wrapper = fn=> ctx=> {
			const {middlewares} = module.$crud
			const idx = middlewares.indexOf(middleware)
			const next = idx>0 ? middlewares[idx-1] : ()=> void 0

			return fn({...ctx, next})
		}

		module.moduleModifications = [...module.moduleModifications, {
			module,
			getters: {
				load: {[namespace]: wrapper(middleware.load)},
				list: {[namespace]: wrapper(middleware.list)},
			},
			actions: {
				create: {[namespace]: wrapper(middleware.create)},
				update: {[namespace]: wrapper(middleware.update)},
				delete: {[namespace]: wrapper(middleware.delete)},
			},
		}]
	}

	static apply (module) {
		if (module.$crud === false) module.$crud = {enabled: false}
		module.$crud = module.$crud || {enabled: true}
		if (!module.$crud.enabled) return
		module.$crud.middlewares = []
		module.$crud.addMiddleware = this.getAddMiddleware(module)

		module.moduleModifications = [...module.moduleModifications, {
			module,
			getters: {
				load: {
					isStatic,
					type: {SELF, allowNull}, // not an error if no find
					input: {id: ID},
				},
				list: {
					isStatic,
					type: [SELF],
					input: FILTER.of(SELF),
				},
			},
			actions: {
				create: {
					isStatic, SELF,
					input: { item: {SELF, onlyNew} },
				},
				update: {
					isStatic, SELF,
					input: { id: ID, item: {SELF, onlyNew} },
				},
				delete: {
					isStatic,
					input: { id: ID },
				},
			},
		}]
	}

	static documentation = {
		title: 'crud - Auto-add CRUD actions',
		description: 'CRUD stands for Create, Read, Update, and Delete. In this'
		+' case, it adds default mutations (create, update, delete) and getters'
		+' (load, list), together with a hook for other plugins to provide their'
		+' own default CRUD actions in a standardized way. This makes it possible'
		+' to automatically chain multiple plugins. Ie. if one store plugin is added,'
		+' then a validation plugin, followed by an API exposer (ie rest/graphql),'
		+' followed by the crud plugin, calling create on the API will automatically'
		+' first validate the input, and then call create on the store.',
	}
}
