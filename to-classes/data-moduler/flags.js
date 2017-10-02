const flags = {}
export default flags

const registerFlag = (name, flag)=> {
	if (typeof name !== 'string' || name.length==0)
		throw new Error('name required')

	if (flags[name]) {
		if (flags[name]==flag) return
		throw new Error(`different flag with name ${name} already registered`)
	}

	flags[name] = flag
}

Object.defineProperty(flags, 'registerFlag', { value: registerFlag })
