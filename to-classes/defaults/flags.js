// @flow
import flags from '../lib/flags'
const {registerFlag} = flags

const toRegister = {
	// used in module field type definition, both for type and action input
	allowNull: true, // or object for more refined / for plugins
	// allowNull: {default: false, actions: null, getters: null, // up to plugins to honour
	// 	pluginCustomField: true/null/false}, // null to use default

	unique: true, // used in module field type definition

	isStatic: true, // skipps adding SELF as input; action.isStatic = true

	// defines reference kind when used as input
	// action.input[field] = {Module, onlyNew}
	// or Module.fields[field] = {Module, onlyId}
	// default is allow both
	onlyId: true,
	onlyNew: true,
}

Object.keys(toRegister).forEach(k=> registerFlag(k, toRegister[k]))
