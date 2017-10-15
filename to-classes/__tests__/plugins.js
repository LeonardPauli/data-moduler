// @flow

import {plugins} from '../data-moduler'
const {Plugin, registerPlugin} = plugins

describe('plugins', ()=> {
	it('is exists', ()=> expect(typeof plugins).toBe('object'))

	describe('registerPlugin', ()=> {
		it('validates kind', ()=> expect(()=>
			// $FlowFixMe
			registerPlugin(class MyTestPlugin {})).toThrow('subclass of Plugin'))
		it('namespace required', ()=> expect(()=>
			registerPlugin(class MyTestPlugin extends Plugin {})).toThrow('namespace required'))

		it('requires some fields to be overriden', ()=> expect(()=>
			registerPlugin(class MyTestPlugin extends Plugin {
				static namespace = 'myTestPlugin'
				static targetName = 'MyTest'
			}))
			.toThrow('documentation needs to be customised'))

		class MyTestPluginMissing extends Plugin {
			static namespace = 'myTestPlugin'
			static targetName = 'MyTest'
		}

		it('requires some fields to be overriden', ()=> expect(()=>
			registerPlugin(MyTestPluginMissing))
			.toThrow('documentation needs to be customised'))

		const obj: {didRegisterResolver?: ()=> void} = {}
		const didRegisterPromise = new Promise(res=> obj.didRegisterResolver = res)
		class MyTestPlugin extends MyTestPluginMissing {
			static documentation = {
				oneliner: 'for testing',
				description: 'see tests',
			}
			static didRegister () {
				obj.didRegisterResolver
					&& obj.didRegisterResolver()
			}
		}

		it('registers', ()=> expect(()=>
			registerPlugin(MyTestPlugin))
			.not.toThrow())
		it('didRegister called', ()=> didRegisterPromise)

		it('registration requires unique namespace', ()=> expect(()=>
			registerPlugin(class MyTestPlugin extends Plugin {
				static namespace = 'myTestPlugin'
			}))
			.toThrow('different plugins with namespace'))

		// it('strictPluginCheck') - on by default, why even have the option?
	})

	describe('Plugin', ()=> {
		it('apply')
		// it('documentation')
		describe('destination features', ()=> {
			it('getActionContext')
			it('getActionWrapper')
			it('addActionWrappers')
		})
		it('fix')
	})
})
