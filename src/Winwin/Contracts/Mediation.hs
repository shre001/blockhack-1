{-# LANGUAGE DataKinds             #-}
{-# LANGUAGE DeriveAnyClass        #-}
{-# LANGUAGE DeriveGeneric         #-}
{-# LANGUAGE FlexibleContexts      #-}
{-# LANGUAGE MultiParamTypeClasses #-}
{-# LANGUAGE NoImplicitPrelude     #-}
{-# LANGUAGE OverloadedStrings     #-}
{-# LANGUAGE ScopedTypeVariables   #-}
{-# LANGUAGE TemplateHaskell       #-}
{-# LANGUAGE TypeApplications      #-}
{-# LANGUAGE TypeFamilies          #-}
{-# LANGUAGE TypeOperators         #-}

{-# OPTIONS_GHC -fno-warn-unused-imports #-} -- for Playground imports

-- Contract POC that will power Win-Win Dispute Resolution
-- Make sure to vote for our Fund6 proposal: https://cardano.ideascale.com/a/dtd/Win-Win-Dispute-Resolution/368353-48088

-- Related proposals
-- Blace.io Marketplace Creator: https://cardano.ideascale.com/a/dtd/Extensible-Marketplace-Base-Layer/368797-48088
-- Skill certification for Mediators: https://cardano.ideascale.com/a/dtd/Skill-certification-for-Mediators/368777-48088
-- Proof of identity for mediators: https://cardano.ideascale.com/a/dtd/Proof-of-identity-for-mediators/368367-48088
-- Gravatar for ADA Wallets: https://cardano.ideascale.com/a/dtd/Gravatar-for-ADA-Wallets/367448-48088

-- Other projects
-- Cardano in South L.A.: https://cardano.ideascale.com/a/dtd/Cardano-in-South-L-A/367936-48088
-- Scam Alert: https://cardano.ideascale.com/a/dtd/Scam-Alert/367015-48088

module Winwin.Contracts.Mediation where

import           Control.Monad        hiding (fmap)
import           Data.Aeson           (ToJSON, FromJSON)
import           Data.Map             as Map
import           Data.Text            (Text)
import           Data.Void            (Void)
import           GHC.Generics         (Generic)
import           Plutus.Contract
import qualified PlutusTx
import           PlutusTx.Prelude     hiding (Semigroup(..), unless)
import           Ledger               hiding (singleton)
import           Ledger.Constraints   as Constraints
import qualified Ledger.Typed.Scripts as Scripts
import           Ledger.Ada           as Ada
import           Playground.Contract  (ToSchema, printSchemas, printJson, stage, ensureKnownCurrencies) -- printJson, printSchemas, stage and ensureKnownCurrencies for the Playground
import           Playground.TH        (mkKnownCurrencies, mkSchemaDefinitions)
import           Playground.Types     (KnownCurrency (..))
import           Prelude              (Semigroup (..), Show (..), String, div, IO) -- IO for Playground
import           Text.Printf          (printf)

data MediationParams = MediationParams
    { mediator    :: PubKeyHash -- the mediator who gets 90% of the mediatorFee
    , platform    :: PubKeyHash -- the platform who provides the service gets 10% of the mediatorFee
    -- , startTime   :: POSIXTime  -- the startTime of the mediation - funds will be unlocked at that time
    , mediatorFee :: Integer    -- the fee in ADA (not lovelace) a mediator sets per party for the service provided
    } deriving Show

-- assume 2 parties per mediation right now...
parties :: Integer
parties = 2

adaInLoveLace :: Integer -> Integer
adaInLoveLace = (*1000000)

PlutusTx.makeLift ''MediationParams

{-# INLINABLE mkValidator #-}
mkValidator :: MediationParams -> () -> () -> ScriptContext -> Bool
mkValidator p () () ctx = traceIfFalse "mediator's or platform's signature missing" validSignature
                          -- traceIfFalse "startTime not reached"                      startTimeReached
  where
    info :: TxInfo
    info = scriptContextTxInfo ctx

    validSignature :: Bool
    validSignature = txSignedBy info (mediator p) || txSignedBy info (platform p)

    -- startTimeReached :: Bool
    -- startTimeReached = contains (from $ startTime p) $ txInfoValidRange info

data Mediation
instance Scripts.ValidatorTypes Mediation where
    type instance DatumType Mediation = ()
    type instance RedeemerType Mediation = ()

typedValidator :: MediationParams -> Scripts.TypedValidator Mediation
typedValidator p = Scripts.mkTypedValidator @Mediation
    ($$(PlutusTx.compile [|| mkValidator ||]) `PlutusTx.applyCode` PlutusTx.liftCode p)
     $$(PlutusTx.compile [|| wrap ||])
  where
    wrap = Scripts.wrapValidator @() @()

validator :: MediationParams -> Validator
validator = Scripts.validatorScript . typedValidator

valHash :: MediationParams -> Ledger.ValidatorHash
valHash = Scripts.validatorHash . typedValidator

scrAddress :: MediationParams -> Ledger.Address
scrAddress = scriptAddress . validator

data PayParams = PayParams
    { ppMediator    :: !PubKeyHash
    , ppPlatform    :: !PubKeyHash
    -- , ppStartTime   :: !POSIXTime
    , ppMediatorFee :: !Integer
    } deriving (Generic, ToJSON, FromJSON, ToSchema, Show)

type MediationSchema =
            Endpoint "pay"  PayParams
        .\/ Endpoint "grab" PayParams

payParamsToMediationParams :: PayParams -> MediationParams
payParamsToMediationParams pp = MediationParams
                { mediator    = ppMediator pp
                , platform    = ppPlatform pp
                -- , startTime   = ppStartTime pp
                , mediatorFee = ppMediatorFee pp
                }

pay :: AsContractError e => PayParams -> Contract w s e ()
pay pp = do
    let p  = payParamsToMediationParams pp
        tx = mustPayToTheScript () $ Ada.lovelaceValueOf $ adaInLoveLace $ ppMediatorFee pp
    ledgerTx <- submitTxConstraints (typedValidator p) tx
    void $ awaitTxConfirmed $ txId ledgerTx
    logInfo @String $ printf "made payment of %d ADA to %s on platform %s"
        (ppMediatorFee pp)
        (show $ ppMediator pp)
        (show $ ppPlatform pp)

-- TODO: cancel endpoint (prior mediation startTime or past mediation startTime, but other party didn't pay... can only be called by party who paid)

grab :: forall w s e. AsContractError e => PayParams -> Contract w s e ()
grab pp = do
    pkh   <- pubKeyHash <$> ownPubKey
    -- now   <- currentTime
    -- TODO: check if all parties paid... if not, assume mediation didn't happen
    -- rely on FE for this for now
    if False --now < ppStartTime pp
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
                           let lookups     = Constraints.unspentOutputs utxos      <>
                                             Constraints.otherScript (validator p)
                               -- split payment
                               platformPay = ppMediatorFee pp * 100000 * parties -- 10% of mediatorFee
                               mediatorPay = adaInLoveLace (ppMediatorFee pp) * parties - platformPay
                               tx          = mconcat [
                                               mustPayToPubKey (mediator p) (Ada.lovelaceValueOf mediatorPay),
                                               mustPayToPubKey (platform p) (Ada.lovelaceValueOf platformPay)
                                             ]
                           ledgerTx <- submitTxConstraintsWith @Void lookups tx
                           void $ awaitTxConfirmed $ txId ledgerTx
                           logInfo @String $ "Released payment to mediator and platform."
               else logInfo @String $ "Nope. Only the assigned mediator or the platform can release funds."

pay' :: Promise () MediationSchema Text ()
pay'  = endpoint @"pay" pay

grab' :: Promise () MediationSchema Text ()
grab' = endpoint @"grab" grab

endpoints :: AsContractError e => Contract () MediationSchema Text e
endpoints = do
    logInfo @String "Waiting for some action."
    selectList [pay', grab'] >> endpoints

mkSchemaDefinitions ''MediationSchema
mkKnownCurrencies []
