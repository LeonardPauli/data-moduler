// @flow

import {context, DataModule, modulate} from '../lib'
import {Action} from '../lib/actions'

describe('context', ()=> {
	it('exists', ()=> expect(typeof context).toBe('object'))

	const modifier = ctx=> ({...ctx, customProp: 'hellooo'})

	it('registers context modifier', ()=>
		expect(()=> context.addModifier(modifier)).not.toThrow())
	it('validates context modifier', // $FlowFixMe
		()=> expect(()=> context.addModifier()).toThrow('expected function'))
	describe('gets context', ()=> {
		context.addModifier(modifier)

		@modulate
		class Module extends DataModule {
			static actions = {
				myAction: {},
			}
		}

		// $FlowFixMe
		const action = Module.actions.myAction
		// $FlowFixMe
		const ctx = context.get({Module, action})

		it('uses custom context modifier', ()=>
			expect(ctx.customProp).toBe('hellooo'))

		it('provides Module actions',
			()=> expect(ctx.myAction instanceof Action).toBe(true))

		it('provides input')
		it('provides self')
	})

	it('todo')
})
