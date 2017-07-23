// data-moduler
// Created by Leonard Pauli, July 2017
// Copyright Leonard Pauli, All rights reserved


import _plugins from './plugins'
export const plugins = _plugins

import getDataFlags from './getDataFlags'
import getDataTypes from './getDataTypes'

import getMetaNormaliser from './getMetaNormaliser'
import getFieldsNormaliser from './getFieldsNormaliser'
import getActionsNormaliser from './getActionsNormaliser'

const getModuleInitialiser = moduler=> rawModule=> {
	const {plugins} = moduler
	const module = Object.assign({}, rawModule)

	// pre
	module.isEntity = typeof rawModule.isEntity === 'undefined'
		? !!rawModule.fields
		: rawModule.isEntity

	// plugins
	plugins.map(p=> p.initialiseModule).filter(v=> v).forEach(f=> f(module))

	// helpers
	Object.defineProperty(module, 'toString', {
		enumerable: false,
		value: function () { return this.name },
	})

	return module
}

// ModuleParser
export default class ModuleParser {
	constructor (props = {}) {
		if (!props.plugins) {
			console.warn('ModuleParser: No plugins provided, you probably want at least one.')
			props.plugins = []
		}
		this.plugins = props.plugins

		// process plugins
		this.plugins.forEach(plugin=> {
			try {
				Object.defineProperty(plugin, 'toString', {
					enumerable: false,
					value: function () { return this.namespace },
				})
			} catch (err) { /**/ }
		})

		// attach helpers
		this.plugins.filter(p=> p.namespace && p.helpers).forEach(
			({namespace, helpers})=> this[namespace] = helpers)

		// initialize defaults
		this.moduleInitialiser = getModuleInitialiser(this)

		// initialize data constants
		this.dataFlags = getDataFlags(this)
		this.dataTypes = getDataTypes(this)

		// initialize normalizers
		this.metaNormaliser = getMetaNormaliser(this)
		this.fieldsNormaliser = getFieldsNormaliser(this)
		this.actionsNormaliser = getActionsNormaliser(this)
	}

	// parse one (raw base module)
	parse (rawModule) {
		const {plugins} = this
		const {
			moduleInitialiser,
			metaNormaliser,
			fieldsNormaliser,
			actionsNormaliser,
		} = this

		// init, setup defaults, plugins.initialiseModule, etc
		const module = moduleInitialiser(rawModule)
			
		// name, tabelName, description
		Object.assign(module, metaNormaliser(module))
		
		// sub modules
		if (module.modules)
			module.modules = this.parseMany(module.modules)

		// fields
		module.type = Object.assign({}, module.type)
		module.fields = fieldsNormaliser(module)

		// set custom plugin type for module
		plugins.filter(v=> v.typeReducer).forEach(({namespace, typeReducer})=>
			module.type[namespace] = typeReducer(module))

		// actions, getters
		// Object.assign(module, actionsNormaliser(module))
		
		// // plugins
		// plugins.map(m=> m.gettersGenerator).filter(v=> v).forEach(f=> f(module))
		// plugins.map(m=> m.actionsGenerator).filter(v=> v).forEach(f=> f(module))


		// attach plugin helpers
		this.plugins.filter(p=> p.namespace && p.moduleHelpers)
			.forEach(({namespace, moduleHelpers})=> {
				if (!module[namespace]) module[namespace] = {}
				Object.keys(moduleHelpers).forEach(name=> {
					const field = moduleHelpers[name]
					if (typeof field === 'function')
						module[namespace][name] = field(module)
					else module[namespace][name] = field
				})
			})

		return module
	}

	// parse many
	parseMany (rawModules) {
		const modules = {}
		Object.keys(rawModules).forEach(moduleName=> {
			const rawModule = rawModules[moduleName]
			rawModule.name = rawModule.name || moduleName
			modules[moduleName] = this.parse(rawModule)
		})
		return modules
	}
}
