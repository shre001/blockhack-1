#1/bin/sh
echo " __________________________________________________"
echo "< Win-Win Dispute Resolution Demo for Blockhack!!! >"
echo " --------------------------------------------------"
echo "    \\                                  ___-------___"
echo "     \\                             _-~~             ~~-_"
echo "      \\                         _-~                    /~-_"
echo "             /^\\__/^\\         /~  \\                   /    \\"
echo "           /|  O|| O|        /      \\_______________/        \\"
echo "          | |___||__|      /       /                \\          \\"
echo "          |          \\    /      /                    \\          \\"
echo "          |   (_______) /______/                        \\_________ \\"
echo "          |         / /         \\                      /            \\"
echo "           \\         \\^\\\\         \\                  /               \\     /"
echo "             \\         ||           \\______________/      _-_       //\\__//"
echo "               \\       ||------_-~~-_ ------------- \\ --/~   ~\\    || __/"
echo "                 ~-----||====/~     |==================|       |/~~~~~"
echo "                  (_(__/  ./     /                    \\_\\      \\."
echo "                         (_(___/                         \\_____)_)"
echo ""

export A=$(curl -s -d '' http://localhost:9080/wallet/create)
export PARTY_A=`echo $A | jq '.wiWallet.getWalletId'`
sleep 1
export B=$(curl -s -d '' http://localhost:9080/wallet/create)
export PARTY_B=`echo $B | jq '.wiWallet.getWalletId'`
sleep 1
export M=$(curl -s -d '' http://localhost:9080/wallet/create)
export MEDIATOR=`echo $M | jq '.wiWallet.getWalletId'`
export MEDIATOR_PUB=`echo $M | jq '.wiPubKeyHash.getPubKeyHash'`
sleep 1
export P=$(curl -s -d '' http://localhost:9080/wallet/create)
export PLATFORM=`echo $P | jq '.wiWallet.getWalletId'`
export PLATFORM_PUB=`echo $P | jq '.wiPubKeyHash.getPubKeyHash'`
sleep 1

export PARTY_A_ID=$(curl -s -H "Content-Type: application/json" -X POST -d '{"caID": "MediationContract", "caWallet":{"getWalletId": '$PARTY_A'}}' http://localhost:9080/api/contract/activate | jq .unContractInstanceId | tr -d '"')
sleep 1
export PARTY_B_ID=$(curl -s -H "Content-Type: application/json" -X POST -d '{"caID": "MediationContract", "caWallet":{"getWalletId": '$PARTY_B'}}' http://localhost:9080/api/contract/activate | jq .unContractInstanceId | tr -d '"')
sleep 1
export MEDIATOR_ID=$(curl -s -H "Content-Type: application/json" -X POST -d '{"caID": "MediationContract", "caWallet":{"getWalletId": '$MEDIATOR'}}' http://localhost:9080/api/contract/activate | jq .unContractInstanceId | tr -d '"')
sleep 1
export PLATFORM_ID=$(curl -s -H "Content-Type: application/json" -X POST -d '{"caID": "MediationContract", "caWallet":{"getWalletId": '$PLATFORM'}}' http://localhost:9080/api/contract/activate | jq .unContractInstanceId | tr -d '"')
sleep 1

# PARTY_A pays the MEDIATOR
curl -H "Content-Type: application/json" -X POST -d '{"ppMediator":{"getPubKeyHash": '$MEDIATOR_PUB'},"ppPlatform":{"getPubKeyHash": '$PLATFORM_PUB'},"ppMediatorFee":1000,"ppStartTime":1}' http://localhost:9080/api/contract/instance/$PARTY_A_ID/endpoint/pay
sleep 1
# curl -H "Content-Type: application/json" http://localhost:9080/api/contract/instance/$PARTY_A_ID/status
# PARTY_B pays the MEDIATOR
curl -H "Content-Type: application/json" -X POST -d '{"ppMediator":{"getPubKeyHash": '$MEDIATOR_PUB'},"ppPlatform":{"getPubKeyHash": '$PLATFORM_PUB'},"ppMediatorFee":1000,"ppStartTime":1}' http://localhost:9080/api/contract/instance/$PARTY_B_ID/endpoint/pay
sleep 1
# curl -H "Content-Type: application/json" http://localhost:9080/api/contract/instance/$PARTY_B_ID/status

# PARTY_A tries to call grab unsuccessfully (only mediator or platform are allowed to do so)
# curl -H "Content-Type: application/json" -X POST -d '{"ppMediator":{"getPubKeyHash": '$MEDIATOR_PUB'},"ppPlatform":{"getPubKeyHash": '$PLATFORM_PUB'},"ppMediatorFee":1000,"ppStartTime":1}' http://localhost:9080/api/contract/instance/$PARTY_A_ID/endpoint/grab

# inspect MEDIATOR
# curl -H "Content-Type: application/json" -X POST -d '[]' http://localhost:9080/api/contract/instance/$MEDIATOR_ID/endpoint/inspect
# sleep 1
curl -H "Content-Type: application/json" http://localhost:9080/api/contract/instance/$MEDIATOR_ID/status
sleep 1
# inspect PLATFORM
# curl -H "Content-Type: application/json" -X POST -d '[]' http://localhost:9080/api/contract/instance/$PLATFORM_ID/endpoint/inspect
# sleep 1
# MEDIATOR grabs the funds
# curl -H "Content-Type: application/json" -X POST -d '{"ppMediator":{"getPubKeyHash": '$MEDIATOR_PUB'},"ppPlatform":{"getPubKeyHash": '$PLATFORM_PUB'},"ppMediatorFee":1000,"ppStartTime":1}' http://localhost:9080/api/contract/instance/$MEDIATOR_ID/endpoint/grab
# sleep 1
# PLATFORM grabs the funds
curl -H "Content-Type: application/json" -X POST -d '{"ppMediator":{"getPubKeyHash": '$MEDIATOR_PUB'},"ppPlatform":{"getPubKeyHash": '$PLATFORM_PUB'},"ppMediatorFee":1000,"ppStartTime":1}' http://localhost:9080/api/contract/instance/$PLATFORM_ID/endpoint/grab
sleep 1

# inspect MEDIATOR again
# curl -H "Content-Type: application/json" -X POST -d '[]' http://localhost:9080/api/contract/instance/$MEDIATOR_ID/endpoint/inspect
# sleep 1
# inspect PLATFORM again
# curl -H "Content-Type: application/json" -X POST -d '[]' http://localhost:9080/api/contract/instance/$PLATFORM_ID/endpoint/inspect
# sleep 1

curl -H "Content-Type: application/json" http://localhost:9080/api/contract/instance/$MEDIATOR_ID/status
sleep 1
# curl -H "Content-Type: application/json" http://localhost:9080/api/contract/instance/$PLATFORM_ID/status

echo ""
echo "Party A wallet: $PARTY_A"
echo "Party B wallet: $PARTY_B"
echo "Mediator wallet: $MEDIATOR"
echo "Platform wallet: $PLATFORM"

echo "Please remember leftover fund allocations. All wallets in here are created equal, but some are more equal. ;)"
echo "Check out: https://github.com/input-output-hk/plutus/issues/3958"

