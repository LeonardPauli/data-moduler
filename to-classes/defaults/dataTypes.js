/* eslint no-unused-vars: 0 */
// @flow

import DataModule, {validateAgainstFields, type DataModuleClassType} from '../lib/DataModule'
import dataTypes, {DataType} from '../lib/dataTypes'
import ValidationError from '../lib/ValidationError'
const {registerDataType, getType, getTypeInstance} = dataTypes

import {emojiRegex, emailRegexes} from './regexes'


@registerDataType class ANY extends DataType<*> {}


// String

@registerDataType class STRING extends DataType<{
	disallowEmoji?: boolean,
	regex?: RegExp,
}> {
	static emojiRegex = emojiRegex
	disallowEmoji = false
	regex = undefined

	toJSON () {
		return { ...super.toJSON(), disallowEmoji: this.disallowEmoji, regex: this.regex }
	}

	constructor (config) {
		super(config)
	
		const {disallowEmoji} = config || {}
		if (disallowEmoji!==void 0) {
			if (typeof disallowEmoji !== 'boolean')
				throw new ValidationError(`disallowEmoji: expected boolean, got ${typeof disallowEmoji}`)
			this.disallowEmoji = disallowEmoji
		}

		const {regex} = config || {}
		if (regex!==void 0) {
			if (!(regex instanceof RegExp))
				throw new ValidationError(`regex: expected instanceof RegExp (got ${regex})`)
			this.regex = regex
		}
	}

	static matchesRawType (value, key) {
		return value===String || super.matchesRawType(value, key)
	}
	validate (value, opt) {
		const val = super.validate(value, opt)
		if (typeof val!=='string')
			throw new ValidationError(`expected string, but typeof val==='${typeof val}'`)
		if (this.disallowEmoji && this.constructor.emojiRegex.test(val))
			throw new ValidationError(`disallowEmoji=${this.disallowEmoji}, but string contained emoji`)
		if (this.regex && !this.regex.test(val))
			throw new ValidationError('value failed regex validation')
		return val
	}
}



// Numbers

@registerDataType class BOOLEAN extends DataType {
	static matchesRawType (value, key) {
		return value===Boolean || super.matchesRawType(value, key)
	}
	validate (value, opt) {
		const val = super.validate(value, opt)
		if (!!val==val) return val
		throw new ValidationError(`expected boolean, but val!=!!val (val=${val})`)
	}
}

@registerDataType class DECIMAL extends DataType<{
	minExclusive?: boolean,
	min?: ?number,
	max?: ?number,
	maxExclusive?: boolean,
}> {
	minExclusive: boolean = false
	min: ?number = null
	max: ?number = null
	maxExclusive: boolean = false

	toJSON () {
		return { ...super.toJSON(),
			minExclusive: this.minExclusive,
			min: this.min, max: this.max,
			maxExclusive: this.maxExclusive,
		}
	}

	constructor (config) {
		super(config)

		const { minExclusive, min, max, maxExclusive } = config || {}
		if (typeof min=='number') this.min = min
		if (typeof max=='number') this.max = max
		if (typeof minExclusive=='boolean') this.minExclusive = minExclusive
		if (typeof maxExclusive=='boolean') this.maxExclusive = maxExclusive

	}

	static matchesRawType (value, key) {
		return value===Number || super.matchesRawType(value, key)
	}
	validate (value, opt) {
		const val = super.validate(value, opt)
		if (val*1!=val)
			throw new ValidationError(`expected number, but val!=val*1 (${val}!=${val*1})`)

		const { minExclusive, min, max, maxExclusive } = this
		if (typeof min=='number' && !(minExclusive? min < val: min <= val))
			throw new ValidationError((minExclusive
				? `value has to be larger than`
				: `value has to be at least`)+` ${String(max)}, but got ${val} (too small)`)

		if (typeof max=='number' && !(maxExclusive? val < max: val <= max))
			throw new ValidationError((maxExclusive
				? `value has to be less than`
				: `value has to be at most`)+` ${String(max)}, but got ${val} (too large)`)

		return val
	}
}

@registerDataType class INT extends DECIMAL {
	// static matchesRawType (value, key) {
	// 	// if (value===Number) return true
	// 	return super.matchesRawType(value, key)
	// }
	validate (value, opt) {
		const val = super.validate(value, opt)
		if (Math.floor(val)==val) return val
		throw new ValidationError(`expected integer, but val!=Math.floor(val) (${val}!=${Math.floor(val)})`)
	}
}



// Lists

@registerDataType class LIST extends DataType {
	innerType: DataType<*> = new ANY()

	static supportsOfInput = true
	constructor (config) {
		super(config)

		const {ofInput: rawInnerType} = config || {}
		if (rawInnerType) {
			const innerType = getType(rawInnerType)
			if (!innerType) throw new ValidationError('no matching type '
				+`found for ofInput/rawInnerType (${rawInnerType})`)
			this.innerType = innerType
		}
	}

	static matchesRawType (value, key) {
		if (value===Array) return true
		if (value instanceof Array) {
			if (value.length===1 || value.length===0) return true
			return false
		}
		return super.matchesRawType(value, key)
	}

	validate (value, opt) {
		return this.innerType.validate(value, opt)
	}
}

@registerDataType class ENUM extends DataType<*, {
	returnIndex?: boolean,
}> {
	values = []

	static supportsOfInput = true
	constructor (config) {
		super(config)

		const {ofInput} = config || {}
		if (ofInput) {
			if (!(ofInput instanceof Array))
				throw new ValidationError('ofInput should be array of primitive '
					+`values that are allowed, was '${ofInput}'`)
			this.values = [...ofInput]
		}
	}

	static matchesRawType (value, key) {
		if (value instanceof Array) {
			const primitives = [Boolean, Number, String]
			const allPrimitive = !value.some(v=>
				primitives.some(p=> !(v instanceof p))
			)
			return allPrimitive
		}
		return super.matchesRawType(value, key)
	}

	validate (value, opt) {
		const val = super.validate(value, opt)
		const returnIndex = (opt && opt.returnIndex===true) || false
		const {values} = this
		const idx = values.indexOf(val)
		if (idx==-1) throw new ValidationError(`'${val}' not in enum allowed values (${String(values)})`)
		return returnIndex? idx: val
	}
}



// Other built-in core types

@registerDataType class DATE extends DataType {
	static matchesRawType (value, key) {
		return value===Date || super.matchesRawType(value, key)
	}

	validate (value, opt) {
		const val = super.validate(value, opt)
		if (typeof val!=='number' && typeof val!=='string' && !(val instanceof Date))
			throw new ValidationError(`expected number/string/Date, but got typeof val==='${typeof val}'`)

		const dateVal = new Date(val)
		if (isNaN(dateVal.getTime()))
			throw new ValidationError('date is invalid')

		return dateVal
	}
}



// Module / object

@registerDataType class MODULE extends DataType<*, {
	Module: DataModuleClassType,
}> {
	innerModule: DataModuleClassType

	static supportsOfInput = true
	constructor (config) {
		super(config)

		const conf = config || {}
		const innerModule = conf.innerModule || conf.matchedValue
		if (!innerModule)
			throw new ValidationError('ofInput/innerModule is required')
		if (!innerModule._isModule)
			throw new ValidationError(`ofInput/innerModule has to be a DataModule subclass (got ${innerModule})`)
		this.innerModule = innerModule
	}

	static matchesRawType (value, key) {
		// key[0]===key[0].toUpperCase()
		// value._isModule
		// new value() instanceof DataModule
		const okWithModule = ()=> !key || key=='type' || key==value.name
		let superClass = value
		while (superClass) {
			if (superClass === DataModule) return okWithModule
			superClass = superClass.prototype
		}
		if (value._isModule) return okWithModule
		return super.matchesRawType(value, key)
	}

	validate (value, opt) {
		const val = super.validate(value, opt)
		// if (!(value instanceof this.innerModule))
		// 	throw new ValidationError(`expected value to be instance of ${this.innerModule.name}, `
		// 		+`but got (${typeof value}, ${value && value.constructor && value.constructor.name})`)

		return this.innerModule.validate(value, opt)
	}
}

@registerDataType class SELF extends DataType<{
	Module?: DataModuleClassType,
}, {
	Module?: DataModuleClassType,
}> {
	Module: ?DataModuleClassType = null

	constructor (config) {
		super(config)

		if (config && config.Module)
			this.Module = config.Module
	}

	validate (value, opt) {
		const val = super.validate(value, opt)
		// $FlowFixMe
		const Module = (opt || {}).Module || this.Module

		if (!Module)
			throw new ValidationError('opt.Module is required')
		if (!Module._isModule)
			throw new ValidationError(`opt.Module has to be a DataModule subclass (got ${Module})`)

		return !val? val: Module.validate(val, opt)
	}
}

// OLD NOTE: JSON/JSONB/etc, or just nested fields;
// 	For validation/doc: OBJECT.of({field:type, ...})
@registerDataType class OBJECT extends DataType {
	objectName = undefined // used by some destinations, ie. graphql, needs to be unique

	fields: {[string]: DataType<*>}
	getFields ({Module}) {
		const fields = this.ofInput
		const resFields = {}
		Object.keys(fields).forEach(fieldName=> {
			const objectOrRawType = fields[fieldName]
			const typeInstance = getTypeInstance(objectOrRawType, {Module})
			resFields[fieldName] = typeInstance
		})
		return resFields
	}

	toJSON () {
		return { ...super.toJSON(), objectName: this.objectName }
	}

	static supportsOfInput = true
	constructor (config) {
		super(config)

		const {ofInput: fields} = config || {}
		if (!fields)
			throw new ValidationError('ofInput/fields is required')
		if (typeof fields !== 'object')
			throw new ValidationError(`ofInput/fields: expected object (got ${typeof fields})`)

		// modulate fields
		this.fields = this.getFields(config || {})


		const {name: objectName} = config || {}
		if (objectName !== void 0) {
			if (typeof objectName !== 'string' && typeof objectName !== 'function')
				throw new ValidationError(`ofInput/name: expected string (or ()=> string) (got ${typeof objectName})`)
			this.objectName = objectName
		}
	}

	static matchesRawType (value, key) {
		return value===Object || super.matchesRawType(value, key)
	}

	validate (value, opt) {
		// TODO: should opt.Module override config.Module?
		const {fields} = this // this.getFields(opt)
		const val = super.validate(value, opt)
		// $FlowFixMe
		return validateAgainstFields(fields)(val, opt)
	}
}



// Misc

@registerDataType class URL extends STRING {}

@registerDataType class EMAIL extends STRING {
	constructor (config) {
		super(config)

		const {strictCheck} = config || {}
		if (strictCheck!==void 0) {
			if (typeof strictCheck !== 'boolean')
				throw new ValidationError(`strictCheck: expected boolean, got ${typeof strictCheck}`)
			const {simple, unicodeSupport, strict} = emailRegexes
			this.regex = !this.strictCheck? simple: this.allowEmoji? unicodeSupport: strict
		}
	}
}

// @registerDataType class GEOLOCATION extends OBJECT {}
// OLD NOTE:
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
