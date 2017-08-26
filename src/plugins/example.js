// namespace
const namespace = 'myplugin'

// initialiseModule
const initialiseModule = _moduler=> module=> {
	module[namespace] = Object.assign({}, module[namespace])
}


const myCustomTypes = {
	CString: 'string',
	CBoolean: 'boolean',
	CDate: 'date',
	CInt: 'int',
	CDecimal: 'float',
	CList: function CList (innerType) {
		this.innerType = innerType
	},
	CObject: function CObject (obj) {
		this.obj = obj
	},
}
const {CString, CBoolean, CDate, CInt, CDecimal, CList, CObject} = myCustomTypes

// dataTypes
const dataTypes = {
	STRING: 	{ type: CString },
	BOOLEAN: 	{ type: CBoolean },
	DATE: 		{ type: CDate },
	INT: 			{ type: CInt },
	DECIMAL: 	{ type: CDecimal },
	LIST: 		{ type: CList, of: ({ ownInnerType })=> props=>
		new CList(ownInnerType(props)),
	},
}

// typeReducer
const typeReducer = module=> {
	const {fields} = module
	const customType = {}
	Object.keys(fields).forEach(fieldName=> {
		const getDefaults = ()=> {}
		const defaults = getDefaults()
		const rawField = fields[fieldName]
		const field = customType[fieldName] = Object.assign(defaults, rawField)
		if (field.type) field.type = field.type[namespace]
	})
	return new CObject(customType)
}


// afterTypeSetup
const afterTypeSetup = module=> {
	module[namespace].myCustomField = typeof module.type[namespace]
}


// exported helpers
const writeFile = defaults=> (module, options={})=> {
	const opt = Object.assign({
		key: 'default-value',
	}, defaults, options)
	const {key} = opt

	// do something with key
}


export default function Example (defaults) {
	return {
		namespace,

		initialiseModule,
		dataTypes,
		typeReducer,
		afterTypeSetup,

		actions: { // needs to be !!.actions === true to enable plugin actions
			// if module.mutations.myAction = {
			// 	myplugin: ({someField})=> ... // write whatever's used with the plugin
			// }
			// or module.mutations.myplugin('some data', optionalContextToPassOnToInputNormaliser)
			// context + 'some data' -> inputNormaliser -> module.mutations.myplugin.native(...)
			// 
			// called like module.mutations.myplugin.native({a: 'some data'})
			// {a: 'some data'} + context with module etc -> wrapper -> the defined function
			// 

			wrapper: (context, fn)=> fn(
				{someField: context.input}, {
					...context,
					addedToContext: 'data',
				}
			),
			// wrapper: {
			// 	mutations: fn,
			// 	getters: fn,
			// }

			inputNormaliser: (input, context)=> {
				const {thing} = context // plugin context might not have been provided
				return {a: thing+input}
			},
			// inputNormaliser: {
			// 	mutations: fn,
			// 	getters: fn,
			// }
		},

		helpers: {
			writeFile: writeFile(defaults),
		},
		moduleHelpers: {
			writeFile: module=> options=> writeFile(defaults)(module, options),
		},

		otherPlugin: '...',
	}
}
