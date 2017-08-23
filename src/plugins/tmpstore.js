// namespace
const namespace = 'tmpstore'
let id = 0
// initialiseModule
const initialiseModule = moduler=> module=> {
	module[namespace] = Object.assign({}, module[namespace])


	if (!module.isEntity) return

	const {isStatic, allowNull} = moduler.dataFlags
	const {STRING, MODULE} = moduler.dataTypes

	// optionally setup default CRUD mutation/fetcher adapters

	const fn = ({store, module: {name}}, input)=> store.collections[name]
			.createDocument({...input, id: id++})
	fn.comment = 'Note from a plugin'

	module.mutations.create = { isStatic,
		type: MODULE.of(module),
		returnTypeDescription: 'If ok or not',
		input: ()=> ({
			constructor: MODULE.of(module),
		}),
		[namespace]: fn,
	}

	// module.getters.load = {
	// 	[namespace]: ({store, module: {name}, self})=> store.collections[name]
	// 		.documents.find(d=> d.id == self.id),
	// }

	// module.getters.list = { isStatic,
	// 	comment: 'Has filter ability',
	// 	input: {
	// 		q: { STRING, allowNull,
	// 			comment: 'Filter name',
	// 		},
	// 	},
	// 	[namespace]: ({store, module: {name}}, input)=> store.collections[name]
	// 		.documents.filter(d=> {
	// 			const keys = Object.keys(input)
	// 			if (!keys.length) return true
	// 			return keys.some(k=>
	// 				d[k].match(new RegExp(`.*${input[k]}.*`, 'ig'))
	// 			)
	// 		}),
	// }

	// module.mutations.update = {
	// 	input: {name: STRING},
	// 	[namespace]: ({module, self}, input)=>
	// 		Object.assign(module.getters.load[namespace](self)(), input),
	// }

	// module.mutations.delete = {
	// 	[namespace]: ({store, module, self})=> {
	// 		const doc = module.getters.load[namespace](self)()
	// 		return store.collections[module.name].removeDocument(doc)
	// 	},
	// }
}


// exported helpers
class Collection {
	documents = []
	constructor (name) {
		this.name = name
	}
	toString () { return this.name }
	createDocument (doc) {
		Object.defineProperty(doc, 'toString', {
			enumerable: false,
			value: ()=> doc.name,
		})
		this.documents.push(doc)
		return doc
	}
	removeDocument (doc) {
		this.documents = this.documents.filter(d=> d!==doc)
		return doc
	}
}
class Store {
	collections = {}
	createCollection (name) {
		return this.collections[name] = new Collection(name)
	}
	removeCollection (name) {
		const ret = this.collections[name]
		delete this.collections[name]
		return ret
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


const actionsWrapper = (context, fn)=> fn({
	...context,
	store: context.moduler[namespace].store,
}, context.input)

export default function TmpStorePlugin (defaults) {
	return {
		namespace,

		initialiseModule,
		// dataTypes,
		// typeReducer,

		actions: {
			mutationsWrapper: actionsWrapper,
			gettersWrapper: actionsWrapper,
		},

		helpers: {
			attach: attach(defaults),
			Store,
			store: null, // CRUD actions are referencing moduler[namespace].store, set it manually
		},
		moduleHelpers: {
			attach: module=> options=> attach(defaults)(module, options),
		},

		documentation: {
			title: 'tmpstore - Temporary storage (caching)',
			description: 'By saving all data on the heap, native to JavaScript, this store becomes very'
			+ ' fast - until it exceeds the available RAM - or restarts, which inherently removes'
			+ ' all the data.',
		},
	}
}
