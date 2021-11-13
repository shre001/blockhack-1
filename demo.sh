#1/bin/sh
export A=$(curl -s -d '' http://localhost:9080/wallet/create)
export PARTY_A=`echo $A | jq '.wiWallet.getWalletId'`
export A_PUB=`echo $A | jq '.wiPubKeyHash.getPubKeyHash'`
sleep 1
export B=$(curl -s -d '' http://localhost:9080/wallet/create)
export PARTY_B=`echo $B | jq '.wiWallet.getWalletId'`
export B_PUB=`echo $B | jq '.wiPubKeyHash.getPubKeyHash'`
sleep 1
export M=$(curl -s -d '' http://localhost:9080/wallet/create)
export MEDIATOR=`echo $M | jq '.wiWallet.getWalletId'`
export MEDIATOR_PUB=`echo $M | jq '.wiPubKeyHash.getPubKeyHash'`
sleep 1
export P=$(curl -s -d '' http://localhost:9080/wallet/create)
export PLATFORM=`echo $P | jq '.wiWallet.getWalletId'`
export PLATFORM_PUB=`echo $P | jq '.wiPubKeyHash.getPubKeyHash'`
sleep 1

export MEDIATOR_ID=$(curl -s -H "Content-Type: application/json" -X POST -d '{"caID": "MediationContract", "caWallet":{"getWalletId": '$MEDIATOR'}}' http://localhost:9080/api/contract/activate | jq .unContractInstanceId | tr -d '"')
sleep 1
export PLATFORM_ID=$(curl -s -H "Content-Type: application/json" -X POST -d '{"caID": "MediationContract", "caWallet":{"getWalletId": '$PLATFORM'}}' http://localhost:9080/api/contract/activate | jq .unContractInstanceId | tr -d '"')
sleep 1

echo ""
echo "Party A wallet: $PARTY_A"
echo "Party A pub: $A_PUB"
echo "Party B wallet: $PARTY_B"
echo "Party B pub: $B_PUB"
echo "Mediator wallet: $MEDIATOR"
echo "Mediator pub: $MEDIATOR_PUB"
echo "Platform pub: $PLATFORM_PUB"
