import React, { ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RedeemRequest, RedeemRequestStatus } from '../../../../common/types/redeem.types';
import BitcoinTransaction from '../../../../common/components/bitcoin-links/transaction';
import { getUsdAmount, shortAddress } from '../../../../common/utils/utils';
import * as constants from '../../../../constants';
import { useSelector } from 'react-redux';
import { StoreType } from '../../../../common/types/util.types';
import Big from 'big.js';
import PolkadotLogo from '../../../../assets/img/small-polkadot-logo.png';

type StatusViewProps = {
  request: RedeemRequest;
};

export default function StatusView(props: StatusViewProps): ReactElement {
  const { t } = useTranslation();
  const { polkaBtcLoaded, prices } = useSelector((state: StoreType) => state.general);
  const [stableBitcoinConfirmations, setStableBitcoinConfirmations] = useState(0);
  const [punishmentDOT, setPunishmentDOT] = useState(new Big(0));
  const [burnAmountDOT, setBurnAmountDOT] = useState(new Big(0));
  const [amountDOT, setAmountDOT] = useState(new Big(0));

  useEffect(() => {
    if (!polkaBtcLoaded) return;

    const fetchData = async () => {
      try {
        const [punishment, btcDotRate, btcConfs] = await Promise.all([
          window.polkaBTC.vaults.getPunishmentFee(),
          window.polkaBTC.oracle.getExchangeRate(),
          window.polkaBTC.btcRelay.getStableBitcoinConfirmations()
        ]);
        const amountPolkaBTC = props.request ? new Big(props.request.amountPolkaBTC) : new Big(0);
        const burned = amountPolkaBTC.mul(btcDotRate);
        const punished = burned.mul(new Big(punishment));
        setBurnAmountDOT(burned);
        setPunishmentDOT(punished);
        setAmountDOT(burned.add(punished));
        setStableBitcoinConfirmations(btcConfs);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [props.request, polkaBtcLoaded]);

  function getStatus(status: RedeemRequestStatus): React.ReactFragment {
    switch (status) {
    case RedeemRequestStatus.Completed:
      return (
        <React.Fragment>
          <div className='completed-status-title'>{t('completed')}</div>
          <div className='row'>
            <div className='col text-center bold-text '>
              {t('issue_page.you_received')}{' '}
              <span className='orange-amount bold-text'>{props.request.amountPolkaBTC + ' BTC'}</span>
            </div>
          </div>
          <div className='row mt-4'>
            <div className='col'>
              <div className='completed-confirmations-circle'>
                <div>{t('issue_page.in_parachain_block')}</div>
                <div className='number-of-confirmations'>{props.request.creation}</div>
              </div>
            </div>
          </div>
          <div className='row'>
            <div className='col text-center mt-4'>
              <a
                href='https://polkadot.js.org/apps/#/explorer'
                target='_blank'
                rel='noopener noreferrer'>
                <button className='modal-btn-green'>{t('issue_page.view_parachain_block')}</button>
              </a>
            </div>
          </div>

          <div className='row btc-transaction-wrapper'>
            <div className='col'>
              <div className='btc-transaction-title'>{t('issue_page.btc_transaction')}</div>
            </div>
          </div>
          <div className='row'>
            <div className='col'>
              <div className='btc-transaction-id'>{shortAddress(props.request.btcTxId)}</div>
            </div>
          </div>
          <div className='row'>
            <div className='col'>
              <div className='btc-transaction'>
                <a
                  href={
                    (constants.BTC_MAINNET ?
                      constants.BTC_EXPLORER_TRANSACTION_API :
                      constants.BTC_TEST_EXPLORER_TRANSACTION_API) + props.request.btcTxId
                  }
                  target='_blank'
                  rel='noopener noreferrer'>
                  <button className='modal-btn-green'>
                    {t('issue_page.view_on_block_explorer')}
                  </button>
                </a>
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    case RedeemRequestStatus.PendingWithBtcTxNotFound:
      return (
        <React.Fragment>
          <div className='status-title'>{t('pending')}</div>
          <div className='row mt-5'>
            <div className='col'>
              <div className='pending-circle'>
                <div>{t('redeem_page.waiting_for')}</div>
                <div>{t('nav_vault')}</div>
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    case RedeemRequestStatus.Reimbursed:
      return (
        <React.Fragment>
          <div className='completed-status-title'>{t('redeem_page.burn_success')}</div>
          <div className='row'>
            <div className='col text-center'>{t('redeem_page.burn_notice')}</div>
          </div>
          <div className='row mt-5'>
            <div className='col text-center bold-text '>
              <span className='orange-amount bold-text'>
                {props.request.amountPolkaBTC + ' PolkaBTC '}
              </span>
                                (~ ${getUsdAmount(props.request.amountPolkaBTC, prices.bitcoin.usd)})
              <span className='orange-amount bold-text'>{t('redeem_page.burned')}</span>
            </div>
          </div>
          <div className='row mt-5'>
            <div className='col text-center bold-text '>
              <span className='pink-amount bold-text'>
                {t('redeem_page.recover_receive_dot') + amountDOT.toString() + ' DOT '}
              </span>
                                (~ ${getUsdAmount(amountDOT.toString(), prices.polkadot.usd)})
              <span className='pink-amount bold-text'>{t('redeem_page.recover_receive_total')}</span>
            </div>
          </div>
          <div className='step-item row'>
            <div className='col-6'>{t('redeem_page.compensation_burn')}</div>
            <div className='col-6'>
              <img
                src={PolkadotLogo}
                width='23px'
                height='23px'
                alt='polkadot logo'>
              </img> &nbsp;
              {burnAmountDOT.toString()} DOT
              <div className='send-price'>
                {'~ $' + getUsdAmount(burnAmountDOT.toString(), prices.polkadot.usd)}
              </div>
            </div>
          </div>
          <div className='step-item row'>
            <div className='col-6'>{t('redeem_page.compensation_payment')}</div>
            <div className='col-6'>
              <img
                src={PolkadotLogo}
                width='23px'
                height='23px'
                alt='polkadot logo'>
              </img> &nbsp;
              {punishmentDOT.toString()} DOT
              <div className='send-price'>
                {'~ $' + getUsdAmount(punishmentDOT.toString(), prices.polkadot.usd)}
              </div>
            </div>
          </div>
          <hr className='total-divider' />
          <div className='step-item row'>
            <div className='col-6 total-amount text-green'>{t('you_received')}</div>
            <div className='col-6 total-amount'>
              <img
                src={PolkadotLogo}
                width='23px'
                height='23px'
                alt='bitcoin logo'>
              </img>
                                &nbsp;
              {amountDOT.toString()} DOT
              <div className='send-price'>
                {'~ $' + getUsdAmount(amountDOT.toString(), prices.polkadot.usd)}
              </div>
            </div>
          </div>
          <div className='row mt-5'>
            <div className='col text-center mt-4'>
              <a
                href='https://polkadot.js.org/apps/#/explorer'
                target='_blank'
                rel='noopener noreferrer'>
                <button className='modal-btn-green'>{t('issue_page.view_parachain_block')}</button>
              </a>
            </div>
          </div>
        </React.Fragment>
      );
    case RedeemRequestStatus.Retried:
      return (
        <React.Fragment>
          <div className='completed-status-title'>{t('redeem_page.compensation_success')}</div>
          <div className='row'>
            <div className='col text-center'>{t('redeem_page.compensation_notice')}</div>
          </div>
          <div className='row mt-5'>
            <div className='col text-center bold-text '>
              <span className='pink-amount bold-text'>
                {t('redeem_page.recover_receive_dot') + punishmentDOT.toString() + ' DOT '}
              </span>
                                (~ ${getUsdAmount(punishmentDOT.toString(), prices.polkadot.usd)})
              <span className='pink-amount bold-text'>{t('redeem_page.recover_receive_total')}</span>
            </div>
          </div>
          <div className='step-item row'>
            <div className='col-6'>{t('redeem_page.compensation_payment')}</div>
            <div className='col-6'>
              <img
                src={PolkadotLogo}
                width='23px'
                height='23px'
                alt='polkadot logo'>
              </img> &nbsp;
              {punishmentDOT.toString()} DOT
              <div className='send-price'>
                {'~ $' + getUsdAmount(punishmentDOT.toString(), prices.polkadot.usd)}
              </div>
            </div>
          </div>
          <hr className='total-divider' />
          <div className='step-item row'>
            <div className='col-6 total-amount text-green'>{t('you_received')}</div>
            <div className='col-6 total-amount'>
              <img
                src={PolkadotLogo}
                width='23px'
                height='23px'
                alt='bitcoin logo'>
              </img>
                                &nbsp;
              {punishmentDOT.toString()} DOT
              <div className='send-price'>
                {'~ $' + getUsdAmount(punishmentDOT.toString(), prices.polkadot.usd)}
              </div>
            </div>
          </div>
          <div className='row'>
            <div className='col text-center mt-4'>
              <a
                href='https://polkadot.js.org/apps/#/explorer'
                target='_blank'
                rel='noopener noreferrer'>
                <button className='modal-btn-green'>{t('issue_page.view_parachain_block')}</button>
              </a>
            </div>
          </div>
          <div className='row justify-content-center'>
            <div className='col-9 note-title'>
              {t('note')}&nbsp;
              <i className='fas fa-exclamation-circle'></i>
            </div>
          </div>
          <div className='row justify-content-center'>
            <div className='col-9 note-text'>{t('redeem_page.retry_new_redeem')}</div>
          </div>
        </React.Fragment>
      );
    default:
      return (
        <React.Fragment>
          <div className='status-title'>{t('received')}</div>
          <div className='row'>
            <div className='col'>
              <div className='waiting-confirmations-circle'>
                <div>{t('redeem_page.waiting_for')}</div>
                <div>{t('confirmations')}</div>
                <div className='number-of-confirmations'>
                  {props.request.confirmations + '/' + stableBitcoinConfirmations}
                </div>
              </div>
            </div>
          </div>
          <div className='row btc-transaction-wrapper'>
            <div className='col'>
              <div className='btc-transaction-view'>{t('issue_page.btc_transaction')}</div>
            </div>
          </div>
          <div className='row'>
            <div className='col'>
              <div className='btc-transaction-view'>
                <BitcoinTransaction
                  txId={props.request.btcTxId}
                  shorten />
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    }
  }

  return <div className='status-view'>{getStatus(props.request.status)}</div>;
}
