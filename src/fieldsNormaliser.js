// import plugins from './plugins'
import constants from './constants'
const {dataTypes} = constants


// module -> moduleParser
// 	(fields -> fieldsNormaliser => fieldNormaliser)
// 	-> .model -> Sequelizer -> SQL



export const fieldNormaliser = module=> field=> {
	const fixed = {
		type: dataTypes.STRING,
		allowNull: false,
	}
	Object.keys(field).forEach(k=> {

		// unwrap wraped types
		const dataType = dataTypes[k]
		if (dataType) return fixed.type = field[k].type

		fixed[k] = field[k]
	})

	if (fixed.type && typeof fixed.type.type === 'function')
		fixed.type = fixed.type.type

	let i = 0
	while (typeof fixed.type === 'function') {
		fixed.type = fixed.type({module})
		i++
		if (i>20)
			throw new Error(`data-moduler: got a too nested'
			+' type (over 20) (ie. LIST.of(LIST.of(...)))`)
	}
	

	return fixed
}

// fieldsNormaliser
const fieldsNormaliser = module=> {
	const {fields} = module
	const fixField = fieldNormaliser(module)

	// fix fields
	const fixed = {}
	Object.keys(fields).forEach(k=> {
		fixed[k] = fixField(fields[k])
	})

	return fixed
}


// export
export default fieldsNormaliser
