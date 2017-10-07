/* eslint-disable */
import {DataModule, modulate, dataTypes} from 'data-moduler'
const {STRING} = dataTypes

const config = {maxLength: 140, allowNull: undefined}

@modulate
class Post extends DataModule {
	static fields = {
		text: String,
		// text: {String},
		// text: {String, ...config},
		// text: {type: String, ...config},
		// text: STRING,
		// text: {STRING},
		// text: {STRING, ...config},
		// text: {type: STRING, ...config},
		// text: new STRING(config),

		// text: {String, type: INT, otherField: Number, ...config} -> new INT(config)
	}
}
