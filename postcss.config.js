function indentRecursive(node, indent = 0) {
  node.each &&
    node.each((child, i) => {
      if (!child.raws.before || child.raws.before.includes('\n')) {
        child.raws.before = `\n${node.type !== 'rule' && i > 0 ? '\n' : ''}${'  '.repeat(indent)}`
      }
      child.raws.after = `\n${'  '.repeat(indent)}`
      indentRecursive(child, indent + 1)
    })
}

function formatNodes(root) {
  indentRecursive(root)
  if (root.first) {
    root.first.raws.before = ''
  }
}

module.exports = {
  plugins: [
    require('./src/index.js')({
      // ...
    }),
    formatNodes,

    // process.env.NODE_ENV === 'production' ?
    // require('autoprefixer'),
    // require('cssnano'),
  ],
}
