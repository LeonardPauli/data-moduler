import {flags} from '../data-moduler'

describe('flags', ()=> {
	it('is initialized', ()=> expect(flags.allowNull).toBe(true))
	describe('registration', ()=> {
		it('registers', ()=> {
			flags.registerFlag('myFlag', 87)
			expect(flags.myFlag).toBe(87)
		})
		it('skipps re-registration', ()=> {
			flags.registerFlag('myFlag', 87)
		})
		it('throws on overwrite', ()=> {
			expect(()=> flags.registerFlag('myFlag', 33)).toThrow()
		})
	})
})

describe('plugins')
describe('destinations')
describe('actions')
describe('modulate')
describe('moduleModifications')
describe('context')
describe('ValidationError')
