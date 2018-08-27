import React from 'react';
import { Collapse, Button, Popover, Menu, MenuItem, MenuDivider, Intent, Position, Tag, Tooltip, Alert } from '@blueprintjs/core';
import _ from 'lodash';
import request from 'superagent';

import './CohortsManager.scss';

export default class CohortsListItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isDeleteCohortAlertOpen: false
    }

    _.bindAll(this, [

    ]);
  }

  render() {
    return (
      <li className="cohorts-list-item" onClick={this.props.toggleDetailedPage}>
        {this.renderName()}
        {this.renderId()}
        {this.renderDescription()}
        {this.renderMetadata()}
        <div className="cohort-conditions">
          {this.renderJobStatus()}
          {this.renderCohortState()}
        </div>
        {this.renderActionMenu()}
      </li>
    );
  }

  renderName() {
    return (
      <div className="cohort-name">
        {this.props.cohortName}
        </div>
    );
  }

  renderId() {
    return (
      <div className="cohort-id">
        {this.props.cohortId}
      </div>
    );
  }

  renderDescription() {
    return (
      <div className="cohort-description">
        {this.props.cohortDescription}
      </div>
    );
  }

  renderMetadata() {
    return (
      <div className="cohort-metadata">
        <span>{this.props.numCallsets} callsets</span>
        <span>{this.props.numPatients} patients</span>
      </div>
    );
  }

  renderJobStatus() {
    return (
        <Tag
          intent={Intent.PRIMARY}
          className={'cohort-job-status' + [this.props.jobStatus == 'QUEUED' ? ' queued' : '']}
        >
          {this.props.jobOrder + ' ' + this.props.jobType + ' ' + this.props.jobStatus}
        </Tag>
    );
  }

  renderCohortState() {
    // There is a better icon for "outdated", in blueprint v3.10
    return (
      <span className="cohort-state">
        <span
          className={'pt-icon-standard pt-icon-document draft'
          + [this.props.cohortState == 'DRAFT' ? ' is-current-state' : '']}
        />
        <span
          className={'pt-icon-standard pt-icon-warning-sign outdated'
          + [this.props.cohortState == 'OUTDATED' ? ' is-current-state' : '']}
        />
        <span
          className={'pt-icon-standard pt-icon-tick clean'
          + [this.props.cohortState == 'CLEAN' ? ' is-current-state' : '']}
        />
      </span>
    );
  }

  renderActionMenu() {
    let dropdown = (
      <Menu>
        {this.props.cohortState == 'OUTDATED' && <MenuItem
          iconName="document-open"
          text="Reprocess"
          onClick={this.handleReprocessCohortClick}
        />}
        {this.props.cohortState == 'DRAFT' && <MenuItem
          iconName="document-open"
          text="Process"
          onClick={this.handleProcessCohortClick}
        />}
        {(this.props.cohortState == 'CLEAN' || this.props.cohortState == 'OUTDATED') && <MenuItem
          iconName="document-open"
          text="View in variant table"
          onClick={this.handleViewCohortClick}
        />}
        {this.props.jobStatus != 'PROCESSING' && <MenuDivider />}
        {this.props.jobStatus != 'PROCESSING' && <MenuItem
          text="Delete"
          iconName="delete"
          intent={Intent.DANGER}
          onClick={() => { this.setState({ isDeleteFileAlertOpen: true })}}
        />}
      </Menu>
    );

    let isProcessingDeletion = this.isProcessingDeletion();
    
    return (
      <div className="cohort-action-menu pt-button-group pt-minimal">
        {!isProcessingDeletion && [<Popover key="popover" content={dropdown} position={Position.BOTTOM_RIGHT}>
          <Button><span className="fa fa-lg fa-ellipsis-v" /></Button>
        </Popover>, this.renderDeleteConfirmAlert()]}
      </div>
    );
  }

  renderDeleteConfirmAlert() {
    return (<Alert
      confirmButtonText="Delete source file"
      key="alert"
      cancelButtonText="Cancel"
      isOpen={this.state.isDeleteCohortAlertOpen}
      intent={Intent.DANGER}
      onCancel={() => { this.setState({ isDeleteFileAlertOpen: false }); }}
      onConfirm={() => {
          this.setState({ isDeleteFileAlertOpen: false });
          this.props.deleteCohort();
        }}
    >
      Are you sure you want to delete this file? Variants from this file will no longer be available, and the original
      source file will no longer be available to download.<br /><br />
      This action can only be reversed by re-uploading the original file.
    </Alert>);
  }

  isProcessingDeletion() {
    return this.props.jobType.indexOf('delete') !== -1
      && _.includes(['CREATED', 'PROCESSING', 'REPROCESS'], this.props.jobStatus);
  }
  
  handleViewCohortClick() {

  }

  handleReprocessCohortClick() {

  }

  handleProcessCohortClick() {

  }
}
