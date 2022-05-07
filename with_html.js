const fs = require('fs')
const esprima = require('esprima')

const IS_STYLE_SUPPORTED = false

const file = fs.readFileSync('./tbflot.js', 'utf8')

const tree = esprima.parseModule(file)
const exportedModule = tree.body[tree.body.length - 1]
const exportedModuleBody = exportedModule.declaration.body.body

const docStyle = `<style>
    span.tag{
        container: inline-block;
        color: #efefef;
        font-size: 0.8em;
        margin-left: 0.5em;
        background-color: transparent;
    }
    span.tag span.key{
        padding: 0.1em;
        padding-left: 0.3em;
        padding-right: 0.3em;
        background-color: #5f5f4f;
        border: solid #443;
        border-width: 1px 0px 1px 1px;
        border-radius: 4px 0 0 4px;
    }
    span.tag span.value{
        padding: 0.1em;
        padding-left: 0.3em;
        padding-right: 0.3em;
        background-color: #3f8020;
        border: solid #251;
        border-width: 1px 1px 1px 0px;
        border-radius: 0 4px 4px 0;
    }
</style>\n\n`

let analysisDoc = `# ${exportedModule.declaration.id.name} Class\n`

if (IS_STYLE_SUPPORTED) analysisDoc = docStyle.concat(analysisDoc)

let classBodyDoc = exportedModuleBody.reduce((resultString, element) => {
  resultString = resultString.concat(`\n## ${element.key.name}\n\n`)
  if (IS_STYLE_SUPPORTED) {
    resultString = resultString.concat(
      `<span class="tag"><span class="key">Kind</span><span class="value">${
        element.kind.charAt(0).toUpperCase() + element.kind.slice(1)
      }</span></span>${
        element.static
          ? `<span class="tag"><span class="key">Static:</span><span class="value">True</span></span>`
          : ``
      }
    \n`
    )
  } else {
    resultString = resultString.concat(
      `${element.static ? '\nStatic ' : ''}${
        element.kind.charAt(0).toUpperCase() + element.kind.slice(1)
      }\n`
    )
  }

  if (element.value.params.length) {
    resultString = resultString.concat(`\n### Parameters\n\n`)
    resultString = resultString.concat(
      `${element.value.params
        .map((param) => `- ${param.name}`)
        .join('\n')
        .concat('\n')}`
    )
  }

  console.log(element.value.body.body)
  return resultString
}, ``)

analysisDoc = analysisDoc.concat(classBodyDoc)

// console.log(analysisDoc)

fs.writeFile('./analysis.md', analysisDoc, (err) => {
  if (err) console.log(err)
})
