import { gql } from 'apollo-server'

export const typeDefs = gql`
  scalar DateTime
  type Mutation {
    AddAvailability(pkh: String!, dates: [String!]): [Availability]
      @cypher(
        statement: """
        MATCH (m:Mediator {pkh: $pkh})
        UNWIND $dates as date
        OPTIONAL MATCH (a:Availability {on:dateTime(date)})
        WITH m, a, date
          CALL apoc.do.when(a is NULL,
            'CREATE (node:Availability {on: dateTime(date)})<-[:IS_AVAILABLE]-(m) RETURN node',
            'MERGE (a)<-[:IS_AVAILABLE]-(m) RETURN a AS node',
            {a:a, m:m, date:date}
        ) YIELD value
        RETURN value.node AS node
        """
      )
    CreateMediator(
      pkh: String!
      wid: String!
      name: String!
      email: String!
    ): Mediator
      @cypher(
        statement: """
        MERGE (m:Mediator {pkh: $pkh, name: $name, wid: $wid, email: $email})
        ON CREATE SET m.userId=apoc.create.uuid()
        RETURN m
        """
      )
    CreateParty(
      pkh: String!
      name: String!
      wid: String!
      email: String!
    ): Party
      @cypher(
        statement: """
        MERGE (c:Party {pkh: $pkh, name: $name, wid: $wid, email: $email})
        ON CREATE SET c.userId=apoc.create.uuid()
        RETURN c
        """
      )
    SetMinCompensation(pkh: String!, minCompensation: Int!): Mediator
      @cypher(
        statement: """
        MATCH (m:Mediator {pkh:$pkh}) SET m.minCompensation=$minCompensation
        RETURN m
        """
      )
    TakeAvailability(
      mediatorPKH: String!
      partyPKH: String!
      availability: String!
    ): Case
      @cypher(
        statement: """
        MATCH (m:Mediator {pkh: $mediatorPKH})-[s:IS_AVAILABLE]->(a:Availability {on: dateTime($availability)})
        MATCH (p:Party {pkh: $partyPKH})
        WITH a,m,p,s CREATE (m)<-[r:REQUESTS_AVAILABLE_SLOT {createdAt: dateTime()}]-(c:Case {caseId: apoc.create.uuid(), on: a.on})<-[:PARTY_TO]-(p)
        DELETE s
        RETURN c
        """
      )
    PayToMediator(mediatorPKH: String!, partyPKH: String!, caseId: ID!): Boolean
    InviteToMediation(
      mediatorPKH: String!
      partyPKH: String!
      otherPartyEmail: String!
      startDate: String!
    ): Boolean
    DenyMediation(email: String!, caseId: String!): Case
  }

  type Availability {
    on: DateTime
    mediators: [Mediator] @relation(name: "IS_AVAILABLE", direction: IN)
  }

  type Case {
    caseId: ID!
    parties: [Party] @relation(name: "PARTY_TO", direction: IN)
    paidParties: [Party] @relation(name: "PAID", direction: IN)
    paidPartiesN: Int
      @cypher(
        statement: """
        RETURN size((this)<-[:PAID]-(:Party))
        """
      )
    mediator: Mediator
      @relation(name: "REQUESTS_AVAILABLE_SLOT", direction: OUT)
    on: DateTime!
  }

  type PAID @relation(name: "PAID") {
    from: Party!
    to: Case!
    on: DateTime!
  }

  type REQUESTS_AVAILABLE_SLOT @relation(name: "REQUESTS_AVAILABILE_SLOT") {
    from: Case!
    to: Mediator!
    availability: DateTime!
    createdAt: DateTime!
  }

  interface User {
    userId: ID!
    name: String!
    pkh: String! @unique
    wid: String! @unique
    email: String!
  }

  type Party implements User {
    userId: ID!
    name: String!
    pkh: String! @unique
    wid: String! @unique
    email: String!
    partyTo: [Case] @relation(name: "PARTY_TO", direction: OUT)
  }

  type Mediator implements User {
    userId: ID!
    name: String!
    pkh: String! @unique
    wid: String! @unique
    email: String!
    availability: [Availability] @relation(name: "IS_AVAILABLE", direction: OUT)
    minCompensation: Int
    cases: [Case]
      @cypher(
        statement: """
        MATCH (this)<-[:REQUESTS_AVAILABLE_SLOT]-(c:Case)
        RETURN c
        """
      )
  }
`
