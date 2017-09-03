import getFieldsNormaliser, {getFieldNormaliser} from './getFieldsNormaliser'

// helpers
const getListOf = moduler=> type=> module=> {
	const fieldNormaliser = getFieldNormaliser(moduler)(module)
	const {plugins} = moduler
	const innerType = fieldNormaliser({type}).type

	const newType = {}
	plugins.forEach(({namespace, dataTypes={}})=> {
		const {LIST} = dataTypes
		if (!LIST || !LIST.of) return

		newType[namespace] = LIST.of({
			innerType,
			ownInnerType: ()=> innerType[namespace],
		})(module)
	})

	newType.isList = true
	newType.ofType = innerType
	return {type: newType}
}


const moduleTypeUnwrapper = _moduler=> module=> {
	// module type is a wrapper around the module
	// const getModuleType = _module=> {
	// 	const type = {_module}
	// 	Object.defineProperty(type, 'name', {
	// 		enumerable: true,
	// 		get () { return this._module.name },
	// 	})
	// 	Object.defineProperty(type, 'toString', {
	// 		enumerable: false,
	// 		value () { return this.name },
	// 	})
	// 	return type
	// }

	const typeWrappedType = module=> ({type: module.type})
		// if ._isModule is detected later on, it will unwrap

	if (module._isModule) return typeWrappedType(module) // if already initialised
	if (module._module) return typeWrappedType(module._module) // get initialized from raw
	throw new Error(`data-moduler.MODULE.of(${module.name}): rawModule not initialised`)
	// return {type: module} // rawModule._module will point to initialised module
}

const objectTypeCreator = moduler=> (fields, name)=> module=> {
	// TODO: Run through moduler instead?
	// ie. should OBJECT.of just create a simpler module, only with fields+name,
	// or, an intermidiate (not registered) full-featured module?
	// I like the latter (more streamlined), which would propably use moduler.parse
	// although, in many cases, the use is for JsonB, or similar... thereby the invocation of
	// plugins.dataTypes.OBJECT.typeReducer, but think it's better solved with a flag for the
	// usual typeReducer or similar.

	const fieldNormaliser = getFieldNormaliser(moduler)(module)
	const {plugins} = moduler
	const type = {
		name: module.name+(name || 'Object'),
		fields: {},
		_isOBJECT: true,
	}
	Object.keys(fields).forEach(k=> {
		type.fields[k] = fieldNormaliser(fields[k])
	})

	plugins.forEach(({namespace, dataTypes={}})=> {
		const {OBJECT} = dataTypes
		if (!OBJECT || !OBJECT.typeReducer) return

		type[namespace] = OBJECT.typeReducer({ type })
	})

	// helpers
	Object.defineProperty(type, 'toString', {
		enumerable: false,
		value: moduleToString,
	})

	return {type}
}


// defaultDataTypes
const defaultDataTypes = {
	ID: 			{ },
	STRING: 	{ },
	BOOLEAN: 	{ },
	DATE: 		{ },
	INT: 			{ },
	DECIMAL: 	{ },
	LIST: {
		statics: {
			// LIST is special, used like {type: LIST.of(...)}
			of: moduler=> type=> ({
				type: getListOf(moduler)(type),
			}),
		},
	},
	SELF: moduleTypeUnwrapper,
	MODULE: {
		statics: {
			of: moduleTypeUnwrapper,
		},
	},
	URL: {},
	ENUM: {},
	GEOLOCATION: {
		// TODO: implement fallbacks, ie. if fallback for URL is String, and
		// 	sequelize has String but not URL... fallback using the convert methods.
		// // {lat: DECIMAL, lon: DECIMAL}
		// convertable: {
		// 	// package in modules (to/from together)
		// 	// -> spred into separate .to and .from
		// 	String: {
		// 		to: own=> JSON.stringify(own), // URL.to.String(new URL(...))
		// 		from: other=> JSON.parse(other), // URL.from.String("...")
		// 		toIsLossless: true, // for auto calculation, should really be non-binary
		// 	},
		// 	many: {
		// 		String:	{
		// 			// same as above, but if array of type...
		// 		},
		// 	},
		// },
	},
	OBJECT: { // JSON/JSONB/etc, or just nested fields; For validation/doc: OBJECT.of({field:type, ...})
		statics: {
			of: objectTypeCreator,
		},
	},
}


const moduleToString = function () { return this.name }

// dataTypes
const getDataTypes = moduler=> {
	const {plugins} = moduler

	// copy defaults
	const dataTypes = Object.assign({}, defaultDataTypes)

	// add plugin type variants
	plugins.filter(v=> v.dataTypes).map(({dataTypes: types, namespace})=>
		Object.keys(types).forEach(k=> {
			const type = dataTypes[k] = dataTypes[k] || {}
			const ownType = types[k]
			if (ownType.type) type[namespace] = ownType.type
		}
	))


	// normalise
	Object.keys(dataTypes).forEach(typeName=> {
		const original = dataTypes[typeName]

		if (typeof original === 'function') return

		try {
			original.name = original.name || typeName
		} catch (err) { /**/ }

		// helpers
		Object.defineProperty(original, 'toString', {
			enumerable: false,
			value: moduleToString,
		})
	})


	// the exportable type should be wrapped to allow
	// 	both { STRING } and { type: STRING }
	const wrappedDataTypes = {}
	Object.keys(dataTypes).forEach(k=> {
		const original = dataTypes[k]

		if (typeof original === 'function')
			return wrappedDataTypes[k] = original(moduler)

		const wrapped = { type: original, shouldUnwrapType: true }
		wrappedDataTypes[k] = wrapped
		
		// add static properties
		if (original.statics) {
			Object.keys(original.statics).forEach(k=> {
				wrapped[k] = original.statics[k](moduler)
			})
		}
	})

	return wrappedDataTypes
}


export default getDataTypes
