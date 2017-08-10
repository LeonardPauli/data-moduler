// getFieldsNormaliser
// ---
// module -> moduleParser
// 	(fields -> fieldsNormaliser => fieldNormaliser)
// 	-> .model -> Sequelizer -> SQL


// getFieldNormaliser -> bindModule -> fieldNormaliser
export const getFieldNormaliser = ({dataTypes, rawModules})=> module=> _rawField=> {
	const { STRING, MODULE } = dataTypes

	// default field
	// (use of shorthand (ie. {STRING}) could be problematic here)
	// 	{STRING} + {INT} -> {STRING, INT} -> {type: INT}
	// 	// or possibly
	// 	{STRING} + {INT} -> {INT, STRING} -> {type: STRING}
	// 	// instead of
	// 	{type: STRING} + {type: INT} -> {type: INT}
	// 	meh, when using assign, the order shouldn't be a problem.
	const fieldDefaults = {
		type: STRING.type,
		allowNull: false,
	}


	// field: SELF
	// field: module=> ...
	if (typeof _rawField == 'function')
		return Object.assign({}, fieldDefaults, {type: _rawField(module).type})

	// field: Module,
	// fix direct type; ie
	// 	fields.user: RawUser -> fields.user: {type:{_model:User}}
	if (_rawField._module || _rawField._isModule) // if raw or initialized
		return Object.assign({}, fieldDefaults, {type: MODULE.of(_rawField).type})



	// assign defaults
	const rawField = Object.assign({}, fieldDefaults, _rawField)
	const field = {}

	// process rawField properties to field
	Object.keys(rawField).forEach(k=> {

		// comment
		if (k=='comment')
			return field.comment = rawField.comment

		// shouldUnwrapType
		if (k=='shouldUnwrapType') return
		if (k=='type' && rawField.type) {
			if (rawField.type.shouldUnwrapType)
				return field.type = rawField.type.type

			// ie. field: {type: Module}
			if (rawField.type._module || rawField.type._isModule)
				return field.type = MODULE.of(rawField.type).type
		}

		// unwrap wraped types
		// ie. field: {STRING}
		// ('field: STRING', same as 'field: {type:STRING}', handled elsewhere)
		const dataType = dataTypes[k]
		if (dataType) return field.type = rawField[k].type

		// ie. field: {Module},
		const rawModule = rawModules[k]
		if (rawModule) return field.type = MODULE.of(rawModule).type

		// otherwise
		field[k] = rawField[k]
		// TODO: validate values
		// throw new Error(`data-moduler: unknown field '${k}' property in module '${module.name}'`)
	})


	// unwrap function wrapped types
	if (field.type && typeof field.type.type === 'function')
		field.type = field.type.type

	let i = 0
	while (typeof field.type === 'function') {
		field.type = field.type(module)
		i++
		if (i>200)
			throw new Error('data-moduler: got very nested'
			+ ' type (over 200) (ie. LIST.of(LIST.of(...)))'
			+ ' look out for recursion.')
	}
	

	return field
}


// getFieldsNormaliser -> fieldsNormaliser
const getFieldsNormaliser = moduler=> module=> {
	const {MODULE} = moduler.dataTypes
	const fieldNormaliser = getFieldNormaliser(moduler)(module)
	const rawFields = Object.assign({}, module.fields)

	// add modules - nah, for non entities, add modules as field
	// TODO: what about sub-modules for non-entities with GraphQL?
	if (!module.isEntity) {
		const modules = module.modules || {}
		Object.keys(modules).forEach(k=> {
			const rawModule = modules[k]
			const field = rawFields[k] = Object.assign({}, rawFields[k])
			field.type = MODULE.of(rawModule).type
		})
	}

	// process fields
	const fields = {}
	Object.keys(rawFields).forEach(k=> {
		fields[k] = fieldNormaliser(rawFields[k])
	})

	return fields
}


// export
export default getFieldsNormaliser
