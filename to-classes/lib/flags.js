// @flow

const registerFlag = (name: string, flag: *)=> {
	if (typeof name !== 'string' || name.length==0)
		throw new Error('name required')

	if (flags[name]) {
		if (flags[name]==flag) return
		throw new Error(`different flag with name ${name} already registered`)
	}

	flags[name] = flag
}

const flags: {
	[name: string]: mixed,
	registerFlag: typeof registerFlag,
} = Object.defineProperties({}, {
	registerFlag: { value: registerFlag },
})
export default flags
