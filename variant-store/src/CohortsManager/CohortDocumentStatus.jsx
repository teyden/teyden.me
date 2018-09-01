import React from 'react';
import { Tooltip } from '@blueprintjs/core';

import './CohortsManager.scss';

export default class CohortDocumentStatus extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // TODO There are better icons for "outdated" (outdated) and "clean" (tick-circle or confirm) in blueprint v3.10
    return (
      <span className="cohort-document-status" onClick={this.props.handleBlacklistedChildElClick || null}>
        <Tooltip content={'This cohort is a draft.'} isDisabled={this.props.status != 'DRAFT'}>
          <span
            className={'cohort-document-status-option pt-icon-standard pt-icon-document draft'
            + [this.props.status == 'DRAFT' ? ' is-current-status' : '']}
          />
        </Tooltip>
        <Tooltip content={'This cohort is outdated.'} isDisabled={this.props.status != 'OUTDATED'}>
          <span
            className={'cohort-document-status-option pt-icon-standard pt-icon-warning-sign outdated'
            + [this.props.status == 'OUTDATED' ? ' is-current-status' : '']}
          />
        </Tooltip>
        <Tooltip content={'This cohort is clean.'} isDisabled={this.props.status != 'CLEAN'}>
          <span
            className={'cohort-document-status-option pt-icon-standard pt-icon-tick clean'
            + [this.props.status == 'CLEAN' ? ' is-current-status' : '']}
          />
        </Tooltip>
      </span>
    );
  }
}
