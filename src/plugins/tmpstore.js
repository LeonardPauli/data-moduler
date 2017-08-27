import {itemFieldsIterator} from './helpers'

// namespace
const namespace = 'tmpstore'

// initialiseModule
const initialiseModule = _moduler=> module=> {
	module[namespace] = Object.assign({}, module[namespace])
}


// exported helpers
class Collection {
	documents = []
	
	constructor (name) {
		this.name = name
	}
	toString () { return this.name }
	
	_lastId = 0
	newId () {
		this._lastId++
		return this._lastId+''
	}

	createDocument (doc) {
		// if (doc.col == 2) throw new Error(`Color(id=${doc.col}) does not exist`)
		Object.defineProperty(doc, 'toString', {
			enumerable: false,
			value: ()=> doc.name,
		})
		this.documents.push(doc)
		return doc
	}
	removeDocument (doc) {
		const oldLength = this.documents.length
		this.documents = this.documents.filter(d=> d.id!==doc.id)
		return this.documents.length != oldLength
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



const crud = {
	actions: {
		create: ()=> ({store, module: {name}}, input)=> store.collections[name]
			.createDocument({...input, id: store.collections[name].newId()}),

		// [namespace]: ({store, module: {name}, self})=> store.collections[name]
		// 	.documents.find(d=> d.id == self.id),
		load: ()=> ({store, module: {name}, self})=> store.collections[name]
			.documents.find(d=> d.id == self.id),

		list: ()=> ({store, module: {name}}, {q: input} = {})=> store.collections[name]
			.documents.filter(d=> {
				const keys = input? Object.keys(input): []
				if (!keys.length) return true
				return keys.some(k=>
					d[k].match(new RegExp(`.*${input[k]}.*`, 'ig'))
				)
			}),

		delete: ()=> ({store, module, self})=>
			store.collections[module.name].removeDocument(self),
	},
}


const fieldSerializer = ({data, module})=> module && data? data.id: data
const fieldParser = ({data, module})=> module && data? {id: data}: data

const actionsWrapper = ({context, fn})=> {
	const fieldsSerializer = itemFieldsIterator(context, fieldSerializer)
	const fieldsParser = itemFieldsIterator(context, fieldParser)
	const {fieldSectionName} = context
	const {isList} = context.thisAction.type.type

	const input = fieldSectionName=='mutations'
		? fieldsSerializer(context.input)
		: context.input
	
	const res = fn({
		...context,
		store: context.moduler[namespace].store,
	}, input)

	if (!res) return null
	if (isList) return res.map(fieldsParser)
	return fieldsParser(res)
}

export default function TmpStorePlugin (defaults) {
	return {
		namespace,

		initialize: _moduler=> {
			// Object.assign(moduler.fieldDefaults.allowNull, {
			// 	create: null, store: null, read: null, update: null,
			// })
		},
		initialiseModule,
		// dataTypes,
		// typeReducer,

		actions: {
			wrapper: actionsWrapper,
		},

		helpers: {
			attach: attach(defaults),
			Store,
			store: null, // CRUD actions are referencing moduler[namespace].store, set it manually
		},
		moduleHelpers: {
			attach: module=> options=> attach(defaults)(module, options),
		},

		crud,

		documentation: {
			title: 'tmpstore - Temporary storage (caching)',
			description: 'By saving all data on the heap, native to JavaScript, this store becomes very'
			+ ' fast - until it exceeds the available RAM - or restarts, which inherently removes'
			+ ' all the data.',
		},
	}
}
