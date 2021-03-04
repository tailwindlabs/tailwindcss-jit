function removeLayerAtRules(context) {
  return (root) => {
    root.walkAtRules('layer', (rule) => {
      rule.remove()
    })
  }
}

module.exports = removeLayerAtRules
