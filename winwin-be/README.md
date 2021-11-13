# Win-Win GRAND Backend

1. Set up your PAB Win-Win Service
2. Use the run.sh script to aquire your PubKeyHash for the Platform
3. Edit the .env file for this project and include the following:

| VARIABLE_NAME       | VALUE                       | Default               |
| ------------------- | --------------------------- | --------------------- |
| NEO4J_URI           |                             | bolt://localhost:7687 |
| NEO4J_USER          |                             | neo4j                 |
| NEO4J_PASSWORD      |                             | neo4j                 |
| PLATFORM_PUB        | Get from run script off PAB |                       |
| GRAPHQL_SERVER_HOST |                             | 0.0.0.0               |
| GRAPHQL_SERVER_PORT |                             | 4001                  |
| GRAPHQL_SERVER_PATH |                             | /graphql              |


4. Start the server with `npm run start`