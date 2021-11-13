import { typeDefs, resolvers } from './gql'
import { ApolloServer } from 'apollo-server-express'
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core'
import express from 'express'
import neo4j from 'neo4j-driver'
import { makeAugmentedSchema } from 'neo4j-graphql-js'
import dotenv from 'dotenv'
import { Neo4jContext } from 'neo4j-graphql-js'
dotenv.config()

const app = express()

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'neo4j'
  )
)

const neoSchema = makeAugmentedSchema({ typeDefs, resolvers })

/*
 * Create a new ApolloServer instance, serving the GraphQL schema
 * created using makeAugmentedSchema above and injecting the Neo4j driver
 * instance into the context object so it is available in the
 * generated resolvers to connect to the database.
 */

const server = new ApolloServer({
  context: {
    driver,
    driverConfig: { database: process.env.NEO4J_DATABASE || 'neo4j' },
  } as Neo4jContext,
  schema: neoSchema,
  introspection: true,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
})

// Specify host, port and path for GraphQL endpoint
const port = process.env.GRAPHQL_SERVER_PORT || 4001
const path = process.env.GRAPHQL_SERVER_PATH || '/graphql'
const host = process.env.GRAPHQL_SERVER_HOST || '0.0.0.0'

/*
 * Optionally, apply Express middleware for authentication, etc
 * This also also allows us to specify a path for the GraphQL endpoint
 */
;(async function () {
  await server.start()
  server.applyMiddleware({ app, path })
  app.listen({ host, port, path }, () => {
    console.log(`GraphQL server ready at http://${host}:${port}${path}`)
  })
})()
