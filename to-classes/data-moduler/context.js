// @flow
import {type ActionType} from './actions'
import {type DataModuleClassType} from './DataModule'

const a = {
	modifiers: [],
	addModifier (fn: Object=> Object) {
		if (typeof fn !== 'function')
			throw new Error(`expected function, got ${typeof fn}`)
		this.modifiers.push(fn)
	},
	get ({Module, action}: {Module: DataModuleClassType, action: ActionType}) {
		const ctx = {...Module.actionContext, action}
		return this.modifiers.reduce((ctx, fn)=> fn(ctx), ctx)
	},
}
export default a
// a.get({Module: new DataModule(), action: new Action()})
