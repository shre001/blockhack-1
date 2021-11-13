{-# LANGUAGE DataKinds #-}
{-# LANGUAGE DeriveAnyClass #-}
{-# LANGUAGE DeriveGeneric #-}
{-# LANGUAGE FlexibleContexts #-}
{-# LANGUAGE MultiParamTypeClasses #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE ScopedTypeVariables #-}
{-# LANGUAGE TemplateHaskell #-}
{-# LANGUAGE TypeApplications #-}
{-# LANGUAGE TypeFamilies #-}
{-# LANGUAGE TypeOperators #-}
{-# LANGUAGE NoImplicitPrelude #-}
-- for Playground imports
{-# OPTIONS_GHC -fno-warn-unused-imports #-}

module Winwin.Contracts.Mediation where

import Control.Lens (view)
import Control.Monad hiding (fmap)
import Data.Aeson (FromJSON, ToJSON)
import Data.Map as Map hiding (filter)
import Data.Text (Text)
import Data.Void (Void)
import GHC.Generics (Generic)
import Ledger hiding (singleton)
import Ledger.Ada as Ada
import Ledger.Constraints
import qualified Ledger.Typed.Scripts as Scripts
import Playground.Contract (ToSchema, ensureKnownCurrencies, printJson, printSchemas, stage) -- printJson, printSchemas, stage and ensureKnownCurrencies for the Playground
import Playground.TH (mkKnownCurrencies, mkSchemaDefinitions)
import Playground.Types (KnownCurrency (..))
import Plutus.Contract
import qualified PlutusTx
import PlutusTx.Prelude hiding (Semigroup (..), unless)

-- IO for Playground
import Text.Printf (printf)
import Prelude (IO, Semigroup (..), Show (..), String, div)

data MediationParams = MediationParams
  { mediator :: PubKeyHash -- the mediator who gets 90% of the mediatorFee
  , platform :: PubKeyHash -- the platform who provides the service gets 10% of the mediatorFee
  , startTime :: POSIXTime -- the startTime of the mediation - funds will be unlocked at that time
  , mediatorFee :: Integer -- the fee in ADA (not lovelace) a mediator sets per party for the service provided
  }
  deriving (Show)

newtype Party = Party PubKeyHash
  deriving (Show)

-- assume 2 parties per mediation right now...
parties :: Integer
parties = 2

adaInLoveLace :: Integer -> Integer
adaInLoveLace = (* 1000000)

PlutusTx.makeLift ''MediationParams
PlutusTx.makeIsDataIndexed ''Party [('Party, 0)]

{-# INLINEABLE mkValidator #-}
mkValidator :: MediationParams -> Maybe Party -> () -> ScriptContext -> Bool
mkValidator p d () ctx = traceIfFalse "valid signature missing" $ validSignature p d
  where
    info :: TxInfo
    info = scriptContextTxInfo ctx

    validSignature :: MediationParams -> Maybe Party -> Bool
    validSignature p (Just (Party pkh)) =
      txSignedBy info (mediator p) || txSignedBy info (platform p)
        || ((txSignedBy info pkh) && traceIfFalse "Invalid party inputs" (isValidPartyInputs $ Party pkh))
    validSignature p _ =
      txSignedBy info (mediator p) || txSignedBy info (platform p)

    isValidPartyInputs :: Party -> Bool
    isValidPartyInputs party =
      [] == [i | i <- filter (isJust . toValidatorHash . txOutAddress) (txInInfoResolved <$> txInfoInputs info), notSatisfyPkhDatum i party]

    notSatisfyPkhDatum :: TxOut -> Party -> Bool
    notSatisfyPkhDatum txOut party = case txOutDatumHash txOut of
      Nothing -> True
      _ -> case findDatumValue info txOut of
        Nothing -> True
        Just party -> False

{-# INLINEABLE findDatumValue #-}
findDatumValue :: TxInfo -> TxOut -> Maybe Datum
findDatumValue info txOut = case txOutDatumHash txOut of
  Nothing -> traceError "No txOutDatumHash"
  Just dhash ->
    let d = findDatum dhash info
     in case d of
          Nothing -> traceError "Datum is not found from hash"
          Just (Datum d) ->
            let value = PlutusTx.fromBuiltinData d
             in case value of
                  Nothing -> traceError "Datum value is empty!"
                  Just _ -> value

data Mediation
instance Scripts.ValidatorTypes Mediation where
  type DatumType Mediation = Maybe Party
  type RedeemerType Mediation = ()

typedValidator :: MediationParams -> Scripts.TypedValidator Mediation
typedValidator p =
  Scripts.mkTypedValidator @Mediation
    ($$(PlutusTx.compile [||mkValidator||]) `PlutusTx.applyCode` PlutusTx.liftCode p)
    $$(PlutusTx.compile [||wrap||])
  where
    wrap = Scripts.wrapValidator @(Maybe Party) @()

validator :: MediationParams -> Validator
validator = Scripts.validatorScript . typedValidator

valHash :: MediationParams -> Ledger.ValidatorHash
valHash = Scripts.validatorHash . typedValidator

scrAddress :: MediationParams -> Ledger.Address
scrAddress = scriptAddress . validator

data PayParams = PayParams
  { ppMediator :: !PubKeyHash
  , ppPlatform :: !PubKeyHash
  , ppStartTime :: !POSIXTime
  , ppMediatorFee :: !Integer
  }
  deriving (Generic, ToJSON, FromJSON, ToSchema, Show)

type MediationSchema =
  Endpoint "pay" PayParams
    .\/ Endpoint "withdraw" PayParams
    .\/ Endpoint "grab" PayParams
    .\/ Endpoint "inspect" ()

payParamsToMediationParams :: PayParams -> MediationParams
payParamsToMediationParams pp =
  MediationParams
    { mediator = ppMediator pp
    , platform = ppPlatform pp
    , startTime = ppStartTime pp
    , mediatorFee = ppMediatorFee pp
    }

pay :: AsContractError e => PayParams -> Contract w s e ()
pay pp = do
  pkh <- pubKeyHash <$> ownPubKey
  let p = payParamsToMediationParams pp
      dat = Just $ Party pkh
      tx = mustPayToTheScript dat $ Ada.lovelaceValueOf $ adaInLoveLace $ ppMediatorFee pp
  ledgerTx <- submitTxConstraints (typedValidator p) tx
  void $ awaitTxConfirmed $ txId ledgerTx
  logInfo @String $
    printf
      "made payment of %d ADA to %s on platform %s"
      (ppMediatorFee pp)
      (show $ ppMediator pp)
      (show $ ppPlatform pp)

grab :: forall w s e. AsContractError e => PayParams -> Contract w s e ()
grab pp = do
  pkh <- pubKeyHash <$> ownPubKey
  now <- currentTime
  -- TODO: check if all parties paid... if not, assume mediation didn't happen
  -- rely on FE for this for now
  if now < ppStartTime pp
    then logInfo @String $ "Mediation has not started yet... Try again later."
    else do
      let p = payParamsToMediationParams pp
      -- check if pkh is either mediator or platform
      if (pkh == mediator p) || (pkh == platform p)
        then do
          utxos <- utxosAt $ scrAddress p
          if Map.null utxos
            then logInfo @String $ "Neither party ever paid."
            else do
              -- split payment
              let platformPay = ppMediatorFee pp * parties * 100000 -- 10% of mediatorFee
                  mediatorPay = adaInLoveLace (ppMediatorFee pp) * parties - platformPay
                  tx =
                    collectFromScript utxos ()
                      <> mustPayToPubKey (mediator p) (Ada.lovelaceValueOf mediatorPay)
                      <> mustPayToPubKey (platform p) (Ada.lovelaceValueOf platformPay)
              ledgerTx <- submitTxConstraintsSpending (typedValidator p) utxos tx
              void $ awaitTxConfirmed $ txId ledgerTx
              logInfo @String $ "Released payment to mediator and platform."
        else logInfo @String $ "Nope. Only the assigned mediator or the platform can release funds."

withdraw :: forall w s e. AsContractError e => PayParams -> Contract w s e ()
withdraw pp = do
  pkh <- pubKeyHash <$> ownPubKey
  let p = payParamsToMediationParams pp
      dat = Just $ Party pkh
  os <- utxosAt (scrAddress p)
  let ownUtxoFilter _ ciTxOut = either id Ledger.datumHash (_ciTxOutDatum ciTxOut) == Ledger.datumHash (Datum (PlutusTx.toBuiltinData $ Just $ Party pkh))
      tx =
        collectFromScriptFilter ownUtxoFilter os ()
          <> mustIncludeDatum (Datum $ PlutusTx.toBuiltinData dat)
  ledgerTx <- submitTxConstraintsSpending (typedValidator p) os tx
  void $ awaitTxConfirmed $ txId ledgerTx
  logInfo @String $ "Withdraw complete."

inspect :: forall w s e. AsContractError e => () -> Contract w s e ()
inspect _ = do
  pk <- ownPubKey
  os <- fmap snd . Map.toList <$> utxosAt (pubKeyAddress pk)
  let totalVal = mconcat [view ciTxOutValue o | o <- os]
  logInfo @String $ "Logging total Value : " <> show totalVal

pay' :: Promise () MediationSchema Text ()
pay' = endpoint @"pay" pay

withdraw' :: Promise () MediationSchema Text ()
withdraw' = endpoint @"withdraw" withdraw

grab' :: Promise () MediationSchema Text ()
grab' = endpoint @"grab" grab

inspect' :: Promise () MediationSchema Text ()
inspect' = endpoint @"inspect" inspect

endpoints :: AsContractError e => Contract () MediationSchema Text e
endpoints = do
  logInfo @String "Waiting for some action."
  selectList [pay', withdraw', grab', inspect'] >> endpoints

mkSchemaDefinitions ''MediationSchema
mkKnownCurrencies []
