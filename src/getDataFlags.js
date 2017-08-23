const dataFlags = {
	allowNull: true, // used in module field type definition, both for type and action input
	unique: true, // used in module field type definition

	isStatic: true, // skipps adding SELF as input; action.isStatic = true

	// defines reference kind when used as input
	// action.input[field] = {Module, onlyNew}
	// or Module.fields[field] = {Module, onlyId}
	// default is allow both
	onlyId: true,
	onlyNew: true,
}

const getDataFlags = ()=> dataFlags
export default getDataFlags
