import { Neo4jContext } from 'neo4j-graphql-js'
import dotenv from 'dotenv'
dotenv.config()
const { MJ_KEY, MJ_SECRET } = process.env
const mailjet = require('node-mailjet').connect(MJ_KEY || '', MJ_SECRET || '')
interface InviteToMediationArgs {
  mediatorPKH: string
  partyPKH: string
  otherPartyEmail: string
  startDate: string
}

export default async function InviteToMediation(
  parent: unknown,
  args: InviteToMediationArgs,
  context: Neo4jContext
): Promise<boolean> {
  const { mediatorPKH, partyPKH, otherPartyEmail, startDate } = args
  const { driver } = context
  const session = driver.session()
  try {
    const result = await session.run(
      `
      MATCH (m:Mediator {pkh: $mediatorPKH})<-[:REQUESTS_AVAILABLE_SLOT]-(c:Case {on: dateTime($startDate)})
      MATCH(p:Party {pkh: $partyPKH}) RETURN m,c,p`,
      {
        mediatorPKH,
        partyPKH,
        startDate,
      }
    )
    const record = result.records[0].toObject()
    const mediator = record.m.properties
    const partyA = record.p.properties
    const caseInfo = record.c.properties
    const data = {
      PARTY_A: partyA.name,
      MEDIATOR: mediator.name,
      CASE: caseInfo.caseId,
      date: new Date(caseInfo.on).toISOString(),
      Origin: encodeURI(
        `http://localhost:3000/accept-deny-mediation/${caseInfo.caseId}/${otherPartyEmail}`
      ),
    }
    await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: 'eli@aroyo.in',
            Name: 'Win Win',
          },
          To: [
            {
              Email: otherPartyEmail,
            },
          ],
          TemplateID: 3221263,
          TemplateLanguage: true,
          Subject: 'Invitation to Win Win!',
          Variables: data,
        },
      ],
    })
    return true
  } catch (err) {
    console.error(err)
    return false
  }
}
