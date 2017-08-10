const getModuleInitialiser = moduler=> rawModule=> {
	const {plugins} = moduler
	const {
		metaNormaliser,
		registerModule,
		initialiseMany,
	} = moduler

	// create initialized module
	const module = Object.assign({}, rawModule)
	module._isModule = true

	// setup back-reference for references
	rawModule._module = module

	// pre
	module.isEntity = typeof rawModule.isEntity === 'undefined'
		? !!rawModule.fields
		: rawModule.isEntity

	// setup defaults
	module.mutations = module.mutations || {}
	module.getters = module.getters || {}

	// plugins
	plugins.map(p=> p.initialiseModule).filter(v=> v).forEach(f=> f(moduler)(module))

	// helpers
	Object.defineProperty(module, 'toString', {
		enumerable: false,
		value () { return this.name },
	})

	// name, tabelName, description
	Object.assign(module, metaNormaliser(module))

	// register module - enables referencing module with rawModule
	registerModule(rawModule, module.name)

	// initialise sub modules
	if (module.modules)
		module.modules = initialiseMany(module.modules)

	return module
}

export default getModuleInitialiser
