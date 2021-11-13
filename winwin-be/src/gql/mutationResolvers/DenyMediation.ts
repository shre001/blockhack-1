import { Neo4jContext } from 'neo4j-graphql-js'

interface DenyMediationArgs {
  email: string
  caseId: string
}

export default async function DenyMediation(
  parent: unknown,
  args: DenyMediationArgs,
  context: Neo4jContext
): Promise<boolean> {
  const { driver } = context
  const session = driver.session()
  const { email, caseId } = args
  try {
    const result = await session.run(
      `
      MATCH (c:Case {caseId: $caseId})-[r:REQUESTS_AVAILABLE_SLOT]->(m:Mediator)
      MATCH (a:Availability {on: c.on})
      DELETE r
      WITH a,c,m MERGE (m:Mediator)-[:IS_AVAILABLE]->(a)
      WITH c.deniedBy SET coalesce(c.deniedBy, []) + $email
      RETURN c
      `,
      { email, caseId }
    )
    const record = result.records[0].toObject()
    const caseInfo = record['c']
    return caseInfo
  } catch (err) {
    console.error(err)
    return false
  }
}
