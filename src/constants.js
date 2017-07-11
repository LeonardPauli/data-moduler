import modulers from './modulers'


// consts
const useId = true
const allowNull = true


// defaultDataTypes
const defaultDataTypes = {
	STRING: 	{ },
	BOOLEAN: 	{ },
	DATE: 		{ },
	INT: 			{ },
	DECIMAL: 	{ },
	LIST: 		{ },
	SELF: 		({module})=> module.type,
}

// dataTypes
const dataTypes = Object.assign({}, defaultDataTypes)
modulers.map(({dataTypes: types, namespace})=> Object.keys(types).forEach(k=> {
	const type = dataTypes[k] = dataTypes[k] || {}
	const ownType = types[k]
	if (ownType.type) type[namespace] = ownType.type
}))
const dataTypesExportable = {}
Object.keys(dataTypes).forEach(k=> dataTypesExportable[k]= {type: dataTypes[k]})

// LIST is special, used like type: LIST.of(...)
dataTypes.LIST = {}
dataTypes.LIST.of = ({type: rawInnerType})=> ({module})=> {
	const innerType = typeof rawInnerType !== 'function' ? rawInnerType
		: rawInnerType({module})

	const newType = {}
	modulers.forEach(({namespace, dataTypes: {LIST: moduleLIST}})=> {
		if (!moduleLIST || !moduleLIST.of) return
		newType[namespace] = moduleLIST.of({
			innerType,
			ownInnerType: typeof innerType[namespace] === 'function'
				? innerType[namespace] : ()=> innerType[namespace],
		})({module})
	})

	return newType
}

// the exportable type should be wrapped
dataTypesExportable.LIST = {}
dataTypesExportable.LIST.of = props=> ({type: dataTypes.LIST.of(props)})


// export
export default {
	useId,
	allowNull,
	dataTypes,
	dataTypesExportable,
}
