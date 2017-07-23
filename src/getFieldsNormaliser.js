// getFieldsNormaliser
// ---
// module -> moduleParser
// 	(fields -> fieldsNormaliser => fieldNormaliser)
// 	-> .model -> Sequelizer -> SQL


// getFieldNormaliser -> bindModule -> fieldNormaliser
export const getFieldNormaliser = ({dataTypes})=> module=> _rawField=> {
	const { STRING } = dataTypes

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

	// assign defaults
	const rawField = Object.assign({}, fieldDefaults, _rawField)
	const field = {}

	// process rawField properties to field
	Object.keys(rawField).forEach(k=> {

		// unwrap wraped types
		const dataType = dataTypes[k]
		if (dataType) return field.type = rawField[k].type

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

	// add modules
	const modules = module.modules || {}
	Object.keys(modules).forEach(k=> {
		const rawModule = modules[k]
		const field = rawFields[k] = Object.assign({}, rawFields[k])
		field.type = MODULE.of(rawModule)
	})

	// process fields
	const fields = {}
	Object.keys(rawFields).forEach(k=> {
		fields[k] = fieldNormaliser(rawFields[k])
	})

	return fields
}


// export
export default getFieldsNormaliser
