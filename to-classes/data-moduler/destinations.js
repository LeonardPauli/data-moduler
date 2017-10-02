const destinations = {}
export default destinations

class Destination {
}

Object.defineProperty(destinations, 'Destination', { value: Destination })


const registerDestination = destination=> {
	if (!(destination instanceof Destination))
		throw new Error(`destination wasn't instanceof Destination`)

	const {name} = destination
	if (typeof name !== 'string' || name.length==0)
		throw new Error('name required')

	if (destinations[name]) {
		if (destinations[name]==destination) return
		throw new Error(`different destination with name ${name} already registered`)
	}

	destinations[name] = destination
}

Object.defineProperty(destinations, 'registerDestination', { value: registerDestination })
