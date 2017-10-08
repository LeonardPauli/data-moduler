// @flow
/* eslint-disable no-console */

import {flags} from '../data-moduler'

const expect = (fn: ()=> mixed, rej?: Error=> mixed)=>
	new Promise(res=> res(fn())).catch(err=> ({err})).then(res=> {
		const t = (t=> t.substr(0, t.length-1))(String(fn).substr('function (){return'.length))
		if (rej && !(res && res.err))
			return console.log(`\x1b[31mEXPECTED\x1b[0m error, got ${String(res)}: ${t}`)

		if ((rej && res && res.err instanceof Error
			? rej(res.err) : res)===true) console.log(`\x1b[36mEXPECT\x1b[0m: ${t}`)
		else {
			console.log(`\x1b[31mEXPECTED\x1b[0m ${t}`)
			console.dir(res, {colors: 1, depth: 2})
		}
	})
const expectations = (arr: Array<string | (()=> mixed) | [()=> mixed, Error=> mixed]>)=>
	arr.reduce((p, v)=> p.then(()=>
		typeof v === 'string' ? console.log('\n--- '+v)
			: Array.isArray(v) ? expect(v[0], v[1])
				: expect(v)
	), Promise.resolve())

const consoleTall = 70
console.log(Array(consoleTall+3).fill('\n').join(''))
// $FlowFixMe
process.stdout.moveCursor(0, -consoleTall)


expectations([
	'flags',
	()=> flags.allowNull===true,
	()=> flags.registerFlag('myFlag', 87)===void 0,
	()=> flags.myFlag===87,
	()=> flags.registerFlag('myFlag', 87)===void 0,
	[()=> flags.registerFlag('myFlag', 33), ()=> true],

	// 'dataTypes',
	// ()=> typeof dataTypes==='object',
	// ()=> typeof dataTypes.DataType === 'function',
	// // ()=> new ANY()

	// 'plugins',
	// 'destinations',
	// 'actions',
	// 'modulate',
	// 'moduleModifications',
	// 'context',
	// 'ValidationError',
])
