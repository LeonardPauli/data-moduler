/* eslint-disable */
import {modulate} from 'data-moduler'
import {BaseModel} from '../BaseModel'
import Friendship from './Friendship'

@modulate
export default class User extends BaseModel {
	static submodules = {Friendship}
	static fields = {
		...super.fields,
		name: String,
		length: Number, // cm
		following: {type: [User], default: [], targetField: 'follows'},
	}
}


// static actions = {}
// static getters = {}

// @computed
// get lengthInCm () {
// 	return this.length / 100
// }

// @computed lengthInCm = ({length})=> length / 100

// @action grow = self=> self.length += 100

// @action({
// 	tmpstore: ()=> ...
// })
// grow = self=> self.length += 100
