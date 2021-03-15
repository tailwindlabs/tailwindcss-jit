let comparisonMap = {
  atrule: 'params',
  rule: 'selector',
}
let types = new Set(Object.keys(comparisonMap))

function collapseAdjacentRules(context) {
  return (root) => {
    let currentRule = null
    root.each((node) => {
      if (!types.has(node.type)) {
        currentRule = null
        return
      }

      if (currentRule === null) {
        currentRule = node
        return
      }

      let property = comparisonMap[node.type]

      if (node.type === 'atrule' && node.name === 'font-face') {
        currentRule = node
      } else if (node[property] === currentRule[property]) {
        currentRule.append(node.nodes)
        node.remove()
      } else {
        currentRule = node
      }
    })
  }
}

module.exports = collapseAdjacentRules
