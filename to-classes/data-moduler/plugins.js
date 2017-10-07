import context from './context'

const plugins = {}
export default plugins

class Plugin {
	static namespace = 'myexample'
	static targetName = 'MyExample'

	static didRegister () {}

	static apply (module, _opt) {
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

	static fix (opt) {
		return Module=> {
			// recursively on submodules
			const modules = [Module, ...Module.allSubmodules]
			modules.forEach(Module=> {
				// apply plugin
				this.apply(Module, opt)
				
				// prepare actions for destination ()
				if (this.getActionContext)
					this.addActionWrappers(Module)
			})
		}
	}


	// Destination

	static getActionContext = null // (context, ...customArgs)=> context

	static getActionWrapper ({Module, action, actionName}) {
		const normalised = `$${this.namespace}`
		return (...customArgs)=> {
			const ctx = context.get({Module, action, actionName})
			const ctx2 = this.getActionContext(ctx, ...customArgs)
			return action[normalised](ctx2)
		}
	}
	static addActionWrappers (Module) {
		const wrapped = `$$${this.namespace}`
		const wrappAction = (action, actionName)=> {
			if (action[wrapped]) return
			action[wrapped] = this.getActionWrapper({Module, action, actionName})
		}

		Object.keys(Module.actions).forEach(k=> wrappAction(Module.actions[k], k))
		Object.keys(Module.getters).forEach(k=> wrappAction(Module.getters[k], k))
	}
}

Object.defineProperty(plugins, 'Plugin', { value: Plugin })
Object.defineProperty(plugins, 'strictPluginCheck', { value: true, writable: true })


const registerPlugin = plugin=> {
	if (!(plugin instanceof Plugin))
		throw new Error(`plugin wasn't instanceof Plugin`)

	const {namespace} = plugin
	if (typeof namespace !== 'string' || namespace.length==0)
		throw new Error('namespace required')

	if (plugins[namespace]) {
		if (plugins[namespace]==plugin) return
		throw new Error(`different plugins with namespace ${namespace} already registered`)
	}

	if (plugins.strictPluginCheck) {
		const keys = 'namespace,targetName,documentation'.split(',')
		keys.forEach(key=> {
			if (plugin[key]===Plugin[key])
				throw new Error(`${plugin.namespace}.${key} needs to be customised`)
		})
	}

	plugins[namespace] = plugin
	plugin.didRegister()
}

Object.defineProperty(plugins, 'registerPlugin', { value: registerPlugin })
