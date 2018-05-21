// @flow
import {type DataModuleClassType} from './DataModule'
import {Action, Getter} from './actions'
import modulate from './modulate'

type modificationObjectType = {
	requiredModules: ?Array<DataModuleClassType>,
	requiredPlugins: ?Array<*>,
	modify: ?(opt: {
		modules: Array<DataModuleClassType>,
		plugins: Array<*>,
	})=> void,
	actions: ?Object,
	getters: ?Object,
}

type mergerInputType<T: mixed> = {
	Module: DataModuleClassType,
	oldValue: T,
	newValue: T,
	key: string,
	parent: Object,
	defaultMerger: mergerInputType<T>=> T,
}
type mergerFnType<T: mixed> = (mergerInputType<T>)=> T
const defaultMerger:mergerFnType<*> = ({ oldValue, newValue })=> {
	if (oldValue===void 0 || oldValue===newValue) return newValue
	return oldValue
}
export const performModuleModification = (
	Module: DataModuleClassType,
	modificationObject: modificationObjectType,
	merger: mergerFnType<*> = defaultMerger,
	// should take in available modules as well? + how to check plugins?
)=> {
	const merge = opt=> merger({Module, oldValue: opt.parent[opt.key], defaultMerger, ...opt})

	const addActions = (actions: Object, isGetter)=> {
		const field = isGetter? Module.getters: Module.actions
		const Type = isGetter? Getter: Action
		Object.keys(actions).forEach(actionName=> {
			const props = actions[actionName]
			const action = field[actionName] = merge({
				parent: field,
				key: actionName,
				newValue: new Type(),
			})
			const newProps = {}
			Object.keys(props).forEach(key=> {
				newProps[key] = merge({ parent: action, key, newValue: props[key] })
			})
			// TODO
			// the idea was to use action.constructor.fromJSON(merge(action.toJSON, ...)))
			// better would possible be to move constructor logic to an .update fn
			// which just takes the new delta config obj and sets it properly
			// ---
			// now using some variant
			action.update(newProps)
		})
	}

	if (typeof modificationObject !== 'object')
		throw new Error(`Expected object, got ${typeof modificationObject}`)

	const {
		requiredModules,
		requiredPlugins,
		actions, getters, modify,
		...other
	} = modificationObject

	const modules = []
	if (requiredModules) {
		console.warn(`requiredModules check not implemented yet, might cause issues`)
	}
	const plugins = []
	if (requiredPlugins) {
		console.warn(`requiredPlugins check not implemented yet, might cause issues`
			+` (try to import the plugins in the order you want to use them)`)
	}

	if (actions) addActions(actions, false)
	if (getters) addActions(getters, true)
	if (modify) modify({modules, plugins})

	Object.keys(other).forEach(key=> {
		throw new Error(`modificationObject.${key} isn't implemented`)
	})
	
	// normalize all fields
	modulate(Module, {skipPlugins: true})
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
export const performModuleModifications = (
	modifications: Array<{
		Module: DataModuleClassType,
		modificationObject: modificationObjectType}>,
	availableModules: Array<DataModuleClassType>
)=>
	modifications.filter(modification=> {
		const {Module, modificationObject} = modification
		if (availableModules.indexOf(Module)==-1) return true
		performModuleModification(Module, modificationObject)
		return false
	})
