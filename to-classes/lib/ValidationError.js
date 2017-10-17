// @flow

export class ExtendableError {
	name: string
	stack: string
	message: string
	_error: Error

	isPublic = false
	httpStatus: ?number = undefined
	date = new Date()

	constructor (message: string, ...args: *) {
		this.name = this.constructor.name
		this.message = message
		// if (!Error.captureStackTrace)
		// else Error.captureStackTrace(this, this.constructor)
		this._error = new Error(message, ...args)
		this._error.name = this.name
		const stack = this._error.stack.split('\n')
		stack.splice(1, 2) // remove ExtendableError and its subclass from stack
		this.stack = stack.join('\n')
	}

	get coloredStack (): string {
		return 'asdsadad'
		return this.stack.split('\n').map(v=> {
			const val = v.replace(/(\s+)(.*\(|at \/).*\/node_modules/, '$1$2node_modules')
			if (v.indexOf('node_modules')>0) return `\x1b[2m${val}\x1b[0m`
			return val.replace(/(\s+)(at )(.*)(\(.*\))/, '$1\x1b[2m$2\x1b[0m$3\x1b[2m$4\x1b[0m') // 
		}).join('\n')
	}

	toString () {
		return this.stack
	}
}

export default class ValidationError extends ExtendableError {
	isPublic = true
	httpStatus = 400 // bad request
	field: ?string = undefined
}

export class AuthorizationError extends ExtendableError {
	isPublic = true
	httpStatus = 401 // Unauthorized
}
