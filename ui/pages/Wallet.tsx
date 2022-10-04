import React, { ReactElement, useEffect, useState } from "react"
import { Redirect } from "react-router-dom"
import {
  getAddressCount,
  selectCurrentAccountActivities,
  selectCurrentAccountBalances,
} from "@tallyho/tally-background/redux-slices/selectors"
import { checkAlreadyClaimed } from "@tallyho/tally-background/redux-slices/claim"

import { HIDE_TOKEN_FEATURES } from "@tallyho/tally-background/features"
import classNames from "classnames"
import { useTranslation } from "react-i18next"
import { useBackgroundDispatch, useBackgroundSelector } from "../hooks"
import SharedPanelSwitcher from "../components/Shared/SharedPanelSwitcher"
import WalletAssetList from "../components/Wallet/WalletAssetList"
import WalletActivityList from "../components/Wallet/WalletActivityList"
import WalletAccountBalanceControl from "../components/Wallet/WalletAccountBalanceControl"
import OnboardingOpenClaimFlowBanner from "../components/Onboarding/OnboardingOpenClaimFlowBanner"
import NFTsWallet from "../components/NFTs/NFTsWallet"
import SharedBanner from "../components/Shared/SharedBanner"

export default function Wallet(): ReactElement {
  const { t } = useTranslation("translation", { keyPrefix: "wallet" })
  const [panelNumber, setPanelNumber] = useState(0)

  const dispatch = useBackgroundDispatch()

  const hasAccounts = useBackgroundSelector(
    (state) => getAddressCount(state) > 0
  )

  //  accountLoading, hasWalletErrorCode
  const accountData = useBackgroundSelector(selectCurrentAccountBalances)
  const claimState = useBackgroundSelector((state) => state.claim)

  useEffect(() => {
    dispatch(
      checkAlreadyClaimed({
        claimState,
      })
    )
  }, [claimState, dispatch])

  const { assetAmounts, totalMainCurrencyValue } = accountData ?? {
    assetAmounts: [],
    totalMainCurrencyValue: undefined,
  }

  const currentAccountActivities = useBackgroundSelector(
    selectCurrentAccountActivities
  )

  const initializationLoadingTimeExpired = useBackgroundSelector(
    (background) => background.ui?.initializationLoadingTimeExpired
  )

  // If an account doesn't exist, display onboarding
  if (!hasAccounts) {
    return <Redirect to="/onboarding/info-intro" />
  }

  const panelNames = [t("pages.assets"), t("pages.NFTs"), t("pages.activity")]

  return (
    <>
      <div className="page_content">
        <div className="section">
          <WalletAccountBalanceControl
            balance={totalMainCurrencyValue}
            initializationLoadingTimeExpired={initializationLoadingTimeExpired}
          />
        </div>
        {!HIDE_TOKEN_FEATURES && <OnboardingOpenClaimFlowBanner />}
        <div className="section">
          <SharedPanelSwitcher
            setPanelNumber={setPanelNumber}
            panelNumber={panelNumber}
            panelNames={panelNames}
          />
          <div
            className={classNames("panel standard_width", {
              no_padding: panelNumber === 1,
            })}
          >
            {panelNumber === 0 && (
              <WalletAssetList
                assetAmounts={assetAmounts}
                initializationLoadingTimeExpired={
                  initializationLoadingTimeExpired
                }
              />
            )}
            {panelNumber === 1 && (
              <>
                <SharedBanner
                  icon="notif-announcement"
                  iconColor="var(--link)"
                  canBeClosed
                  id="nft_soon"
                  customStyles="margin: 8px 0;"
                >
                  {t("NFTPricingComingSoon")}
                </SharedBanner>
                <NFTsWallet />
              </>
            )}
            {panelNumber === 2 && (
              <WalletActivityList activities={currentAccountActivities ?? []} />
            )}
          </div>
        </div>
      </div>
      <style jsx>
        {`
          .page_content {
            width: 100%;
            height: inherit;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
          }
          .section {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
          }
          .panel {
            padding-top: 16px;
            box-sizing: border-box;
            height: 302px;
          }
          .panel::-webkit-scrollbar {
            display: none;
          }
          .no_padding {
            padding-top: 0;
          }
        `}
      </style>
    </>
  )
}
