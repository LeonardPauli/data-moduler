const dataTypes = {}
export default dataTypes

class DataType {
	allowNull = {default: false}
	defaultValue = undefined

	constructor (config = {}) {
		const {allowNull, default: defaultValue} = config

		if (allowNull!==void 0) {
			if (typeof allowNull === 'boolean')
				this.allowNull = {default: allowNull}
			else if (typeof allowNull === 'object')
				this.allowNull = allowNull
			else throw new Error(`typeof allowNull === ${typeof allowNull}, `
				+`but expected undefined, boolean, or object`)
		} else if (this.defaultValue===null)
			this.allowNull = {default: true}

		if (defaultValue!==void 0) {
			this.defaultValue = this.validate(defaultValue)
			// if (defaultValue===null && !this.allowNull.default)
			// 	throw new Error('!allowNull but defaultValue=null? '
			// 		+'set defaultValue to undefined or change/remove allowNull property')
		}

	}

	validate (value, {usageType = 'default'} = {}) {
		const {defaultValue} = this
		const allowNull = typeof this.allowNull[usageType] === 'boolean'
			? this.allowNull[usageType]: this.allowNull.default

		// handle null value / default value
		const val = value!==void 0? value:
			typeof defaultValue==='function' ? defaultValue(): defaultValue
		if (val===void 0 || val===null) {
			if (allowNull) return val
			throw new Error(`value=${val} but allowNull=${allowNull}`)
		}

		return val
	}

	// could be used to dynamically match, eg. see MODULE data type
	// 	or for native type aliases, eg. see STRING data type
	static matchesRawType (value, key) {
		if (value instanceof this) return true
		if (key==this.name) return this
		return false
	}

	static addConverter ({ target, targetName, from, to }) {
		const name = targetName || (target && target.name)
		if (!name) throw new Error(`${this.name}.addConverter: name is missing`)

		if (target) Object.defineProperty(this, `$${name}`, { value: target })
		if (to) Object.defineProperty(this.prototype, `to${name}`, { value: to })
		if (from) Object.defineProperty(this.prototype, `from${name}`, { value: from })
	}
}

const helpers = {
	DataType,
	findMatchingType: (value, key)=> dataTypes.asList.find(d=> d.matchesRawType(value, key)),
	getType: (rawType, key)=> rawType instanceof DataType
		? rawType: dataTypes.findMatchingType(rawType, key),

	// normalize type field into type instance
	getTypeInstance: (objectOrRawType, key)=> {
		// new STRING({...config})
		if (objectOrRawType instanceof DataType)
			return objectOrRawType

		// String | STRING | User | ...
		if (typeof objectOrRawType!=='object')
			return dataTypes.findMatchingType(objectOrRawType)
		Object.keys()

		// TODO: check cases:
		// - {String, ...config}
		// - {type: String, ...config}
		// 	const type = dataTypes.findMatchingType(String)
		// 	if (!type) throw ...
		// 	-> new type(config)
		// - {String, type: INT, otherField: Number, ...config} -> new INT(config)

	},
}

Object.keys(helpers).forEach(k=>
	Object.defineProperty(dataTypes, k, {value: helpers[k]}))


const registerDataType = dataType=> {
	if (!(dataType instanceof DataType))
		throw new Error(`dataType wasn't instanceof DataType`)

	const {name} = dataType
	if (typeof name !== 'string' || name.length==0)
		throw new Error('name required')

	if (dataTypes[name]) {
		if (dataTypes[name]==dataType) return
		throw new Error(`different dataType with name ${name} already registered`)
	}

	// const {allAliases} = dataTypes
	// const duplicateAliases = dataType.aliases.filter(a=> allAliases.indexOf(a)>=0)
	// if (duplicateAliases.length)
	// 	throw new Error(`dataType.aliases(${duplicateAliases}) has `
	// 		+`already been taken by other data type`)

	dataTypes[name] = dataType
}

Object.defineProperty(dataTypes, 'registerDataType', { value: registerDataType })

Object.defineProperty(dataTypes, 'asList', { get: ()=>
	Object.keys(dataTypes).map(k=> dataTypes[k]) })
// Object.defineProperty(dataTypes, 'allAliases', { get: ()=>
// 	dataTypes.asList.reduce((a, d)=> a.concat(d.aliases), []) })
