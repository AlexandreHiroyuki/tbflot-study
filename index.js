const fs = require('fs')
const esprima = require('esprima')

const file = fs.readFileSync('./tbflot.js', 'utf8')

const tree = esprima.parseModule(file)
const exportedModule = tree.body[tree.body.length - 1]
const exportedModuleBody = exportedModule.declaration.body.body

let analysisDoc = `# ${exportedModule.declaration.id.name} Class\n`

let classBodyDoc = exportedModuleBody.reduce((resultString, element) => {
  resultString = resultString.concat(`\n- ${element.key.name}`)
  resultString = resultString.concat(
    ` - ${element.static ? 'Static ' : ''}${
      element.kind.charAt(0).toUpperCase() + element.kind.slice(1)
    }`
  )

  if (element.value.params.length) {
    resultString = resultString.concat(
      `\n${element.value.params
        .map((param, index) => `  ${index + 1}. ${param.name}`)
        .join('\n')
        .concat('\n')}`
    )
  }

  return resultString
}, ``)

analysisDoc = analysisDoc.concat(classBodyDoc)

// console.log(analysisDoc)

fs.writeFile('./analysis.md', analysisDoc, (err) => {
  if (err) console.log(err)
})
