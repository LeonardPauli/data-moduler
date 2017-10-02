import { modulate, DataModule, plugins } from 'data-moduler'
const {crud, relations} = plugins

import User from './User'
import Post from './Post'


@modulate({use: [crud, relations]})
export default class MyAPI extends DataModule {
	static submodules = {
		User,
		Post,
	}
}
