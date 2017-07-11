import Sequelize from 'sequelize'


const dataTypes = {
	STRING: 	{ type: Sequelize.STRING },
	BOOLEAN: 	{ type: Sequelize.BOOLEAN },
	DATE: 		{ type: Sequelize.DATE },
	INT: 			{ type: Sequelize.INTEGER },
	DECIMAL: 	{ type: Sequelize.DECIMAL },
	LIST: 		{ type: Sequelize.ARRAY, of: ({ ownInnerType })=> props=>
		// should probably be a function for relation def?
		Sequelize.ARRAY(ownInnerType(props)),
	},
}


const defineModels = (connection, modules)=> {
	const models = {}
	Object.keys(modules).forEach(k=> {
		const {tabelName, type: {sql: model}, modelOptions} = modules[k]
		models[k] = connection.define(tabelName, model, modelOptions)
	})
	return models
}



// typeGenerator
const typeGenerator = module=> {
	const {fields} = module
	const model = {}
	Object.keys(fields).forEach(k=> {
		model[k] = Object.assign({}, fields[k])
		if (model[k].type) model[k].type = model[k].type.sql
	})
	return model
}



export default {
	namespace: 'sql',
	dataTypes,
	typeGenerator,
	helpers: {
		defineModels,
	},
}
