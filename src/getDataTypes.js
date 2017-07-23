// helpers
const getListOf = plugins=> ({type: rawInnerType})=> module=> {
	const innerType = typeof rawInnerType !== 'function' ? rawInnerType
		: rawInnerType({module})

	const newType = {}
	plugins.forEach(({namespace, dataTypes: {LIST: pluginLIST}})=> {
		if (!pluginLIST || !pluginLIST.of) return
		newType[namespace] = pluginLIST.of({
			innerType,
			ownInnerType: typeof innerType[namespace] === 'function'
				? innerType[namespace] : ()=> innerType[namespace],
		})(module)
	})

	return newType
}



// defaultDataTypes
const defaultDataTypes = {
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
	SELF: module=> module.type,
	MODULE: {
		statics: {
			of: _moduler=> module=> ({module}),
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
	OBJECT: {}, // JSON or JSONB, etc
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
		const wrapped = { type: original }
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
