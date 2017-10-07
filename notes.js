/* eslint-disable */


// 17 sep: see https://www.graph.cool/


// const store = baseModule.veux.store // veux store
// 1. flatten entity modules
// 2. mutations

mutations: {
	create: {
		// alt 1; function
		veux: (state, payload)=> state.x = payload
		// alt 2; object
		veux: {
			native: (state, payload)=> state.x = payload
			wrapper: (context, payload)=> context.store.commit(
				`${context.module.name}/${context.action.name}`, payload)
		}
	}
}

// 	mutations.create.veux: context=> payload=> context.store.commit(`${context.module.name}/${context.action.name}`, payload)
// 	type.veux.mutations.create: (state, {data})=> state.data = data
// 	plugins.actions.mutationWrapper(context, mutations.create.veux)
// 	plugins.actions.mutationWrapper: (context, fn)=> {
// 		fn(context.state, {data: context.data})
// 	}
// 	
const store = new Vuex.Store({
	state,
	getters, // $store.getters.nameOfGetter
	mutations, // $store.commit('mutationname', {param: value})
	actions, // $store.dispatch('actionname', {param: value})
	// modules: {
	//   counter: {
	//     namespaced:true,
	//     state: {count:34},
	//     mutations: {increment (state) {state.count++}},
	//     actions: {increment ({commit}) {commit('increment')}},
	//     getters: {count: (state)=> state.count}
	//   }
	// },
	modules,
	plugins,
})

if (module.hot) {
	module.hot.accept([
		'./getters',
		'./mutations',
		'./actions',
		'./modules',
	], ()=> {
		store.hotUpdate({
			getters: require('./getters'),
			mutations: require('./mutations'),
			actions: require('./actions'),
			modules: require('./modules'),
		})
	})
}
