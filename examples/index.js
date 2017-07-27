import baseModule, {moduler} from './just-markdown'
import {log} from '../src/stringFromObject'

// eslint-disable-next-line
console.log('-----------------------------------------------------------------')
// eslint-disable-next-line
// console.dir(demo, {color:1, depth:7})
// log(baseModule, 7)
// eslint-disable-next-line
console.log('-----------------------------------------------------------------')


// Markdown (export API documentation using baseModule)
// baseModule.markdown.writeFile({
// 	outputFile: `${__dirname}/api-documentation.md`,
// })

const store = new moduler.tmpstore.Store()
baseModule.tmpstore.attach({store})
// baseModule.mutations.create.tmpstore()
// log(baseModule, 7)
log(baseModule.modules.User.modules.Color)
console.log('-----------------------------------------------------------------')
log(baseModule.modules.User.modules.Color.mutations.create.default())
