const dataTypes = {}
export default dataTypes

class DataType {
	allowNull = {default: false}
	defaultValue = undefined
	ofInput = undefined // used in some data types

	toJSON () {
		return {
			allowNull: this.allowNull,
			defaultValue: this.defaultValue,
			ofInput: this.ofInput,
		}
	}

	static supportsOfInput = false
	static of (ofInput, config={}) {
		return new this({...config, ofInput})
	}

	constructor (config = {}) {
		const {allowNull, default: defaultValue, ofInput} = config

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

		if (ofInput!==void 0) {
			if (!this.constructor.supportsOfInput)
				throw new Error(`datatype ${this.constructor.name} doesn't support ofInput`)
			this.ofInput = ofInput
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

	static addConverter ({ name, type, toType, fromType, to, from }) {
		if (!name) throw new Error(`${this.name}.addConverter: name is missing`)

		// ORG.$name
		if (type) Object.defineProperty(this, `$${name}`, { value: type })
		// org.asName.bind(org): ()=> new type
		if (toType) Object.defineProperty(this.prototype, `as${name}`, { value: toType })
		// ORG.newFromName.bind(ORG): typeInstance=> new ORG
		if (fromType) Object.defineProperty(this, `newFrom${name}`, { value: fromType })
		// org.toName.bind(org): value=> myValue
		if (to) Object.defineProperty(this.prototype, `to${name}`, { value: to })
		// org.fromName.bind(org): myValue=> value
		if (from) Object.defineProperty(this.prototype, `from${name}`, { value: from })
	}
}

const helpers = {
	DataType,
	findMatchingType: (value, key)=> dataTypes.asList.find(d=> d.matchesRawType(value, key)),
	getType: (rawType, key)=> rawType instanceof DataType
		? rawType: dataTypes.findMatchingType(rawType, key),

	// normalize type field into type instance
	getTypeInstance: (objectOrRawType, {Module})=> {

		// new STRING({...config})
		if (objectOrRawType instanceof DataType)
			return objectOrRawType

		// String | STRING | User | ...
		if (typeof objectOrRawType!=='object') {
			const Type = dataTypes.findMatchingType(objectOrRawType)
			if (!Type) throw new Error(`no matching data type found for ${objectOrRawType}`)
			return new Type({Module})
		}

		// {type: String, ...config}
		if (objectOrRawType.type!==void 0) {
			const {type, ...config} = objectOrRawType
			const Type = dataTypes.findMatchingType(type)
			if (!Type) throw new Error(`no matching data type found for ${objectOrRawType}`)
			return new Type({...config, Module})
		}
		
		// {String, ...config}
		const config = {}
		const Type = Object.keys(objectOrRawType).reduce((p, k)=> {
			const val = objectOrRawType[k]
			const ret = p || dataTypes.findMatchingType(val, k)
			if (p) config[k] = val
			return ret
		}, null)
		if (!Type) throw new Error(`no matching data type found for ${objectOrRawType}`)
		return new Type({...config, Module})
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
