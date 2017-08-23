const dataFlags = {
	allowNull: true, // used in module field type definition
	unique: true, // used in module field type definition

	isStatic: true, // used for action
	onlyId: true,  // used for action module input field
	onlyNew: true, // used for action module input field
}

const getDataFlags = ()=> dataFlags
export default getDataFlags
