import React from 'react';
import { Tag, Tooltip, Intent } from '@blueprintjs/core';
import formatDate from 'date-format';

import './CohortsManager.scss';

export default class CohortJobStatusTag extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // TODO There is supposed to be a spinner when the job status is active. The blueprint one is oversized.
    if (this.props.attributes.processingStatus == 'QUEUED' || this.props.attributes.processingStatus == 'ACTIVE') {
      let dateStarted = new Date(this.props.attributes.processingStartDateTime);
      let dateStartedStr = formatDate('yyyy-MM-dd HH:mm:ss.SSS', dateStarted);
      let dateCreated = new Date(this.props.attributes.creationDateTime);
      let dateCreatedStr = formatDate('yyyy-MM-dd HH:mm:ss.SSS', dateCreated);

      // TODO: add a new line in the tooltip between submitted at and started at
      let tooltipText = 'Submitted at: ' + dateCreatedStr;
      tooltipText += 'Started at: ' + dateStartedStr;

      let tagText;
      let jobStatusClassName = '';
      if (this.props.attributes.processingStatus == 'QUEUED') {
        tagText = this.props.jobOrder + ' ' + JOB_TYPE_DISPLAY_TEXT[this.props.jobType][0] + ' Queued';
        jobStatusClassName = 'queued';
      } else {
        tagText = this.props.jobOrder + ' ' + JOB_TYPE_DISPLAY_TEXT[this.props.jobType][1];
      }
      return (
        <Tooltip content={tooltipText}>
          <Tag
            intent={Intent.PRIMARY}
            className={'cohort-job-status ' + jobStatusClassName}
            onClick={this.props.handleBlacklistedChildElClick || null}
          >
            {<span className="pt-icon-standard pt-icon-refresh" />}
            {tagText}
          </Tag>
        </Tooltip>
      );
    } else {
      return (
        <div id="cohort-job-status"></div>
      );
    }
  }
}

const JOB_TYPE_DISPLAY_TEXT = {
  DELETE: ['Deletion', 'Deleting'],
  REPROCESS: ['Reprocess', 'Reprocessing'],
  CREATE: ['Creation', 'Creating']
};