// @flow

import ValidationError from '../lib/ValidationError'

describe('ValidationError', ()=> {
	it('exists', ()=> expect(typeof ValidationError).toBe('function'))

	const myFun = ()=> {
		throw new ValidationError('expected something')
	}
	try { myFun() } catch (e) {

		it('throws message', ()=>
			expect(e.message).toBe('expected something'))
		it('correct stack', ()=>
			expect(e.stack.indexOf('myFun')>0).toBe(true))
		it.skip('instanceof Error', ()=> expect(e instanceof Error).toBe(true))
		it('instanceof ValidationError', ()=>
			expect(e instanceof ValidationError).toBe(true))
	}

	it('todo')
})
