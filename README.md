# Win-Win demo for Blockhack 2021

## Setup

### Start Neo4j

```shell
docker run \
    --publish=7474:7474 --publish=7687:7687 \
    --env NEO4J_AUTH=neo4j/thyraedwards \
    --ulimit=nofile=40000:40000 \
    --env 'NEO4JLABS_PLUGINS=["apoc"]' \
    neo4j
```

### Start PAB

In __winwin-pab__:

```shell
cabal build plutus-starter-pab && cabal exec -- plutus-starter-pab
```

#### Create some wallets and get ids and pkh

Run `demo.sh` and take note of the outputs for later use.

### Start Web Back-End

Install dependencies in __winwin-be__ via `npm i`.

Create a __.env__ file with these environment variables:

- NEO4J_PASSWORD (set it to thyraedwards if you used the docker command above)
- PLATFORM_PUB (taken from the __demo.sh__ output)
- Mailjet settings (MJ_KEY and MJ_SECRET)

Then run `npm start`.

### Start Web Front-End

Install dependencies in __winwin-fe__ via `npm i`.

Run `npm run start:local`.

## Demo Prep (skipping some boring stuff)

[Sign up a mediator](http://localhost:3000/signup/mediator-signup) using the wallet id and pkh from before.

## Happy Path Demo Time

[Sign up Party A](http://localhost:3000/signup/party-signUp) (e.g. Vitalik B) and go through the flow.

Make sure to keep an eye on the log of the PAB when paying for the mediation.

Open the invitation email for Party B in another browser, enter details, pay, be happy that it all worked.

### Happy, but out of scope

Not in scope for the demo is the grabbing of the funds.
Testing of the proper functionality (incl. who can call the endpoints at what times) can be accomplished through scripts utilizing curl or other http clients. See the __run.sh__ in the __winwin-pab__ directory.

The contract pays out 10% to the platform and 90% to the mediator. It is largely based on the [Plutus Capstone](https://github.com/Loxe-Inc/mediation-contract), which unfortunately had a bug that I nor the mentors did not catch in time.
