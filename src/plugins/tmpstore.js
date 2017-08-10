// namespace
const namespace = 'tmpstore'

// initialiseModule
const initialiseModule = _moduler=> module=> {
	module[namespace] = Object.assign({}, module[namespace])

	// optionally setup default CRUD mutation/fetcher adapters
}


// exported helpers
class Collection {
	documents = []
	constructor (name) {
		this.name = name
	}
	createDocument (doc) {
		this.documents.push(doc)
	}
	removeDocument (doc) {
		this.documents = this.documents.filter(d=> d!==doc)
	}
}
class Store {
	collections = {}
	createCollection (name) {
		this.collections[name] = new Collection(name)
	}
	removeCollection (name) {
		delete this.collections[name]
	}
}


const attach = defaults=> (module, options={})=> {
	const opt = Object.assign({
		store: new Store(),
	}, defaults, options)
	const {store} = opt

	// setup module + submodules
	const walk = modules=> modules && Object.keys(modules).forEach(key=> {
		const module = modules[key]
		if (module.isEntity)
			store.createCollection(module.name)
		walk(module.modules)
	})
	walk({module})
}


export default function TmpStorePlugin (defaults) {
	return {
		namespace,

		initialiseModule,
		// dataTypes,
		// typeReducer,

		actions: {
			mutationsWrapper: (context, fn)=> ()=> fn({...context, hello: 'from tmpstore'}, context.input),
			// fetcherWrapper: (context, fn)=> fn(context),
		},

		helpers: {
			attach: attach(defaults),
			Store,
		},
		moduleHelpers: {
			attach: module=> options=> attach(defaults)(module, options),
		},
	}
}
