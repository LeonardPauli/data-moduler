// @flow

const destinations = {}
export default destinations

// class Destination {
// }
// Object.defineProperty(destinations, 'Destination', { value: Destination })

interface destinationInterface {
	namespace: string,
	name: string,
	getActionContext: null | (context: Object, ...customArgs: *)=> Object,
}

const registerDestination = (destination: destinationInterface)=> {
	// if (!(destination instanceof Destination))
	// 	throw new Error(`destination wasn't instanceof Destination`)

	const {namespace} = destination
	if (typeof namespace !== 'string' || namespace.length==0)
		throw new Error('namespace required')

	if (destinations[namespace]) {
		if (destinations[namespace]==destination) return
		throw new Error(`different destination with namespace ${namespace} already registered`)
	}

	if (typeof destination.getActionContext !== 'function')
		throw new Error(`destination ${namespace}: expected ${destination.name}.getActionContext `
			+`to be function, got ${typeof destination.getActionContext}`)

	destinations[namespace] = destination
}

Object.defineProperty(destinations, 'registerDestination', { value: registerDestination })
