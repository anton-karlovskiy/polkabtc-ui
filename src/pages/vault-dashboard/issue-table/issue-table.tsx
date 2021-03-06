import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StoreType } from '../../../common/types/util.types';
import { addVaultIssuesAction } from '../../../common/actions/issue.actions';
import { issueRequestToVaultIssue, shortAddress } from '../../../common/utils/utils';
import * as constants from '../../../constants';
import BitcoinAddress from '../../../common/components/bitcoin-links/address';
import { VaultIssue } from '../../../common/types/issue.types';
import { FaCheck, FaHourglass } from 'react-icons/fa';
import { Badge, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

export default function IssueTable(): ReactElement {
  const polkaBtcLoaded = useSelector((state: StoreType) => state.general.polkaBtcLoaded);
  const issues = useSelector((state: StoreType) => state.issue.vaultIssues);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      if (!polkaBtcLoaded) return;

      try {
        const accountId = await window.vaultClient.getAccountId();
        const vaultId = window.polkaBTC.api.createType('AccountId', accountId);
        const issueMap = await window.polkaBTC.vaults.mapIssueRequests(vaultId);

        if (!issueMap) return;

        dispatch(addVaultIssuesAction(issueRequestToVaultIssue(issueMap)));
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, constants.COMPONENT_UPDATE_MS);
    return () => clearInterval(interval);
  }, [polkaBtcLoaded, dispatch]);

  const showStatus = (request: VaultIssue) => {
    if (request.completed) {
      return <FaCheck></FaCheck>;
    }
    if (request.cancelled) {
      return (
        <Badge
          className='badge-style'
          variant='secondary'>
          {t('cancelled')}
        </Badge>
      );
    }
    return <FaHourglass></FaHourglass>;
  };

  return (
    <div style={{ margin: '40px 0px' }}>
      <div>
        <p
          style={{
            fontFamily: 'airbnb-cereal-bold',
            fontSize: '26px'
          }}>
          {t('issue_requests')}
        </p>
      </div>
      {issues && issues.length > 0 ? (
        <React.Fragment>
          <Table
            hover
            responsive
            size='md'>
            <thead>
              <tr>
                <th>{t('id')}</th>
                <th>{t('vault.creation_block')}</th>
                <th>{t('user')}</th>
                <th>{t('btc_address')}</th>
                <th>PolkaBTC</th>
                <th>{t('griefing_collateral')}</th>
                <th>{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue, index) => {
                return (
                  <tr key={index}>
                    <td>{issue.id}</td>
                    <td>{issue.timestamp}</td>
                    <td>{shortAddress(issue.user)}</td>
                    <td>
                      <BitcoinAddress
                        btcAddress={issue.btcAddress}
                        shorten />
                    </td>
                    <td>{issue.polkaBTC}</td>
                    <td>{issue.lockedDOT}</td>
                    <td>{showStatus(issue)}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </React.Fragment>
      ) : (
        <React.Fragment>{t('empty_data')}</React.Fragment>
      )}
    </div>
  );
}
