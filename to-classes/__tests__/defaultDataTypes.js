// @flow

import {dataTypes, DataModule, modulate} from '../data-moduler'

describe('default dataTypes', ()=> {
	it('ANY', ()=> { expect(dataTypes.ANY).not.toBe(undefined) })
	
	describe('STRING', ()=> {
		const {STRING} = dataTypes
		it('exists', ()=> expect(STRING).not.toBe(undefined))
		it('instantiates', ()=> expect(new STRING()).not.toBe(undefined))
		const type = new STRING()
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
		const {DECIMAL} = dataTypes
		it('exists', ()=> expect(DECIMAL).not.toBe(undefined))
		const type = new DECIMAL({min: -100, max: 100, maxExclusive: true})
		const e = v=> expect(()=> type.validate(v))
		it('validates number', ()=> e('sa').toThrow('expected number'))
		it('validates min inclusive', ()=> e(-100).not.toThrow())
		it('validates decimal', ()=> e(0.124).not.toThrow())
		it('validates min', ()=> e(-101).toThrow('too small'))
		it('validates max exclusive', ()=> e(100).toThrow('too large'))
		it('validates not max', ()=> e(99).not.toThrow())
	})
	
	describe('INT', ()=> {
		const {INT} = dataTypes
		it('exists', ()=> expect(INT).not.toBe(undefined))
		it('validates', ()=> {
			const type = new INT({min: -100})
			expect(()=> type.validate('sa')).toThrow('expected number')
			expect(()=> type.validate(21.34)).toThrow('expected integer')
			expect(()=> type.validate(21.00)).not.toThrow()
			expect(()=> type.validate(100)).not.toThrow()
			expect(()=> type.validate(-23)).not.toThrow()
			expect(()=> type.validate(-123)).toThrow()
		})
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
		const {MODULE} = dataTypes
		it('exists', ()=> expect(MODULE).not.toBe(undefined))
		@modulate class A extends DataModule { static fields = { age: Number } }
		@modulate class B extends DataModule { static fields = { a: {A} } }
		it('modulate recognizes modules', ()=> {
			// $FlowFixMe
			expect(B.fields.a instanceof MODULE).toBe(true)
		})
		it('validates', ()=> {
			expect(()=> B.validate({a: {age: 12}})).not.toThrow()
			expect(()=> B.validate({a: {age: 'ss'}})).toThrow('expected number')
		})
	})
	
	describe('SELF', ()=> {
		const {SELF} = dataTypes
		it('exists', ()=> expect(SELF).not.toBe(undefined))
		@modulate class A extends DataModule { static fields = { a: {SELF, allowNull: true} } }
		it('validates', ()=> {
			// $FlowFixMe
			expect(A.fields.a.Module).toBe(A)
			expect(()=> A.validate({a: {a: null}})).not.toThrow()
		})
	})
	
	describe('OBJECT', ()=> {
		const {OBJECT} = dataTypes
		it('exists', ()=> expect(OBJECT).not.toBe(undefined))
		it('instantiates', ()=> expect(OBJECT.of({})).not.toBe(undefined))
		const type = OBJECT.of({age: Number})
		it('validates', ()=> expect(type.validate({age: 10})).toMatchObject({age: 10}))
		it('validate throws', ()=> expect(()=> type.validate(4)).toThrow('expected object'))
		it('validate inner throws', ()=> expect(()=>
			type.validate({age: 'aa'})).toThrow('expected number'))
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
