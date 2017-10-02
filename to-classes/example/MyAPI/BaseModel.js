import {DataModule, dataTypes, flags} from 'data-moduler'
const {ID} = dataTypes
const {allowNull, unique} = flags

// only include value in getters (ie. prevent external set)
const ignore = ({isGetter})=> !isGetter

class BaseModel extends DataModule {
	static fields = {
		uuid: {ID, kind: 'UUID-44', unique, ignore},
		createdAt: {Date, ignore},
		updatedAt: {Date, allowNull, ignore},
		deletedAt: {Date, allowNull, ignore},
	}

	beforeCreate () {
		super.beforeCreate()
		this.createdAt = new Date()
	}

	beforeUpdate () {
		super.beforeUpdate()
		this.updatedAt = new Date()
	}

	beforeDelete (req, res) {
		super.beforeDelete()
		this.deletedAt = new Date()
		res.preventDelete()
	}
}
