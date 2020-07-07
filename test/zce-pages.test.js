const test = require('ava')
const zcePages = require('..')

// TODO: Implement module test
test('<test-title>', t => {
  const err = t.throws(() => zcePages(100), TypeError)
  t.is(err.message, 'Expected a string, got number')

  t.is(zcePages('w'), 'w@zce.me')
  t.is(zcePages('w', { host: 'wedn.net' }), 'w@wedn.net')
})
