#!/usr/bin/env node
 // process.argv 获取参数
process.argv.push('--cwd')
process.argv.push(process.cwd())
process.argv.push('--gulpfile')
process.argv.push(require.resolve('..'))

// console.log(process.argv)
require('gulp/bin/gulp')

// console.log('zce--pages')