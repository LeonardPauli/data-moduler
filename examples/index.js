/* eslint no-console:0 */

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

log(baseModule.modules.User.mutations.sayHay.tmpstore())



console.log('-----------------------------------------------------------------')
for (let i=0; i < 10; i++) console.log('\n')