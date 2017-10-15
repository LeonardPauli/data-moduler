// @no-flow
// TODO: add flow plugin that generates lib defs from DataModule

import {DataModule, dataTypes, modulate} from 'data-moduler'

describe('modulate', ()=> {
	it('exists', ()=> expect(typeof modulate).toBe('function'))
	

	class MyEmptyModule extends DataModule {}
	it('modulates MyEmptyModule', ()=> {
		expect(()=> modulate(MyEmptyModule)).not.toThrow()
	})
	it('modulates MyEmptyModule using decorator', ()=> {
		expect(()=> {
			// eslint-disable-next-line no-unused-vars
			@modulate class MyEmptyModule extends DataModule {}
		}).not.toThrow()
	})


	const {STRING, OBJECT} = dataTypes
	class MyModuleWithFields extends DataModule {
		static fields = {
			name: String,
			age: Number,
		}
	}
	it('modulates MyModuleWithFields', ()=> {
		expect(()=> modulate(MyModuleWithFields)).not.toThrow()
		expect(MyModuleWithFields.fields.name instanceof STRING).toBe(true)
	})
	it('validates using MyModuleWithFields', ()=> {
		expect(()=> MyModuleWithFields.validate({name: 12})).toThrow('expected string')
		expect(()=> MyModuleWithFields.validate({name: 'h'}))
			.toThrow('value=undefined but allowNull=false')
		expect(()=> MyModuleWithFields.validate({name: 'h', age: 12})).not.toThrow()
	})


	describe('modulates with actions', ()=> {
		// const fn = context=> console.log(Object.keys(context), context.input) || 'Hellooo!'
		const fn = ({input: {name}})=> `Hello ${name}!`

		@modulate
		class MyModuleWithActions extends DataModule {
			static fields = {
				name: String,
				age: Number,
			}
			static actions = {
				sayHello: {
					returns: String,
					input: OBJECT.of({name: String}),
					fn,
				},
			}
		}
		const {sayHello} = MyModuleWithActions.actions
		it('modulates inputType', ()=> expect(sayHello.inputType instanceof OBJECT).toBe(true))
		it('modulates returnType', ()=> expect(sayHello.returnType instanceof STRING).toBe(true))
		it('sets defaultFn', ()=> expect(sayHello.defaultFn).toBe(fn))
		it('wrapps default fn', ()=> {
			expect(typeof sayHello.fn).toBe('function')
			expect(sayHello.fn).not.toBe(fn)
		})
		it('validates input', ()=> {
			expect(()=> sayHello.fn({name: 89})).toThrow('expected string')
			expect(()=> sayHello.fn({name: 'a'})).not.toThrow()
		})
		it('executes default fn wrapped', ()=> {
			expect(sayHello.fn({name: 'Ann'})).toBe('Hello Ann!')
		})
	})

})
