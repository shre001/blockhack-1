import axios from 'axios'
import { Neo4jContext } from 'neo4j-graphql-js'
interface PayToMediatorArgs {
  mediatorPKH: string
  partyPKH: string
  caseId: string
}

export default async function PayToMediator(
  parent: unknown,
  args: PayToMediatorArgs,
  context: Neo4jContext
): Promise<boolean> {
  const { driver } = context
  const session = driver.session()
  const { caseId, partyPKH, mediatorPKH } = args

  try {
    const result = await session.run(
      `
      MATCH (m:Mediator {pkh: $mPkh}) 
      MATCH (p:Party {pkh: $pkh})
      MATCH (c:Case {caseId: $caseId}) RETURN c,m,p
      `,
      { pkh: partyPKH, mPkh: mediatorPKH, caseId }
    )
    const record = result.records[0].toObject()
    const party = record.p
    const mediator = record.m
    const caseInfoP = record.c
    const startTime = new Date(caseInfoP.properties.on).getTime()
    const { wid } = party.properties
    const { minCompensation } = mediator.properties
    const resInstance = await axios.post(
      `http://localhost:9080/api/contract/activate`,
      { caID: 'MediationContract', caWallet: { getWalletId: wid } },
      { headers: { 'Content-Type': 'application/json' } }
    )
    const PARTY_INSTANCE_ID = resInstance.data.unContractInstanceId

    await axios.post(
      `http://localhost:9080/api/contract/instance/${PARTY_INSTANCE_ID}/endpoint/pay`,
      {
        ppMediator: { getPubKeyHash: mediatorPKH },
        ppPlatform: { getPubKeyHash: process.env.PLATFORM_PUB },
        ppStartTime: startTime,
        ppMediatorFee: minCompensation.toNumber(),
      },
      { headers: { 'Content-Type': 'application/json' } }
    )
    await session.run(
      `
    MATCH (c:Case {caseId: $caseId})
    MATCH (p:Party {pkh: $pkh})
    MERGE (c)<-[:PAID]-(p)
    MERGE (c)<-[:PARTY_TO]-(p)
    `,
      { caseId, pkh: partyPKH }
    )
    return true
  } catch (err) {
    console.log('%cPayToMediator.ts line:61 err', 'color: #007acc;', err)
    return false
  }
}
