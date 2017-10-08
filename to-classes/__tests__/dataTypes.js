import {dataTypes} from '../data-moduler'
describe('dataTypes', ()=> {
	const {DataType} = dataTypes
	describe('DataType', ()=> {
		it('is defined', ()=> expect(typeof DataType).toBe('function'))
		
	})
	const {getTypeInstance} = dataTypes
	describe('getTypeInstance', ()=> {
		it('is defined', ()=> expect(typeof getTypeInstance).toBe('function'))

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
	
	describe('asList', ()=> {
		const list = dataTypes.asList
		it('is defined', ()=> expect(Array.isArray(list)).toBe(true))

	})
})
