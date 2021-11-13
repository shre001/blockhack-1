const concurrently = require('concurrently')

const { concurrentOpts } = require('./common')

const jobs = [
  {
    name: 'build',
    command: `tsc-watch --onSuccess="nodemon build/src/index.js"`,
    prefixColor: 'green',
  },
  {
    name: 'copy env',
    command: 'shx cp .env build/src/.env',
    prefixColor: 'green',
  },
  {
    name: 'copy schema',
    command: 'shx cp src/schema.graphql build/src/schema.graphql',
    prefixColor: 'green',
  },
]

concurrently(jobs, concurrentOpts).catch((e) => {
  console.error('EMSESSS:', e.message)
})
