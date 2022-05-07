const fs = require('fs')
const esprima = require('esprima')

const file = fs.readFileSync('./tbflot.js', 'utf8')

const tree = esprima.parseModule(file)
const exportedModule = tree.body[tree.body.length - 1]
const exportedModuleBody = exportedModule.declaration.body.body

function unmountObjectToString(object, maxDepth = -1, indent = 0) {
  return Object.entries(object)
    .map(([key, value]) => {
      if (key === 'type') {
        return ``
      } else if (
        Array.isArray(value) &&
        value !== null &&
        !value.hasOwnProperty('type') &&
        maxDepth > 0 &&
        indent < maxDepth
      ) {
        console.log(value, ' ', typeof value)
        return `\n${`xx`.repeat(indent)}<details>\n${`AA`.repeat(
          indent
        )}<summary>${
          indent + ' ' + value.type
        }</summary>\n${unmountObjectToString(value, maxDepth, indent + 1)}${
          `  `.repeat(indent) + indent
        }</details>\n`
      } else {
        return `\n- ${key}: ${value}`
      }
    })
    .join('')
    .concat('\n')
}

let analysisDoc = `# ${exportedModule.declaration.id.name} Class\n`

let classBodyDoc = exportedModuleBody.reduce((resultString, element) => {
  resultString = resultString.concat(`\n## ${element.key.name}\n\n`)

  resultString = resultString.concat(
    `${element.static ? '\nStatic ' : ''}${
      element.kind.charAt(0).toUpperCase() + element.kind.slice(1)
    }\n`
  )

  if (element.value.params.length) {
    resultString = resultString.concat(`\n### Parameters\n\n`)
    resultString = resultString.concat(
      `${element.value.params
        .map((param, index) => `${index + 1}. ${param.name}`)
        .join('\n')
        .concat('\n')}`
    )
  }

  if (element.value.body.body.length) {
    resultString = resultString.concat(
      `\n<details>\n<summary>Body</summary>\n\n${element.value.body.body
        .map((bodyElement) => unmountObjectToString(bodyElement, 3))
        .join('\n')
        .concat('\n</details>\n')}`
    )
  }

  // console.log(element.value.body.body)
  return resultString
}, ``)

analysisDoc = analysisDoc.concat(classBodyDoc)

// console.log(analysisDoc)

fs.writeFile('./analysis.md', analysisDoc, (err) => {
  if (err) console.log(err)
})
