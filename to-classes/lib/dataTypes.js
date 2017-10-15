// @flow
import {type DataModuleClassType} from './DataModule'

type baseValidationOpt = {
	usageType?: string,
}
type baseConfigOpt = {
	allowNull?: boolean | Object,
	default?: *,
	ofInput?: *,
}
export class DataType<
	extraConfigOpt: Object = {}, // eslint-disable-line no-unused-vars
	extraValidationOpt: Object = {}, // eslint-disable-line no-unused-vars
	validationOpt: baseValidationOpt = baseValidationOpt & extraValidationOpt,
	configOpt: baseConfigOpt & {validateOpt?: Object} =
		baseConfigOpt & {validateOpt?: validationOpt} & extraConfigOpt,
> {
	name: string
	allowNull = {default: false}
	defaultValue = undefined
	ofInput = undefined // used in some data types

	toJSON () {
		return {
			allowNull: this.allowNull,
			default: this.defaultValue,
			ofInput: this.ofInput,
		}
	}

	static supportsOfInput = false
	static of (ofInput, config?: configOpt) {
		if (config) return new this({...config, ofInput})
		// $FlowFixMe
		return new this({ofInput})
	}

	constructor (config?: configOpt) {
		const {allowNull, default: defaultValue, ofInput, validateOpt} = config || {}

		if (allowNull!==void 0) {
			if (typeof allowNull === 'boolean')
				this.allowNull = {default: allowNull}
			else if (typeof allowNull === 'object')
				this.allowNull = allowNull
			else throw new Error(`typeof allowNull === ${typeof allowNull}, `
				+'but expected undefined, boolean, or object')
		} else if (defaultValue===null)
			this.allowNull = {default: true}

		if (defaultValue!==void 0) {
			// $FlowFixMe
			this.validate(defaultValue, validateOpt) // will throw if validation error
			this.defaultValue = defaultValue // because it can be a factor function
		}

		if (ofInput!==void 0) {
			if (!this.constructor.supportsOfInput)
				throw new Error(`datatype ${this.constructor.name} doesn't support ofInput`)
			this.ofInput = ofInput
		}

	}

	validate (value: *, opt: validationOpt) {
		const {usageType = 'default'} = opt || {}
		const {defaultValue} = this
		const allowNull = typeof this.allowNull[usageType] === 'boolean'
			? this.allowNull[usageType]: this.allowNull.default

		// handle null value / default value
		const val = value!==void 0? value:
			typeof defaultValue==='function' ? defaultValue(): defaultValue
		if (val===void 0 || val===null) {
			if (allowNull) return null // val
			throw new Error(`value=${String(val)} but allowNull=${String(allowNull)}`)
		}

		return val
	}

	// could be used to dynamically match, eg. see MODULE data type
	// 	or for native type aliases, eg. see STRING data type
	static matchesRawType (value, key: ?string) {
		if (value && value.constructor === this) return true
		if (value === this) return true
		if (key==this.name) return true
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
export type DataTypeType<extraConfigOpt = {}, extraValidationOpt = {}> =
	DataType<extraConfigOpt, extraValidationOpt>



// normalize type field into type instance
export const getTypeInstance = (
	objectOrRawTypeOrType: DataType<*> | Object,
	{Module}: {Module?: DataModuleClassType} = {}
): DataType<*>=> {

	// new STRING({...config})
	if (objectOrRawTypeOrType instanceof DataType)
		return objectOrRawTypeOrType

	// eslint-disable-next-line no-extra-parens
	const objectOrRawType = (objectOrRawTypeOrType: Object)

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
		if (!Type) throw new Error(`no matching data type found for ${String(objectOrRawType)}`)
		return new Type({...config, Module})
	}
		
	// {String, ...config}
	const config = {}
	const Type = Object.keys(objectOrRawType).reduce((p, k)=> {
		const val = objectOrRawType[k]
		let ret = p
		if (!ret) {
			ret = dataTypes.findMatchingType(val, k)
			if (ret) config.matchedValue = val
		}
		config[k] = val
		return ret
	}, null)
	if (!Type) throw new Error(`no matching data type found for ${String(objectOrRawType)}`)

	return new Type({...config, Module})
}


const registerDataType = (dataType: Class<DataType<*, *>>)=> {
	if (!DataType.isPrototypeOf(dataType))
		throw new Error('dataType wasn\'t subclass of DataType')

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

// Object.defineProperty(dataTypes, 'allAliases', { get: ()=>
// 	dataTypes.asList.reduce((a, d)=> a.concat(d.aliases), []) })

const findMatchingType = (value: *, key: ?string)=>
	dataTypes.asList.find(d=> d.matchesRawType(value, key))

const getType = <T: Object>(rawType: DataTypeType<T> | Object, key: ?string): ?DataTypeType<T>=>
	rawType instanceof DataType ? rawType: dataTypes.findMatchingType(rawType, key)



type dataTypesType = {
	DataType: typeof DataType,
	getTypeInstance: typeof getTypeInstance,
	registerDataType: typeof registerDataType,
	findMatchingType: typeof findMatchingType,
	getType: typeof getType,
	asList: ()=> Array<DataTypeType<*>>,
	[key: string]: Class<DataType<*, *>>,
}
const dataTypes: dataTypesType = ((Object.defineProperties({}, { // eslint-disable-line no-extra-parens
	DataType: { value: DataType },
	getTypeInstance: { value: getTypeInstance },
	registerDataType: { value: registerDataType },
	findMatchingType: { value: findMatchingType },
	getType: { value: getType },
	asList: ({ // eslint-disable-line no-extra-parens
		get: ()=> Object.keys(dataTypes).map(k=> dataTypes[k]),
	}: Object),
}): any): dataTypesType)
export default dataTypes
