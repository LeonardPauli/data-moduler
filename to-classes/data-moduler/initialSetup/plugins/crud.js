import {plugins, dataTypes, flags, performModuleModification} from '../../index'
const {Plugin, registerPlugin} = plugins
const {ID, SELF, FILTER} = dataTypes
const {isStatic, allowNull, onlyNew} = flags


@registerPlugin
class CrudPlugin extends Plugin {
	static namespace = 'crud'

	static getAddMiddleware = Module=> middleware=> {
		const {namespace} = middleware
		
		const wrapper = fn=> ctx=> {
			const {middlewares} = Module.$crud
			const idx = middlewares.indexOf(middleware)
			const next = idx>0 ? middlewares[idx-1] : ()=> void 0

			return fn({...ctx, next})
		}

		performModuleModification(Module, {
			getters: {
				load: {[namespace]: wrapper(middleware.load)},
				list: {[namespace]: wrapper(middleware.list)},
			},
			actions: {
				create: {[namespace]: wrapper(middleware.create)},
				update: {[namespace]: wrapper(middleware.update)},
				delete: {[namespace]: wrapper(middleware.delete)},
			},
		})
	}

	static apply (Module) {
		if (Module.$crud === false) Module.$crud = {enabled: false}
		Module.$crud = Module.$crud || {enabled: true}
		if (!Module.$crud.enabled) return
		Module.$crud.middlewares = []
		Module.$crud.addMiddleware = this.getAddMiddleware(Module)

		performModuleModification(Module, {
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
		})
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
