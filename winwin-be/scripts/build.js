const concurrently = require('concurrently')

const {
  API_DIR,
  TEMPLATE_DIR,
  runner,
  concurrentOpts,
  templateName,
} = require('./common')

const jobs = [
  {
    name: 'api',
    command: `cd ${API_DIR} && ${runner} run build`,
    prefixColor: 'green',
  },
]

jobs.push({
  name: templateName,
  command: `cd ${TEMPLATE_DIR} && ${runner} run build`,
  prefixColor: 'blue',
})

concurrently(jobs, concurrentOpts).catch((e) => {
  console.error(e.message)
})
