/* eslint no-unused-vars: 0 */

import {dataTypes, DataModule} from '../index'
const {DataType, registerDataType, getType} = dataTypes


@registerDataType class ANY extends DataType {}


// String

@registerDataType class STRING extends DataType {
	static matchesRawType (value, key) {
		return value===String || super.matchesRawType(value, key)
	}
	validate (value, opt) {
		const val = super.validate(value, opt)
		if (typeof val!=='string')
			throw new Error(`expected string, but typeof val==='${typeof val}'`)
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
	innerType = ANY

	static matchesRawType (value, key) {
		if (value===Array) return true
		if (value instanceof Array) {
			if (value.length===1 || value.length===0) return true
			return false
		}
		return super.matchesRawType(value, key)
	}

	static of (innerType) {
		innerType
		throw new Error('TODO')
	}
}

@registerDataType class ENUM extends DataType {
	values = []

	constructor (config = {}) {
		super(config)

		const {input} = config
		if (input) {
			if (!(input instanceof Array))
				throw new Error(`input should be array of primitive `
					+`values that are allowed, was '${input}'`)
			this.values = [...input]
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
		const {returnIndex} = opt
		const {values} = this
		const idx = values.indexOf(val)
		if (idx==-1) throw new Error(`'${val}' not in enum allowed values (${values})`)
		return returnIndex? idx: val
	}

	static of (values) {
		return new this({input: values})
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
			throw new Error(`date is invalid`)

		return dateVal
	}
}



// Module / object

@registerDataType class MODULE extends DataType {
	static matchesRawType (value, key) {
		// key[0]===key[0].toUpperCase()
		// value._isModule
		if (value instanceof DataModule) return true
		return super.matchesRawType(value, key)
	}

	validate (value, opt) {
		const val = super.validate(value, opt)
		throw new Error('TODO')
		// return val
	}

	static of () {
		// moduleTypeUnwrapper
		throw new Error('TODO')
	}
}

@registerDataType class SELF extends DataType {
	// moduleTypeUnwrapper

	// todo: how is this supposed to work?

	validate (value, opt) {
		const val = super.validate(value, opt)
		throw new Error('TODO')
		// return val
	}
}

// OLD NOTE: JSON/JSONB/etc, or just nested fields;
// 	For validation/doc: OBJECT.of({field:type, ...})
@registerDataType class OBJECT extends DataType {
	static matchesRawType (value, key) {
		return value===Object || super.matchesRawType(value, key)
	}

	validate (value, opt) {
		const val = super.validate(value, opt)
		throw new Error('TODO')
		// return val
	}

	static of () {
		// objectTypeCreator
		throw new Error('TODO')
	}
}



// Misc

// @registerDataType class URL extends STRING {}

// @registerDataType class EMAIL extends STRING {}

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
