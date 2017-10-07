const contextModifiers = []
const getContext ({Module, action}) {
	const ctx = ({...Module.actionContext, action})
	return contextModifiers.reduce((ctx, fn)=> fn(ctx), ctx)
}
const addContextModifier (fn) {
	if (typeof fn !== 'function')
		throw new Error(`expected function, got ${typeof fn}`)
	modifiers.push(fn)
}

export default {
	get: getContext,
	modifiers: contextModifiers,
	addModifier: addContextModifier,
}
