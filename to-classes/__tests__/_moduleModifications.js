// @flow

import {
	performModuleModification,
	performModuleModifications,
} from '../lib/moduleModifications'

describe('moduleModifications', ()=> {
	describe('performModuleModification', ()=> {
		it('exists', ()=> expect(typeof performModuleModification).toBe('function'))
		it('validates module')
		it('validates modification object')
		it('skips if a requiredPlugin is missing')
		it('skips if a requiredModule is missing')
		it('calls modify function')
		it('adds action')
		it('adds getter')
		it('modifies existing action')
		it('modifies existing action using custom merger strategy')
	})

	describe('performModuleModifications', ()=> {
		it('exists', ()=> expect(typeof performModuleModifications).toBe('function'))
		it('performs multiple modifications')
		it('modifications w/ non-met condition are left')
	})

	describe('applies modifications in modulate', ()=> {
		it('applies on modulate')
		it('applies when supermodule available')
		it('applies after plugin applied')
	})
})


/*
	// perform module modifications
	performModuleModification(Module, {
		getters: {
			sayHello: { // add or alter the non-static sayHello getter on the module
				type: STRING,
				input: {phrase: STRING},
				fn: context=> context.Module.$myexample.sayHello(context.input.phrase),
			},
		},
	})
	

	// add module modifications requiring other modules as dependencies
	// 	in order for them to initialise first
	Module.moduleModifications = [...Module.moduleModifications, {
		requiredPlugins: ['crud'],
		requiredModules: [Module],
		modify: ({_modules, _plugins})=> {
			// if (!Module.$crud.enabled) return
			// Module.$crud.helloFromMyExample = true

			Module.getters.sayHello.addDestination({
				name: this.namespace,
				fn: context=> context.action.fn(context)+'lalal',
			})
		},
	}]
	// and then @modulate it
*/
