function collapseAdjacentRules(context) {
  return (root) => {
    let currentRule = null
    root.each((node) => {
      if (node.type !== 'atrule') {
        currentRule = null
        return
      }

      if (currentRule === null) {
        currentRule = node
        return
      }

      if (node.params === currentRule.params) {
        currentRule.append(node.nodes)
        node.remove()
      } else {
        currentRule = node
      }
    })
  }
}

module.exports = collapseAdjacentRules
