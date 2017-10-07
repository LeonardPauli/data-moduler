import {Action, Getter} from './actions'

const defaultMerger = ({ oldValue, newValue, _key, _parent, _defaultMerger })=> {
	if (oldValue===void 0 || oldValue===newValue) return newValue
	return oldValue
}
export const performModuleModification = Module=> (modificationObject, merger = defaultMerger)=> {
	const merge = opt=> merger({Module, oldValue: opt.parent[opt.key], defaultMerger, ...opt})

	const addActions = (actions, isGetter)=> {
		const field = isGetter? Module.getters: Module.actions
		const Type = isGetter? Getter: Action
		Object.keys(actions).forEach(actionName=> {
			const props = actions[actionName]
			const action = field[actionName] = merge({
				parent: field,
				key: actionName,
				newValue: new Type(),
			})
			Object.keys(props).forEach(key=> {
				action[key] = merger({ parent: action, key, newValue: props[key] })
			})
		})
	}

	if (typeof modificationObject !== 'object')
		throw new Error(`Expected object, got ${typeof modificationObject}`)

	const modObj = {...modificationObject}
	const modules = []
	if (modObj.requiredModules) {
		console.warn(`requiredModules check not implemented yet, might cause issues`)
		delete modObj.requiredModules
	}
	const plugins = []
	if (modObj.requiredPlugins) {
		console.warn(`requiredPlugins check not implemented yet, might cause issues`
			+` (try to import the plugins in the order you want to use them)`)
		delete modObj.requiredPlugins
	}

	Object.keys(modificationObject).forEach(key=> {
		const val = modificationObject[key]
		if (key==='actions') addActions(val, false)
		else if (key==='getters') addActions(val, true)
		else if (key==='modify') val({modules, plugins})
		else {
			throw new Error(`modificationObject.${key} isn't implemented`)
		}
	})
}

// returns modifications that are left (ie. required module wasn't available)
// 
// TODO: execute in specific order
// (change availableModules to be TopModule)
// add static Module.performModuleModifications = ()=>
// 	this.moduleModifications = performModuleModifications(m, this)
// executes moduleModifications
// 	- on submodules from sibling submodules
// 	- on submodules from sibling submodules children recursively
// 	- on self from self
// 	- on self from submodules + submodules children recursively
// 	...thereby performing all modifications matching self's submodule tree
export const performModuleModifications = (modifications, availableModules)=> {
	modifications.filter(modification=> {
		const {Module, modificationObject} = modification
		if (!availableModules.indexOf(Module)>=0) return true
		performModuleModification(Module, modificationObject)
		return false
	})
