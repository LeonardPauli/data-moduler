const plugins = {}
export default plugins

class Plugin {
	static namespace = 'myexample'
	static targetName = 'MyExample'

	static didRegister () {}

	static apply (module) {
		const {namespace} = this
		const key = `$${namespace}`
		const val = module[key]
		
		module[key] =
			val === false ? {enabled: false} :
			val === void 0 ? {enabled: true} :
			val

		if (typeof module[key] !== 'object')
			throw new Error(`${module.name}.${key} should be `
				+`boolean or object, got ${typeof module[key]}`)
		
		return val
	}

	static documentation = {
		oneliner: 'summary that fits one line',
		description: 'what it does, how to get started, etc',
		url: 'http://datamoduler.co',
	}
}

Object.defineProperty(plugins, 'Plugin', { value: Plugin })
Object.defineProperty(plugins, 'strictPluginCheck', { value: true, writable: true })


const registerPlugin = plugin=> {
	if (!(plugin instanceof Plugin))
		throw new Error(`plugin wasn't instanceof Plugin`)

	const {name} = plugin
	if (typeof name !== 'string' || name.length==0)
		throw new Error('name required')

	if (plugins[name]) {
		if (plugins[name]==plugin) return
		throw new Error(`different plugins with name ${name} already registered`)
	}

	if (plugins.strictPluginCheck) {
		const keys = 'namespace,targetName,documentation'.split(',')
		keys.forEach(key=> {
			if (plugin[key]===Plugin[key])
				throw new Error(`${plugin.name}.${key} needs to be customised`)
		})
	}

	plugins[name] = plugin
	plugin.didRegister()
}

Object.defineProperty(plugins, 'registerPlugin', { value: registerPlugin })
