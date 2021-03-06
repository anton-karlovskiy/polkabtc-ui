import React from 'react';
import * as constants from '../../../constants';
import { shortTxId } from '../../../common/utils/utils';

export default class BitcoinTransaction extends React.Component<{
  txId: string;
  shorten?: boolean;
}> {
  render() {
    return (
      <div>
        {this.props.txId ? (
          <a
            href={
              (constants.BTC_MAINNET ?
                constants.BTC_EXPLORER_TRANSACTION_API :
                constants.BTC_TEST_EXPLORER_TRANSACTION_API) + this.props.txId
            }
            target='_blank'
            rel='noopener noreferrer'>
            {this.props.shorten ? shortTxId(this.props.txId) : this.props.txId}
          </a>
        ) : (
          'Pending...'
        )}
      </div>
    );
  }
}
