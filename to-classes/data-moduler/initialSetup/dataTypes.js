/* eslint no-unused-vars: 0 */
// @flow

import DataModule, {validateAgainstFields, type DataModuleClassType} from '../DataModule'
import dataTypes, {DataType} from '../dataTypes'
const {registerDataType, getType} = dataTypes

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

		const {disallowEmoji} = config
		if (disallowEmoji!==void 0) {
			if (typeof disallowEmoji !== 'boolean')
				throw new Error(`disallowEmoji: expected boolean, got ${typeof disallowEmoji}`)
			this.disallowEmoji = disallowEmoji
		}

		const {regex} = config
		if (regex!==void 0) {
			if (!(regex instanceof RegExp))
				throw new Error(`regex: expected instanceof RegExp (got ${regex})`)
			this.regex = regex
		}
	}

	static matchesRawType (value, key) {
		return value===String || super.matchesRawType(value, key)
	}
	validate (value, opt) {
		const val = super.validate(value, opt)
		if (typeof val!=='string')
			throw new Error(`expected string, but typeof val==='${typeof val}'`)
		if (this.disallowEmoji && this.constructor.emojiRegex.test(val))
			throw new Error(`disallowEmoji=${this.disallowEmoji}, but string contained emoji`)
		if (this.regex && !this.regex.test(val))
			throw new Error('value failed regex validation')
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
		throw new Error(`expected boolean, but val!=!!val (val=${val})`)
	}
}

@registerDataType class DECIMAL extends DataType {
	static matchesRawType (value, key) {
		return value===Number || super.matchesRawType(value, key)
	}
	validate (value, opt) {
		const val = super.validate(value, opt)
		if (val*1!=val)
			throw new Error(`expected number, but val!=val*1 (${val}!=${val*1})`)
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
		throw new Error(`expected integer, but val!=Math.floor(val) (${val}!=${Math.floor(val)})`)
	}
}



// Lists

@registerDataType class LIST extends DataType {
	innerType: DataType<*> = new ANY()

	static supportsOfInput = true
	constructor (config = {}) {
		super(config)

		const {ofInput: rawInnerType} = config
		if (rawInnerType) {
			const innerType = getType(rawInnerType)
			if (!innerType) throw new Error('no matching type '
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

		const {ofInput} = (config || {})
		if (ofInput) {
			if (!(ofInput instanceof Array))
				throw new Error('ofInput should be array of primitive '
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
		if (idx==-1) throw new Error(`'${val}' not in enum allowed values (${String(values)})`)
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
			throw new Error(`expected number/string/Date, but got typeof val==='${typeof val}'`)

		const dateVal = new Date(val)
		if (isNaN(dateVal.getTime()))
			throw new Error('date is invalid')

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

		const {ofInput: innerModule} = config
		if (!innerModule)
			throw new Error('ofInput/innerModule is required')
		if (!innerModule._isModule)
			throw new Error(`ofInput/innerModule has to be a DataModule subclass (got ${innerModule})`)
		this.innerModule = innerModule
	}

	static matchesRawType (value, key) {
		// key[0]===key[0].toUpperCase()
		// value._isModule
		// new value() instanceof DataModule
		let superClass = value
		while (superClass) {
			if (superClass === DataModule) return true
			superClass = superClass.prototype
		}
		if (value._isModule) return true
		return super.matchesRawType(value, key)
	}

	validate (value, opt) {
		const val = super.validate(value, opt)
		// if (!(value instanceof this.innerModule))
		// 	throw new Error(`expected value to be instance of ${this.innerModule.name}, `
		// 		+`but got (${typeof value}, ${value && value.constructor && value.constructor.name})`)

		return this.innerModule.validate(value, opt)
	}
}

@registerDataType class SELF extends DataType<{
	Module: DataModuleClassType,
}, *> {
	validate (value, opt) {
		const val = super.validate(value, opt)
		const {Module} = opt

		if (!Module)
			throw new Error('opt.Module is required')
		if (!Module._isModule)
			throw new Error(`opt.Module has to be a DataModule subclass (got ${Module})`)

		return Module.validate(value, opt)
	}
}

// OLD NOTE: JSON/JSONB/etc, or just nested fields;
// 	For validation/doc: OBJECT.of({field:type, ...})
@registerDataType class OBJECT extends DataType {
	objectName = undefined // used by some destinations, ie. graphql, needs to be unique

	toJSON () {
		return { ...super.toJSON(), objectName: this.objectName }
	}

	static supportsOfInput = true
	constructor (config) {
		super(config)

		const {ofInput: fields} = config
		if (!fields)
			throw new Error('ofInput/fields is required')
		if (typeof fields !== 'object')
			throw new Error(`ofInput/fields: expected object (got ${typeof fields})`)
		
		const {name: objectName} = config
		if (objectName !== void 0) {
			if (typeof objectName !== 'string' && typeof objectName !== 'function')
				throw new Error(`ofInput/name: expected string (or ()=> string) (got ${typeof objectName})`)
			this.objectName = objectName
		}
	}

	static matchesRawType (value, key) {
		return value===Object || super.matchesRawType(value, key)
	}

	validate (value, opt) {
		const {ofInput: fields} = this
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

		const {strictCheck} = config
		if (strictCheck!==void 0) {
			if (typeof strictCheck !== 'boolean')
				throw new Error(`strictCheck: expected boolean, got ${typeof strictCheck}`)
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
