const plugins = {}
export default plugins

class Plugin {
}

Object.defineProperty(plugins, 'Plugin', { value: Plugin })


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

	plugins[name] = plugin
}

Object.defineProperty(plugins, 'registerPlugin', { value: registerPlugin })
