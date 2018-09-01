import React from 'react';
import { Collapse, Button, Popover, Menu, MenuItem, MenuDivider, Intent, Position, Tag, Tooltip, Alert } from '@blueprintjs/core';
import filesize from 'filesize';
import formatDate from 'date-format';
import _ from 'lodash';
import request from 'superagent';

import { generatePatientRecordUrl, getCallsetIdParts } from './../VariantsUtils.jsx';

export default class SourceFilesListItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isDeleteFileAlertOpen: false
    }

    _.bindAll(this, [
      'renderButtons',
      'renderDetails',
      'renderLabel',
      'renderMetadata',
      'renderDeleteConfirmAlert',
      'getFilename',
      'getPatientId',
      'isProcessingDeletion',
      'handleDownloadClick',
      'handleViewDatasetClick',
      'handleDetailedLogClick',
    ]);
  }

  render() {
    return (
      <li className={this.props.isExpanded ? 'expanded' : null}>
        {this.renderLabel()}
        {this.renderButtons()}
        {this.renderMetadata()}
        {this.renderDetails()}
      </li>
    );
  }

  renderLabel() {
    return (
        <span className="name" onClick={this.props.toggleExpanded}>
          <span className="pt-icon-standard pt-icon-document" />
          {this.props.fileName}
        </span>
    );
  }

  renderMetadata() {
    let dateUploaded = new Date(this.props.jobCreatedDateTime);
    let dateStr = formatDate('yyyy-MM-dd', dateUploaded);
    let tag;

    let isProcessingDeletion = this.isProcessingDeletion();

    if (isProcessingDeletion) {
      let tooltipText = 'After being marked for deletion, it takes up to a few hours for a file to be completely '
      tooltipText += 'removed from the database. Once deletion is complete, the file will no longer ';
      tooltipText += 'appear in this list. You may navigate away from this page; deletion will continue in the ';
      tooltipText += 'background.';
      tag = (<Tooltip
        content={tooltipText}
        portalClassName="source-file-tooltip"
      >
        <Tag intent={Intent.NONE}>Processing Deletion</Tag>
      </Tooltip>);
    } else if (this.props.jobStatus == 'PROCESSING' && this.props.jobType.indexOf('add') !== -1) {
      tag = <Tag intent={Intent.PRIMARY}>Processing Upload</Tag>;
    } else if (this.props.jobStatus.indexOf('ERROR') !== -1) {
      tag = <Tag intent={Intent.DANGER}>Failed</Tag>;
    }

    return (
      <div className="meta">
        {tag}
        <span className="date-added">{dateStr}</span>
      </div>
    );
  }

  renderButtons() {
    let dropdown = (
      <Menu>
        <MenuItem
          iconName="cloud-download"
          text="Download"
          onClick={this.handleDownloadClick}
        />
        {this.props.jobStatus == 'COMPLETE' && <MenuItem
          iconName="document-open"
          text="View dataset" 
          onClick={this.handleViewDatasetClick}
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
      <div className="pt-button-group pt-minimal">
        <Button iconName="info-sign" onClick={this.props.toggleExpanded}>Details</Button>
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
          this.props.deleteFile();
        }}
      >
        Are you sure you want to delete this file? Variants from this file will no longer be available, and the original
        source file will no longer be available to download.<br /><br />
        This action can only be reversed by re-uploading the original file.
      </Alert>);
  }

  renderDetails() {
    let formatDateFull = (date) => {
      return formatDate('yyyy-MM-dd hh:mm:ss', new Date(date));
    };
    let msg;
    let hasError = this.props.jobStatus.indexOf('ERROR') !== -1;
    if (hasError && this.props.jobType.indexOf('delete') !== -1) {
      msg = (<div>
        <div className="spacer" />
        <div className="pt-callout pt-intent-danger pt-icon-error">
          <h5>Failed deletion</h5>
          <p>This file failed to be deleted from the database. This should not normally happen and indicates a
          system issue. Please contact an administrator with the log below.</p>
        </div>
        <div className="spacer" />
      </div>);
    } else if (hasError) {
      msg = (<div>
        <div className="spacer" />
        <div className="pt-callout pt-intent-danger pt-icon-error">
          <h5>Failed file upload</h5>
          <p>This file failed to be imported into the database. The log below should describe the exact reason(s)
            for the failure.</p>
          <p>After you've understood the reason(s) for the import failure, you should first delete this file
            (using the cog button at top right), then make the necessary changes to the source file, and upload
            it again. If you try to reupload the file with the same name before deleting it here, the upload will
            fail due to a duplicate file name conflict.</p>
        </div>
        <div className="spacer" />
      </div>);
    }

    return (
      <Collapse isOpen={this.props.isExpanded} className="item-details">
        {msg}
        <table>
          <tbody>
            <tr>
              <th>Uploader</th>
              <th>Reference Genome</th>
              <th>Total variants</th>              
            </tr>
            <tr>
              <td>{this.props.user}</td>
              <td>{this.props.refGenome}</td>
              <td>{this.props.numberOfVariants}</td>              
            </tr>
            <tr>
              <th>File size</th>
              <th>Processing started</th>
              <th>Processing completed</th>
            </tr>
            <tr>
              <td>{filesize(this.props.fileSize)}</td>
              <td>{this.props.jobStartDateTime && formatDateFull(this.props.jobStartDateTime)}</td>
              <td>{this.props.jobStopDateTime && formatDateFull(this.props.jobStopDateTime)}</td>
            </tr>
          </tbody>
        </table>
        <h4>Processing log:</h4>
        <pre className="log">
          {this.props.jobLog || this.props.jobErrorDetail}
        </pre> 
        <Button iconName="download" onClick={this.handleDetailedLogClick}>Download detailed log</Button>
        <div className="spacer" />
      </Collapse>
    );
  }

  isProcessingDeletion() {
    return this.props.jobType.indexOf('delete') !== -1
      && _.includes(['CREATED', 'PROCESSING', 'REPROCESS'], this.props.jobStatus);
  }

  getPatientId() {
    return getCallsetIdParts(this.props.id).patientId;
  }

  getFilename() {
    return getCallsetIdParts(this.props.id).filename;
  }
  
  handleDownloadClick() {
    location.href = XWiki.contextPath + '/rest/variant-source-files/patients/' + this.getPatientId() + '/files/' + this.getFilename();
  }

  handleDetailedLogClick() {
    location.href = XWiki.contextPath + '/rest/jobs/' + this.props.jobId + '/log';
  }

  handleViewDatasetClick() {
    location.href = generatePatientRecordUrl(this.getPatientId(), this.props.id);
  }
}
