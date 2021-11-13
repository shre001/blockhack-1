# Mediation Contract for Win-Win Dispute Resolution

This project has been created from IOG's [Plutus-Starter](https://github.com/input-output-hk/plutus-starter) template.

## Setting up

### Cabal+Nix build

Set up your machine to build things with `Nix`, following the [Plutus README](https://github.com/input-output-hk/plutus/blob/master/README.adoc) (make sure to set up the binary cache!).

To enter a development environment, simply open a terminal on the project's root and use `nix-shell` to get a bash shell:

```
$ nix-shell
```

Otherwise, you can use [direnv](https://github.com/direnv/direnv) which allows you to use your preferred shell (zsh!). Once installed, just run:

```
$ echo "use nix" > .envrc # Or manually add "use nix" in .envrc if you already have one
$ direnv allow
```

and you'll have a working development environment for now and the future whenever you enter this directory.

The build should not take too long if you correctly set up the binary cache. If it starts building GHC, stop and setup the binary cache.

Afterwards, the command `cabal build` from the terminal should work (if `cabal` couldn't resolve the dependencies, run `cabal update` and then `cabal build`).


## The Plutus Application Backend (PAB)

1. Build the PAB executable:

```
cabal build plutus-starter-pab
```

2. Run the PAB binary:

```
cabal exec -- plutus-starter-pab
````

This will then start up the server on port 9080.

3. Run the script:

Running `run.sh` requires the presence of the `jq` tool.
Executing the file creates four wallets (Party A, Party B, Mediator, and Platform).
Party A and Party B pay into the smart contract.
Finally, the Mediator hits the `grab` endpoint and thus, funds are dispersed to the Mediator and the Platform at the set ratio.

```
./run.sh
```
