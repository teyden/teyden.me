import React from 'react';
import { Collapse, Button, Popover, Position, Menu, MenuItem, MenuDivider, Intent, Tag, Tooltip, Alert, Spinner } from '@blueprintjs/core';
import _ from 'lodash';
import CohortJobStatusTag from './CohortJobStatusTag.jsx';
import CohortDocumentStatus from './CohortDocumentStatus.jsx';

import './CohortsManager.scss';

export default class CohortsListItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isDeleteCohortAlertOpen: false
    }

    _.bindAll(this, [
      'handleOpenCohortDetailedPageClick',
      'handleProcessCohortClick',
      'handleBlacklistedChildElClick',
      'handleDeleteClick',
    ]);
  }

  render() {
    return (
      <li id={this.props.id} className="cohorts-list-item" onClick={this.handleOpenCohortDetailedPageClick}>
        {this.renderName()}
        {this.renderId()}
        {this.renderDescription()}
        {this.renderStructuralMetadata()}
        {this.renderStatuses()}
        {this.renderActionMenu()}
      </li>
    );
  }

  renderName() {
    return (
      <div className="cohort-name">
        {this.props.attributes.name}
        </div>
    );
  }

  renderId() {
    return (
      <div className="cohort-id">
        {this.props.id}
      </div>
    );
  }

  renderDescription() {
    return (
      <div className="cohort-description">
        {this.props.attributes.description}
      </div>
    );
  }

  renderStructuralMetadata() {
    return (
      <div className="cohort-structural-metadata">
        <span>{this.props.attributes.callsetCount} callsets</span>
        <span>{this.props.attributes.patientCount} patients</span>
        <span>{this.props.attributes.refGenome}</span>
      </div>
    );
  }

  renderStatuses() {
    return (
      <div className="cohort-statuses">
        <CohortJobStatusTag
          {...cohort}
          jobOrder={this.props.jobOrder} 
          handleBlacklistedChildElClick={this.handleBlacklistedChildElClick}
        />
        <CohortDocumentStatus
          status={this.props.attributes.status}
          handleBlacklistedChildElClick={this.handleBlacklistedChildElClick}
        />
      </div>
    );
  }

  renderActionMenu() {
    let dropdown = (
      <Menu>
        {this.props.attributes.status == 'DRAFT' && <MenuItem
          iconName="circle-arrow-right"
          text="Process"
          onClick={this.handleProcessCohortClick}
        />}
        {this.props.attributes.status == 'OUTDATED' && <MenuItem
          iconName="repeat"
          text="Reprocess"
          onClick={this.handleProcessCohortClick}
        />}
        {(this.props.attributes.status == 'CLEAN' || this.props.attributes.status == 'OUTDATED') && <MenuItem
          iconName="document-open"
          text="View in variant table"
          onClick={this.handleViewInVariantTableClick}
        />}
        {this.props.attributes.processingStatus != 'ACTIVE' && <MenuDivider />}
        {this.props.attributes.processingStatus != 'ACTIVE' && <MenuItem
          text="Delete"
          iconName="delete"
          intent={Intent.DANGER}
          onClick={() => { this.setState({ isDeleteFileAlertOpen: true })}}
        />}
      </Menu>
    );

    let isProcessingDeletion = this.isProcessingDeletion();
    
    return (
      <div className="cohort-action-menu pt-button-group pt-minimal" onClick={this.handleBlacklistedChildElClick}>
        {!isProcessingDeletion && [<Popover key="popover" content={dropdown} position={Position.RIGHT_TOP}>
          <Button><span className="fa fa-lg fa-ellipsis-v" /></Button>
        </Popover>, this.renderDeleteConfirmAlert()]}
      </div>
    );
  }

  renderDeleteConfirmAlert() {
    return (<Alert
      confirmButtonText="Delete cohort"
      key="alert"
      cancelButtonText="Cancel"
      isOpen={this.state.isDeleteCohortAlertOpen}
      intent={Intent.DANGER}
      onCancel={() => { this.setState({ isDeleteCohortAlertOpen: false }); }}
      onConfirm={() => {
          this.setState({ isDeleteCohortAlertOpen: false });
          this.props.deleteCohort();
        }}
    >
      Are you sure you want to delete this cohort?
    </Alert>);
  }

  isProcessingDeletion() {
    return this.props.attributes.processingJobType.indexOf('delete') !== -1
      && _.includes(['ACTIVE', 'QUEUED'], this.props.attributes.processingStatus);
  }

  /**
   * Stops propagation of any child elements that should not trigger the detailed view to load.
   */
  handleBlacklistedChildElClick(e) {
    e.stopPropagation();
  }

  handleOpenCohortDetailedPageClick() {
    this.props.openCohortDetailedPage(this.props.id);
  }

  handleProcessCohortClick() {
    this.props.processCohort(this.props.id);
  }

  handleViewInVariantTableClick() {
    // TODO
  }

  handleDeleteClick() {
    // TODO
  }
}
