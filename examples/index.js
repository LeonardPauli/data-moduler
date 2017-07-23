import demo from './just-markdown'
import {log} from '../src/stringFromObject'

// eslint-disable-next-line
console.log('-----------------------------------------------------------------')
// eslint-disable-next-line
console.dir(demo, {color:1, depth:7})
log(demo, 7)
// eslint-disable-next-line
console.log('-----------------------------------------------------------------')


import DataModuler, {plugins} from '../src'
const {markdown} = plugins
log(new DataModuler({plugins: [markdown()]}))
