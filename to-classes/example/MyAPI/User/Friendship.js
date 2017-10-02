import {modulate, ValidationError, flags, dataTypes} from 'data-moduler'
import {BaseModel} from '../BaseModel'
const {SELF} = dataTypes
const {unique, allowNull} = flags

import User from './index'


@modulate
export default class Friendship extends BaseModel {
	static fields = {
		...super.fields,
		userA: User,
		userB: User,
		// if array of primitive value(s), it becomes ENUM.of(...),
		// if array of one type, it becomes LIST.of(...)
		// if array of multiple types, it becomes UNION.of(...) // or ONEOFTYPE?
		status: ['request', 'requestDeclined', 'approved'],
		approvedAt: {Date, allowNull},
	}

	static constraints = [
		unique({combinationOfFields: ['userA', 'userB']}),
	]
	$validate () {
		super.validate()
		if (this.userA == this.userB)
			throw new ValidationError('this.userA == this.userB')
	}

	static moduleModifications = [ ...super.moduleModifications, {
		module: User,
		getters: {
			// beware name collisions
			// 'self(userA=target or userB=target)', -> a query, convertable to any store
			// this feature is provided by queryable / filter / crud plugin
			friends: Friendship.list({ $or: [{userA: SELF}, {userB: SELF}] }),
			friendsLuckyNumber: ()=> Math.random(), // potentially cached
		},
		actions: {
			getFriendsRandomNumber: ()=> Math.random(), // not cached
		},
	}]
}
