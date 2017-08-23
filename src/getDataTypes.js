import getFieldsNormaliser from './getFieldsNormaliser'

// helpers
const getListOf = plugins=> ({type: rawInnerType})=> module=> {
	const innerType = typeof rawInnerType !== 'function' ? rawInnerType
		: rawInnerType({module})

	const newType = {}
	plugins.forEach(({namespace, dataTypes={}})=> {
		const {LIST: pluginLIST} = dataTypes
		if (!pluginLIST || !pluginLIST.of) return
		newType[namespace] = pluginLIST.of({
			innerType,
			ownInnerType: typeof innerType[namespace] === 'function'
				? innerType[namespace] : ()=> innerType[namespace],
		})(module)
	})

	return newType
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

const objectTypeCreator = _moduler=> fields=> {
	const fieldsNormaliser = getFieldsNormaliser(_moduler)
	const obj = {
		name: 'OBJECT-X',
		fields: fieldsNormaliser({fields}),
	}

	// helpers
	Object.defineProperty(obj, 'toString', {
		enumerable: false,
		value: moduleToString,
	})

	return {type: obj}
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
			of: ({plugins})=> {
				const fn = getListOf(plugins)
				return props=> ({type: fn(props)})
			},
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
