import {flags} from '../index'
const {registerFlag} = flags

const toRegister = {
	allowNull: true,
}

Object.keys(toRegister).forEach(k=> registerFlag(k, toRegister[k]))
