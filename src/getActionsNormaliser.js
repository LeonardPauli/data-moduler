import {getFieldNormaliser} from './getFieldsNormaliser'


	/* // Raw actions example;
	actions: {
		copyNameFromUser: {
			input: ({User})=> OBJECT.of({ // like fields
				SELF,	// special; provide it to the action separately
				otherUser: User,
			}),
			type: SELF,
			sql: ({models}, self)=> ({otherUser: {name}})=> {
				self.sql.name = name
				return self.sql.save()
			},
			graphql: ({sql}, self)=> ({otherUser})=> sql(otherUser),
		},
	},
	getters: {
		packs: {
			input: SELF,
			type: LIST.of(Pack), // type is return type
			sql: ({models})=> ()=> models.Pack // param 2; input
				.where('user.id is :id', {id: user.id})
				.where('user.id is :id', {id: user.id})
				.where('user.id is :id', {id: user.id}),
			graphql: async ({sql})=> {
				const packs = await sql()
				return packs.map(x=> ...)
			},
		}
	}
	*/

// getActionsNormaliser
const getActionsNormaliser = moduler=> module=> fieldSectionName=> {
	const {plugins} = moduler
	const {dataTypes, rawModules} = moduler
	const {allowNull} = moduler.dataFlags
	const {BOOLEAN} = dataTypes
	const fieldNormaliser = getFieldNormaliser(moduler)(module)
	const rawActions = module[fieldSectionName] = module[fieldSectionName] || {}
	const actions = module[fieldSectionName] = {}

	// gather wrappers, actions are written for their custom type
	// (ie. veux takes state/graphql takes root arg), but when called from
	// DataModuler, it should be same format. Accomplished by wrapping actions per type.
	const wrappers = {
		default: {
			wrapper: ({context, fn})=>
				fn(context, context.input || {}),
			inputNormaliser: (input, _context)=> input,
		},
	}
	plugins.filter(p=> p.actions).forEach(({
		namespace,
		actions: {
			wrapper= wrappers.default.wrapper,
			inputNormaliser= wrappers.default.inputNormaliser,
		},
	})=> wrappers[namespace] = {
		wrapper: typeof wrapper === 'object'
			? wrapper[fieldSectionName]
			: wrapper,
		inputNormaliser: typeof inputNormaliser === 'object'
			? inputNormaliser[fieldSectionName]
			: inputNormaliser,
	})


	// default context, first sent to wrapper that then can decide what to send to action
	const wrapAction = (wrapper, fn, actionName)=> fields=> {
		const betweenInput = {
			...actions, actions,
			thisAction: actions[actionName],
		}
		const afterInput = {
			moduler, module,
			fieldSectionName, actionName,
			...fields,
		}

		const native = (input={}, ctx={})=> wrapper.wrapper({context: {
			...input, // could be risky, if trying to
				// access a prop not defined, but sent from client
			...betweenInput,
			input, // first + keep input to avoid override issue (ie if input.module)
			...afterInput,
			...ctx,
		}, fn})

		const normalised = (rawInput, context={})=> {
			const ctx = {
				...betweenInput,
				...afterInput,
				...context,
			}
			// Object.assign({}, defaultContext, context) to allow passing partial context?
			const input = wrapper.inputNormaliser(rawInput, ctx)
			return native(input, ctx)
		}

		normalised.native = native
		return normalised
	}

	// repackage rawActions to actions
	Object.keys(rawActions).forEach(actionName=> {
		const rawAction = rawActions[actionName]
		const tmp = {}
		const action = tmp.action = actions[actionName] = (a, b, c)=>
			tmp.action.default? tmp.action.default(a, b, c):
			console.warn(`No default function defined for ${module.name}.${actionName}`)

		Object.assign(action, {
			rawActions: {},
			isStatic: false,
			type: null,
			input: null,
		})


		// wrapActionField function
		const wrapActionField = ({namespace, fn})=> {
			const wrapper = wrappers[namespace]
			if (!wrapper) return console.warn(
				`data-moduler; actionNormaliser; ${module.name}.actions.${actionName}; `
					+`'${namespace}' wrapper couldn't be find`)

			// wrap
			action.rawActions[namespace] = fn // used for key-lookup?
			action[namespace] = action.isStatic
				// TODO: put in a validation layer in-between input and wrapper?
				? 			 wrapAction(wrapper, fn, actionName)()
				: self=> wrapAction(wrapper, fn, actionName)({self})
		}


		const wrapActionFields = fields=> {
			const defaultField = fields.find(({namespace})=> namespace=='default')

			// fill in for non-provided plugin functions
			if (defaultField) Object.keys(wrappers).forEach(namespace=> {
				if (fields.find(o=> o.namespace==namespace)) return
				actionFields.push({ namespace, fn: defaultField.fn })
			})

			actionFields.forEach(wrapActionField)
		}

		// ie. actions: { doThing: context=> ... }
		// usefull if only one platform is used
		if (typeof rawAction === 'function') {
			wrapActionFields([{ namespace: 'default', fn: rawAction }])
			return
		}

		// guard
		if (typeof rawAction !== 'object') return console.warn(
			`data-moduler; actionNormaliser; ${module.name}.actions.${actionName}; `
				+` expected object or function, got ${typeof rawAction}`)


		if (!rawAction.input) rawAction.input = ()=> ({})

		// parse action object
		// { type: ..., input: ..., pluginNamespace: (pluginsWrapperContext)=> ..., ... }
		const actionFields = []
		Object.keys(rawAction).forEach(key=> {
			const field = rawAction[key]

			// consume comment
			if (key=='comment' || key=='returnTypeDescription')
				return action[key] = field
			// consume datatype type ie. {STRING, ...} vs {type: STRING, ...}
			const dataType = dataTypes[key]
			if (dataType) return action.type = fieldNormaliser({type: dataType})

			// consume module type ie. {User, ...} vs {type: User, ...}
			const rawModule = rawModules[key]
			if (rawModule) return action.type = fieldNormaliser({type: rawModule})

			// consume return type
			if (key == 'type') return action.type = field

			// consume input type
			// ie. input: {name: {STRING, allowNull}}, ...
			if (key == 'input') return action.input = ()=> {
				const theField = typeof field == 'function'? field(): field
				const fields = {}
				Object.keys(theField).forEach(k=> {
					fields[k] = fieldNormaliser(theField[k])
				})
				return fields
			}

			// consume isStatic
			if (key=='isStatic')
				return action.isStatic = field

			// allow plugins to consume fields
			// ie. {authenticated: ..., }
			// TODO

			// otherwise, assume it's supposed to be an action function
			actionFields.push({ namespace: key, fn: field })
		})

		// handle return type
		const savedType = action.type
		action.type = ()=> fieldNormaliser(savedType || {BOOLEAN, allowNull})

		// wrap actionFields
		wrapActionFields(actionFields)
	})
}



// export
export default getActionsNormaliser



// Notes

	// 1. first: get plugin adapters + default adapter
	// // default: action: (context, fn)=> fn(context) // just pass context directly
	// adapters:
	// 	action: (context, fn)=> fn({...context, lala:123}, state)
	// 		// optionally transform context, and/or call fn differently
	// 			(ie. like it would be done usually in the target
	// 				(ie. for veux actions, commit fn is passed))
	// 	fetcher: (context, fn)=> fn(context)
	// 	-> [namespace]: action...
	// 	--
	// 	2. wrap all actions in corresponding adapters
	// 	3. write typeReducer for tmpstore, to use actions
	// 	4. plan more
	// 	5. same but for fetchers
	// 	6. try actions/getters (allow to use other plugin
	// 			actions/fetchers/actions/getters if available)
	// 	  (do that with a new simple demo exposer (tmpexposer), not graphql yet)
	// 		ie. graphgl fetcher uses tmpstore fetcher (or getter?), with some processing in between
	// 	diff: fetchers/actions are tinier and more atomic than getters/actions
	// 	7. Markdown plugin support actions (write them out somehow
	// 		with optional comments and examples maybe)
	// 	8. test relations
	// 	9. commit
	// 	10. simple graphql support (similar to tmpexposer, maybe wait with relations)
	// 	11. graphql relations support
	// 	12. commit
	// 	13. write CRUD actions for one model, inc. relations
	// 	14. fix CRUD plugin to auto add actions to entities
	// 	15. commit
	// 	16. make relations bi-directional (even though only defined once, ie. auto add field to other)
	// 	17. commit
	// 	plan some more
	// 	sequelize plugin
	// 	. commit
	// 	plan some for access-control and validation
	// 	access-control / authorised field
	// 	. commit
	// 	validation
	// 	. commit
	


	// ----
	// const {actions: rawActions, getters: rawGetters} = module

	// const fieldNormaliser = getFieldNormaliser(moduler)(module)
	// const actionNormaliser = getActionNormaliser(moduler)(module, fieldNormaliser)
	// const singleActionsNormaliser = getSingleActionsNormaliser(actionNormaliser)

	// const getters = singleActionsNormaliser({
	// 	key: 'actions',
	// 	module,
	// 	// defaultGetters = getDefaultGetters(moduler)(module) from plugins
	// 	// 		naah, rather just let the plugins add actions themselves
	// 	// 		move out as much as possible to the plugins, as long as repetition can be avoided
	// 	// 			ie. maybe provide a helper for setting actions if it involves a lot of code,
	// 	// 				but as long as it doesn't, don't
	// 	// custom: module[key],
	// 	preNormaliseAction: fields=> {
	// 		fields.method = fields.method || 'GET'
	// 	},
	// })

	// // const defaultActions = getDefaultActions(moduler)(module)
	// // const actions = singleActionsNormaliser(defaultActions, rawActions, fields=> {
	// // 	fields.method = fields.method || 'POST'
	// // })

	// return { actions, getters }

// getActionNormaliser -> (...) -> actionNormaliser
// const getActionNormaliser = ({dataTypes})=> (module, fieldNormaliser)=> action=> {
// 	const {BOOLEAN} = dataTypes


	// type
	// default to parent module?
	// throw new Error(`data-moduler: action/getter ${actionName}
	// 	in module ${module.name} needs a type field`)
	// const typeKeyNamed = Object.keys(dataTypes).find(k=>
	// 	Object.keys(action).indexOf(k)>=0)
	// const typeKey = typeKeyNamed || 'type'
	// if (!action[typeKey]) action.type = BOOLEAN.type
	// action.type = fieldNormaliser({[typeKey]: action[typeKey]}).type
	// if (typeKeyNamed) delete action[typeKeyNamed]
// }


// singleActionsNormaliser
// const getSingleActionsNormaliser = actionNormaliser=>
// 	({defaults, custom, preNormaliseAction})=> {
// 	const actions = Object.assign({}, custom)

// 	// extend or remove default actions
// 	Object.keys(defaults).forEach(k=> {
// 		if (actions[k]===undefined) actions[k] = {}
// 		if (!actions[k]) return delete actions[k]

// 		actions[k] = Object.assign({}, defaults[k], actions[k])
// 	})

// 	// process action
// 	Object.keys(actions).forEach(actionName=> {
// 		const action = actions[actionName]
// 		preNormaliseAction(action)
// 		actionNormaliser(action)
// 	})

// 	return actions
// }
