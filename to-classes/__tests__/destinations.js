// @flow

import {destinations, plugins} from '../data-moduler'

describe('destinations', ()=> {
	it('is initialized', ()=> expect(typeof destinations).toBe('object'))

	describe('registration', ()=> {
		const {registerDestination} = destinations

		it('requires namespace', ()=> {
			class MyInvalidDestination extends plugins.Plugin {}
			expect(()=> registerDestination(MyInvalidDestination)).toThrow('namespace required')
		})
		it('checks validity', ()=> {
			class MyInvalidDestination extends plugins.Plugin {
				static namespace = 'myDestination'
			}
			expect(()=> registerDestination(MyInvalidDestination)).toThrow('.getActionContext')
		})
		
		
		class MyDestination extends plugins.Plugin {
			static namespace = 'myDestination'
			static getActionContext = (context, ...customArgs)=> ({...context, customArgs})
		}

		it('registers', ()=> {
			registerDestination(MyDestination)
			// $FlowFixMe
			expect(destinations.myDestination).toBe(MyDestination)
		})
		it('skipps re-registration', ()=> {
			registerDestination(MyDestination)
		})
		it('throws on overwrite', ()=> {
			class MyDestination extends plugins.Plugin {
				static namespace = 'myDestination'
				static getActionContext = (context, ...customArgs)=> context
			}
			expect(()=> registerDestination(MyDestination)).toThrow('already registered')
		})
	})
})
