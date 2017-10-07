export default {
	modifiers: [],
	addModifier (fn) {
	if (typeof fn !== 'function')
		throw new Error(`expected function, got ${typeof fn}`)
	this.modifiers.push(fn)
},
	get ({Module, action}) {
	const ctx = {...Module.actionContext, action}
	return this.modifiers.reduce((ctx, fn)=> fn(ctx), ctx)
},
}
