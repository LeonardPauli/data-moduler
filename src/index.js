import plugins from './plugins'
import fieldsNormaliser from './fieldsNormaliser'
import actionsNormaliser from './actionsNormaliser'
import constants from './constants'
const {
	useId, allowNull,
	dataTypesExportable,
} = constants



// metaNormaliser
const metaNormaliser = module=> {
	const {name, tabelName, description} = module
	if (!name || !name.length)
		throw new Error('moduleParser: module.name is required', module)

	return {
		name,
		tabelName: tabelName || name
			.replace(/^[A-Z]/, l=> l.toLowerCase())
			.replace(/[A-Z]/g, l=> '_'+l.toLowerCase()),
		description, // no autogen
	}
}


// moduleParser
const moduleParser = module=> {
	
	// name, tabelName, description
	const newModule = Object.assign({}, module, metaNormaliser(module))
	
	// fields
	newModule.type = Object.assign({}, newModule.type)
	newModule.fields = fieldsNormaliser(newModule)

	// plugins prepare
	plugins.map(m=> m.prepare).filter(v=> v).forEach(f=> f(newModule))

	// type
	plugins.forEach(({namespace, typeGenerator: fn})=>
		fn && (newModule.type[namespace] = fn(newModule)))

	// actions, getters
	Object.assign(newModule, actionsNormaliser(newModule))
	// console.dir({newModule}, {colors:1, depth:2})
	
	// plugins
	// plugins.map(m=> m.typeGenerator).filter(v=> v).forEach(f=> f(newModule))
	plugins.map(m=> m.gettersGenerator).filter(v=> v).forEach(f=> f(newModule))
	plugins.map(m=> m.actionsGenerator).filter(v=> v).forEach(f=> f(newModule))


	return newModule
}


const modulesParser = rawModules=> {
	const modules = {}
	Object.keys(rawModules).forEach(k=> {
		rawModules[k].name = rawModules[k].name || k
		modules[k] = moduleParser(rawModules[k])
	})
	return modules
}

const helpers = plugins.map(o=> o.helpers).filter(o=> o)
	.reduce((p, v)=> Object.assign(p, v), {})

export default {
	allowNull, useId, ...dataTypesExportable,
	...helpers,
	modulesParser,
}
