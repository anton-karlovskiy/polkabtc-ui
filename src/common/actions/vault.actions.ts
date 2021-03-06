import { VaultReplaceRequest } from '../types/vault.types';
import { Vault } from '../types/vault.types';

import {
  AddReplaceRequests,
  UpdateBTCAddress,
  UpdateCollateralization,
  UpdateCollateral,
  UpdateLockedBTC,
  UpdateSLA,
  UpdatePremiumVault,
  UpdateAPY,
  ADD_REPLACE_REQUESTS,
  UPDATE_BTC_ADDRESS,
  UPDATE_COLLATERALIZATION,
  UPDATE_COLLATERAL,
  UPDATE_LOCKED_BTC,
  UPDATE_SLA,
  UPDATE_PREMIUM_VAULT,
  UPDATE_APY
} from '../types/actions.types';

export const addReplaceRequestsAction = (requests: VaultReplaceRequest[]): AddReplaceRequests => ({
  type: ADD_REPLACE_REQUESTS,
  requests
});

export const updateBTCAddressAction = (btcAddress: string): UpdateBTCAddress => ({
  type: UPDATE_BTC_ADDRESS,
  btcAddress
});

export const updateCollateralizationAction = (collateralization: string | undefined): UpdateCollateralization => ({
  type: UPDATE_COLLATERALIZATION,
  collateralization
});

export const updateCollateralAction = (collateral: string): UpdateCollateral => ({
  type: UPDATE_COLLATERAL,
  collateral
});

export const updateLockedBTCAction = (lockedBTC: string): UpdateLockedBTC => ({
  type: UPDATE_LOCKED_BTC,
  lockedBTC
});

export const updateSLAAction = (sla: string): UpdateSLA => ({
  type: UPDATE_SLA,
  sla
});

export const updatePremiumVaultAction = (vault: Vault): UpdatePremiumVault => ({
  type: UPDATE_PREMIUM_VAULT,
  vault
});

export const updateAPYAction = (apy: string): UpdateAPY => ({
  type: UPDATE_APY,
  apy
});
