// @flow
/* eslint-disable max-nested-callbacks */

import {dataTypes} from '../data-moduler'
describe('dataTypes', ()=> {
	const {DataType} = dataTypes
	describe('DataType', ()=> {
		it('is defined', ()=> expect(typeof DataType).toBe('function'))
		it('allows subclassing', ()=> {
			class MyType extends DataType {}
			class MyOtherType extends MyType {}
			expect(DataType.isPrototypeOf(MyOtherType))
			expect(MyOtherType.name).toBe('MyOtherType')
		})
		describe('default config', ()=> {
			it('new X()', ()=> { new DataType() }) // eslint-disable-line no-new
			it('normalises allowNull', ()=> {
				expect(new DataType().allowNull).toMatchObject({default: false})
				expect(new DataType({}).allowNull).toMatchObject({default: false})
				expect(new DataType({ allowNull: false }).allowNull).toMatchObject({default: false})
				expect(new DataType({ allowNull: true }).allowNull).toMatchObject({default: true})
				expect(new DataType({ default: 5 }).allowNull).toMatchObject({default: false})
			})
			it('default: null -> allowNull: true', ()=> {
				expect(new DataType({ default: null }).allowNull).toMatchObject({default: true})
			})
			it('default value', ()=> {
				expect(()=> new DataType({ default: null, allowNull: false })).toThrow()
				expect(new DataType({ default: null, allowNull: true }).defaultValue).toBe(null)
				expect(new DataType({ default: 5, allowNull: true }).defaultValue).toBe(5)
				expect(new DataType({ default: 5 }).defaultValue).toBe(5)
				expect(new DataType().defaultValue).toBe(undefined)
			})
			it('ofInput throws if not supported', ()=> {
				expect(()=> new DataType({ ofInput: 5 })).toThrow()
				class MyType extends DataType {
					static supportsOfInput = true
				}
				expect(new MyType({ ofInput: 5 }).ofInput).toBe(5)
			})

			// useful to export config, change it, then recreate type from new config
			describe('toJSON', ()=> {
				describe('without ofInput', ()=> {
					const org = {
						allowNull: {default: true, plugin: false },
						default: 55,
					}
					const json = new DataType(org).toJSON()
					it('exports', ()=> expect(json).toMatchObject(org))
					it('ofInput undefined', ()=> expect(json.ofInput).toBe(undefined))
				})
				describe('with ofInput', ()=> {
					const org = { ofInput: 5 }
					class MyType extends DataType {
						static supportsOfInput = true
					}
					const json = new MyType(org).toJSON()
					it('exports', ()=> expect(json).toMatchObject(org))
				})
			})
		})

		describe('default validation', ()=> {
			const allowNull = true
			it('returns input', ()=> expect(new DataType().validate(5)).toBe(5))
			it('prevents null/undefined', ()=> {
				expect(()=> new DataType().validate(undefined)).toThrow()
				expect(()=> new DataType().validate(null)).toThrow()
			})
			it('return null if allowNull and null/undefined', ()=> {
				expect(new DataType({allowNull}).validate(null)).toBe(null)
				expect(new DataType({allowNull}).validate(undefined)).toBe(null)
			})
			// it('return default value if exists and null/undefined', ()=> {
			// 	expect(new DataType({default: 5}).validate(null)).toBe(5)
			// 	expect(new DataType({default: 5}).validate(undefined)).toBe(5)
			// })
			it('return default on undefined, throw on null', ()=> {
				expect(()=> new DataType({default: 5}).validate(null)).toThrow()
				expect(new DataType({default: 5}).validate(undefined)).toBe(5)
			})
			it('return default on undefined, null on null (allowNull)', ()=> {
				expect(new DataType({default: 5, allowNull}).validate(null)).toBe(null)
				expect(new DataType({default: 5, allowNull}).validate(undefined)).toBe(5)
			})
			describe('default value as factory function', ()=> {
				it('invokes the funtion', ()=>
					expect(new DataType({default: ()=> 5}).validate(undefined)).toBe(5))
				it('default on undefined, null on null (allowNull)', ()=> {
					expect(new DataType({default: ()=> 5, allowNull}).validate(null)).toBe(null)
					expect(new DataType({default: ()=> 5, allowNull}).validate(undefined)).toBe(5)
				})
				it('returns new values (not referencing the same)', ()=> {
					const type = new DataType({default: ()=> ({a: 4 })})
					expect(type.validate(undefined)).toMatchObject({a: 4})
					expect(type.validate(undefined)).not.toBe(type.validate(undefined))
				})
			})


			describe('subclass custom validation', ()=> {
				class MyType extends DataType {
					validate (value, opt) {
						const val = super.validate(value, opt)
						if (!val) return val
						if (val[0] !== '!')
							throw new Error(`expected ! as first char, got ${val[0]}`)
						return val
					}
				}
				const type = new MyType()
				it('uses super logic', ()=>
					expect(type.validate('!a')).toBe('!a'))
				it('uses own logic', ()=>
					expect(()=> type.validate('a')).toThrow())
				it('uses super logic for allowNull/default value', ()=>
					expect(new MyType({default: '!a'}).validate(undefined)).toBe('!a')
				)
				it('throws on faulty', ()=>
					expect(()=> type.validate('hall'))
						.toThrow('expected ! as first char, got h'))
				it('returns (parsed?) value if correct', ()=>
					expect(type.validate('!hall')).toBe('!hall'))
			})
		})

		describe('MyType.of(value) support', ()=> {
			class MyType extends DataType {
				static supportsOfInput = true
			}
			it('sets config with ofInput', ()=> {
				expect(MyType.of(5).toJSON()).toMatchObject(new MyType({ ofInput: 5 }).toJSON())
				expect(MyType.of(5, { allowNull: true, default: 10 }).toJSON())
					.toMatchObject(new MyType({ ofInput: 5, allowNull: true, default: 10 }).toJSON())
			})
		})

		describe('matchesRawType', ()=> {
			class MyType extends DataType {}
			class MyOtherType extends DataType {
				static matchesRawType (value, key) {
					return typeof value === 'number' || super.matchesRawType(value, key)
				}
			}
			it('matches instanceof', ()=> expect(MyType.matchesRawType(MyType)).toBe(true))
			it('not matches super', ()=> expect(MyType.matchesRawType(DataType)).toBe(false))
			it('not matches sibling', ()=> expect(MyType.matchesRawType(MyOtherType)).toBe(false))
			it('matches on key', ()=> expect(MyType.matchesRawType(null, 'MyType')).toBe(true))
			it('not matches on wrong key', ()=>
				expect(MyType.matchesRawType(null, 'MyOtherType')).toBe(false))

			it('matches (dynamic) subclass condition', ()=>
				expect(MyOtherType.matchesRawType(3)).toBe(true))
		})

		// TODO: put plugins/example as a test to make sure it's up to date
		describe('converters', ()=> {
			class OrgType extends DataType {}
			it('requires name', ()=> expect(()=> OrgType.addConverter({})).toThrow(/name is missing/))

			class Bark { canBeNull: boolean; constructor (a: boolean) { this.canBeNull = a } }
			OrgType.addConverter({
				name: 'Bark',
				type: Bark,
				toType () { return new Bark(this.allowNull.default) },
				fromType: typeInstance=> new OrgType({allowNull: typeInstance.canBeNull}),
				to: value=> '!'+value,
				from: myValue=> myValue.substr(1),
			})
			
			// $FlowFixMe
			it('sets ORG.$name (type)', ()=> expect(OrgType.$Bark).toBe(Bark))
			it('sets org.asName.bind(org) (toType)', ()=>
				expect(new OrgType({allowNull: true}).asBark().canBeNull).toBe(true))
			it('sets ORG.newFromName.bind(ORG) (fromType)', ()=>
				// $FlowFixMe
				expect(OrgType.newFromBark(new Bark(true)).allowNull.default).toBe(true))
			it('sets org.toName.bind(org) (to)', ()=>
				expect(new OrgType().toBark('hello')).toBe('!hello'))
			it('sets org.fromName.bind(org) (from)', ()=>
				expect(new OrgType().fromBark('!hello')).toBe('hello'))
		})

	})
	
	describe('asList', ()=> {
		const list = dataTypes.asList
		it('is defined', ()=> expect(Array.isArray(list)).toBe(true))
		it('has only DataType subclasses', ()=> {
			list.forEach(item=> expect(DataType.isPrototypeOf(item)).toBe(true))
		})
	})

	const {getTypeInstance} = dataTypes
	describe('getTypeInstance', ()=> {
		it('is defined', ()=> expect(typeof getTypeInstance).toBe('function'))

		describe('formatting variations', ()=> {
			const {STRING} = dataTypes
			const toTest = {
				'{STRING}': {STRING},
				'{STRING: null}': {STRING: null},
				'{String}': {String},
				'{type: STRING}': {type: STRING},
				'{type: String}': {type: String},
				STRING,
				String,
			}
			Object.keys(toTest).forEach((key, i)=> it(`alt ${String(i)}: ${key}`, ()=> {
				const type = getTypeInstance(toTest[key])
				expect(type instanceof STRING).toBe(true)
			}))

			describe('with config', ()=> {
				const {STRING} = dataTypes
				const config = {allowNull: true, regex: /a/}
				const toTest = {
					'{STRING, ...config}': {STRING, ...config},
					'{STRING: null, ...config}': {STRING: null, ...config},
					'{String, ...config}': {String, ...config},
					'{type: STRING, ...config}': {type: STRING, ...config},
					'{type: String, ...config}': {type: String, ...config},
				}
				Object.keys(toTest).forEach((key, i)=> it(`alt ${String(i)}: ${key}`, ()=> {
					const type = getTypeInstance(toTest[key])
					expect(type.allowNull.default).toBe(true)
					expect(type.toJSON().regex.toString()).toBe('/a/')
				}))
			})
		})
	})
	const {registerDataType} = dataTypes
	describe('registerDataType', ()=> {
		it('is defined', ()=> expect(typeof registerDataType).toBe('function'))

	})
	const {findMatchingType} = dataTypes
	describe('findMatchingType', ()=> {
		it('is defined', ()=> expect(typeof findMatchingType).toBe('function'))

	})
	const {getType} = dataTypes
	describe('getType', ()=> {
		it('is defined', ()=> expect(typeof getType).toBe('function'))

	})
})
