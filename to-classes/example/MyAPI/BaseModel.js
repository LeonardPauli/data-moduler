import {DataModule} from 'data-moduler'

class BaseModel extends DataModule {
	static fields = {
		uuid: {ID, kind: 'UUID-44', unique},
		createdAt: Date,
		updatedAt: {Date, allowNull},
		deletedAt: {Date, allowNull},
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