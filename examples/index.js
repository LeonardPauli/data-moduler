/* eslint no-console:0 */

console.reset = ()=> process.stdout.write('\x1b\x63')
console.reset()

import baseModule, {moduler} from './just-markdown'
import {log} from '../src/stringFromObject'

for (let i=0; i < 10; i++) console.log('\n')
console.log('-----------------------------------------------------------------')



// Markdown (export API documentation using baseModule)
// baseModule.markdown.writeFile({
// 	outputFile: `${__dirname}/api-documentation.md`,
// })

const store = new moduler.tmpstore.Store()
baseModule.tmpstore.attach({store})
// baseModule.mutations.create.tmpstore()
// log(baseModule, 7)
// log(baseModule.modules, 10)

console.log(baseModule.modules.User.mutations.changeName.tmpstore({name:'asdf'})({name:'LALA'})(), 10)


console.log('-----------------------------------------------------------------')
// for (let i=0; i < 10; i++) console.log('\n')