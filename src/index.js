// data-moduler
// Created by Leonard Pauli, July 2017
// Copyright Leonard Pauli, All rights reserved


import _plugins from './plugins'
export const plugins = _plugins

import getDataFlags from './getDataFlags'
import getDataTypes from './getDataTypes'

import getMetaNormaliser from './getMetaNormaliser'
import getModuleInitialiser from './getModuleInitialiser'
import getFieldsNormaliser from './getFieldsNormaliser'
import getActionsNormaliser from './getActionsNormaliser'


// ModuleParser
export default class ModuleParser {
	constructor (props = {}) {
		// bind this
		'registerModule,parse,initialiseMany,parseMany'.split(',')
			.forEach(k=> this[k] = this[k].bind(this))

		if (!props.plugins) {
			// eslint-disable-next-line
			console.warn('ModuleParser: No plugins provided, you probably want at least one.')
			props.plugins = []
		}
		this.plugins = props.plugins

		// process plugins
		this.plugins.forEach(plugin=> {
			try {
				Object.defineProperty(plugin, 'toString', {
					enumerable: false,
					value () { return this.namespace },
				})
			} catch (err) { /**/ }
		})

		// attach helpers
		this.plugins.filter(p=> p.namespace && p.helpers).forEach(
			({namespace, helpers})=> this[namespace] = {...helpers})

		// initialize defaults
		this.moduleInitialiser = getModuleInitialiser(this)

		// initialize data constants
		this.dataFlags = getDataFlags(this)
		this.dataTypes = getDataTypes(this)
		this.fieldDefaults = {
			type: this.dataTypes.STRING.type,
			allowNull: {default: false, mutations: null, getters: null},
		}

		// initialize normalizers
		this.metaNormaliser = getMetaNormaliser(this)
		this.fieldsNormaliser = getFieldsNormaliser(this)
		this.actionsNormaliser = getActionsNormaliser(this)

		// initialize plugins for moduler
		this.plugins.map(p=> p.initialize).filter(f=> f).forEach(f=> f(this))

		// reset rawModules
		this.rawModules = {}
	}

	// enables referencing module with rawModule
	registerModule (rawModule, name=rawModule.name) {
		const {rawModules} = this
		if (!name) throw new Error('moduleParser.registerModule: module.name is'
			+' required, keys: '+Object.keys(rawModule))
		// if (rawModules[name] == rawModule) return // already registered
		if (rawModules[name]) throw new Error('moduleParser.registerModule: '
			+`a module with name '${name}' is already registered, `
			+(rawModules[name] == rawModule?' and it\'s the same': 'but they\'t different'))

		rawModule.name = name // modify raw module for references to work
		rawModules[name] = rawModule
	}

	// parse one (raw base module)
	parse (rawModule, {alreadyInitialized}={}) {
		const {plugins} = this
		const {
			moduleInitialiser,
			fieldsNormaliser,
			actionsNormaliser,
		} = this

		// init, setup defaults, plugins.initialiseModule, metaNormaliser, etc
		const module = alreadyInitialized? rawModule: moduleInitialiser(rawModule)
		
		// sub modules - should already be initialised in moduleInitialiser
		if (module.modules)
			module.modules = this.parseMany(module.modules, {alreadyInitialized: true})

		// fields
		module.fields = fieldsNormaliser(module)

		// actions, getters
		// all action.type/.input is functions for later evaluation
		const moduleActionsNormaliser = actionsNormaliser(module)
		Object.assign(module, moduleActionsNormaliser('mutations'))
		Object.assign(module, moduleActionsNormaliser('getters'))
		
		// set custom plugin type for module
		plugins.filter(v=> v.typeReducer).forEach(({namespace, typeReducer})=>
			module.type[namespace] = typeReducer(module))

		// unwrap actions.type/input
		const getActionTypesUnwrapper = module=> field=> {
			const actions = module[field]
			Object.keys(actions).forEach(k=> {
				const action = actions[k]
				action.type = action.type()
				action.input = action.input()
			})
		}
		const actionTypesUnwrapper = getActionTypesUnwrapper(module)
		actionTypesUnwrapper('mutations')
		actionTypesUnwrapper('getters')
		
		
		// plugins
		plugins.map(m=> m.afterTypeSetup).filter(v=> v).forEach(f=> f(module))
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

	// initialise many, recursively
	initialiseMany (rawModules) {
		const {moduleInitialiser} = this

		// first, recursively initialize all modules
		const modules = {}
		Object.keys(rawModules).forEach(moduleName=> {
			const rawModule = rawModules[moduleName]
			rawModule.name = rawModule.name || moduleName
			const module = moduleInitialiser(rawModule)
			modules[module.name] = module
		})

		return modules
	}

	// parse many
	parseMany (rawModules, {alreadyInitialized}={}) {
		const {initialiseMany} = this

		// first, recursively initialize all modules
		const initialisedModules = alreadyInitialized
			? rawModules
			: initialiseMany(rawModules)

		// then, recursively parse them
		const modules = {}
		Object.keys(initialisedModules).forEach(k=> {
			const initialised = initialisedModules[k]
			modules[k] = this.parse(initialised, {alreadyInitialized: true})
		})

		// return parsed modules
		return modules
	}
}
