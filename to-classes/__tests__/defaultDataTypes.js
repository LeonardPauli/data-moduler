// @flow

import {dataTypes} from '../data-moduler'

describe('default dataTypes', ()=> {
	const {DataType} = dataTypes

	it('ANY', ()=> { expect(dataTypes.ANY).not.toBe(undefined) })
	
	describe('STRING', ()=> {
		const {STRING} = dataTypes
		it('exists', ()=> expect(STRING).not.toBe(undefined))
		let type
		it('instantiates', ()=> expect(type = new STRING()).not.toBe(undefined))
		it('validates', ()=> expect(type.validate('asd')).toBe('asd'))
		it('validate throws', ()=> expect(()=> type.validate(4)).toThrow())
		it('validates regex')
		it('validates emoji')
	})
	
	describe('BOOLEAN', ()=> {
		it('exists', ()=> expect(dataTypes.BOOLEAN).not.toBe(undefined))
		it('validates')
	})
	
	describe('DECIMAL', ()=> {
		it('exists', ()=> expect(dataTypes.DECIMAL).not.toBe(undefined))
		it('validates')
	})
	
	describe('INT', ()=> {
		it('exists', ()=> expect(dataTypes.INT).not.toBe(undefined))
		it('validates')
	})
	
	describe('LIST', ()=> {
		it('exists', ()=> expect(dataTypes.LIST).not.toBe(undefined))
		it('validates')
	})
	
	describe('ENUM', ()=> {
		it('exists', ()=> expect(dataTypes.ENUM).not.toBe(undefined))
		it('validates')
	})
	
	describe('DATE', ()=> {
		it('exists', ()=> expect(dataTypes.DATE).not.toBe(undefined))
		it('validates')
	})
	
	describe('MODULE', ()=> {
		it('exists', ()=> expect(dataTypes.MODULE).not.toBe(undefined))
		it('validates')
	})
	
	describe('SELF', ()=> {
		it('exists', ()=> expect(dataTypes.SELF).not.toBe(undefined))
		it('validates')
	})
	
	describe('OBJECT', ()=> {
		it('exists', ()=> expect(dataTypes.OBJECT).not.toBe(undefined))
		it('validates')
	})
	
	describe('URL', ()=> {
		it('exists', ()=> expect(dataTypes.URL).not.toBe(undefined))
		it('validates')
	})
	
	describe('EMAIL', ()=> {
		it('exists', ()=> expect(dataTypes.EMAIL).not.toBe(undefined))
		it('validates')
	})
})
