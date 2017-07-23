// namespace
const namespace = 'myplugin'

// initialiseModule
const initialiseModule = _moduler=> module=> {
	module[namespace] = Object.assign({}, module[namespace])

	// optionally setup default CRUD mutation/fetcher adapters
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



const defineModels = ()=> {

}


export default {
	namespace,

	initialiseModule,
	dataTypes,
	typeReducer,

	actions: {
		mutationWrapper: (context, fn)=> fn(context),
		fetcherWrapper: (context, fn)=> fn(context),
	},

	helpers: {
		defineModels,
	},
}
