import React from 'react';
import { ProgressBar, Intent, Tag, Alert, Collapse, Button } from '@blueprintjs/core';
import filesize from 'filesize';
import Select from 'react-select';

import { generatePatientRecordUrl } from './../VariantsUtils.jsx';
import { UploadStates } from './SourceFileUploadManagerUtils.jsx';
import * as SourceFileUploadManagerUtils from './SourceFileUploadManagerUtils.jsx';

export default class SourceFileUploadListItem extends React.Component {
  constructor(props) {
    super(props);
    _.bindAll(this, [
      'handlePatientIdChange',
      'handleRefGenomeChange',
      'handleStartBtnClick',
      'handleViewBtnClick',
      'handleDetailedLogClick',
      'renderPatientSubform',
      'renderNoticeDetail',
      'renderProgressBar',
      'renderTitleSection',
      'renderButtons',
      'renderPatientIdSelector',
    ]);
    
    this.state = {
      patientId: this.props.exclusivePatientId || '',
      patientName: '',
      refGenome: '',
      isRemoveUploadAlertOpen: false,
      isLogExpanded: false,
    };
  }

  render() {
    return (
      <li className="pt-card pt-elevation-1">
        {this.renderButtons()}
        {this.renderTitleSection()}
        {this.renderProgressBar()}
        {this.renderPatientSubform()}
        {this.renderNoticeDetail()}
      </li>
    );
  }
  
  /* Render sections */

  renderButtons() {
    let buttons = [];
    if (_.includes([UploadStates.DONE, UploadStates.FAILED, UploadStates.DONE_WITH_ISSUES], this.props.file.status.state)) {
      buttons = [
        _.includes([UploadStates.DONE, UploadStates.DONE_WITH_ISSUES], this.props.file.status.state) && <button type="button" key="view" onClick={this.handleViewBtnClick} className="pt-button pt-icon-document-open pt-intent-primary">View</button>,
        this.props.file.status.log && <Button
          iconName="info-sign"
          key="log"
          onClick={() => { this.setState({ isLogExpanded: !this.state.isLogExpanded }); }}
        >
          {this.state.isLogExpanded ? "Hide" : "Show"} log
        </Button>,
        <Button
          type="button"
          key="clear"
          className="cancel pt-button pt-icon-confirm"
          onClick={() => { this.props.cancelUpload(this.props.fileId); }}
        >
          Acknowledge
        </Button>,
      ];
    } else if (_.includes([UploadStates.UPLOADING], this.props.file.status.state)) {
      buttons = [
        (<button
          type="button"
          className="cancel pt-button pt-icon-cross pt-minimal pt-intent-danger"
          title="Remove file upload"
          key="remove"
          onClick={() => { this.setState({ isRemoveUploadAlertOpen: true }) }}
        />),
        (<Alert
          confirmButtonText="Remove file upload"
          key="alert"
          cancelButtonText="Cancel"
          isOpen={this.state.isRemoveUploadAlertOpen}
          intent={Intent.DANGER}
          onCancel={() => { this.setState({ isRemoveUploadAlertOpen: false }); }}
          onConfirm={() => {
            this.setState({ isRemoveUploadAlertOpen: false });
            this.props.cancelUpload(this.props.fileId);
          }}
        >
          Are you sure you want to remove this upload? All current progress will be discarded.
        </Alert>)
      ];
    } else if (_.includes([UploadStates.PENDING, UploadStates.WAITING], this.props.file.status.state)) {
      buttons = [
        <button
          type="button"
          key="remove"
          className="cancel pt-button pt-icon-cross pt-minimal pt-intent-danger"
          title="Remove file upload"
          onClick={() => { this.props.cancelUpload(this.props.fileId); }}
        />
      ];
    };

    return (
      <div className="pt-button-group pt-minimal">
        {buttons}
      </div>
    );
  }

  renderTitleSection() {
    let patientName = <span> &ndash; <span className="patient-name">{this.props.file.patient.name}</span></span>;
    return [
      <span key="name" className="file-name">{this.props.file.fileName}</span>,
      (this.props.file.patient.id && <span key="patient-id">
        (<span className="patient-id">{this.props.file.patient.id}</span>{this.props.file.patient.name && patientName})
      </span>),
      <div className="meta" key="meta">
        <Tag intent={SourceFileUploadManagerUtils.getIntentForState(this.props.file.status.state)}>{SourceFileUploadManagerUtils.getStateName(this.props.file.status.state)}</Tag>
        <span className="size">{filesize(this.props.file.size)}</span>
        {this.props.file.status.state == UploadStates.UPLOADING && <span className="percent-complete">{(this.props.file.status.progress * 100).toFixed(1)}%</span>}
      </div>
    ];
  }

  renderProgressBar() {
    let classNames = [];
    let value = this.props.file.status.progress;
    if (_.includes([UploadStates.DONE, UploadStates.DONE_WITH_ISSUES, UploadStates.FAILED], this.props.file.status.state)) {
      classNames.push('pt-no-stripes');
      value = 1;
    }

    return (
      <ProgressBar
        intent={SourceFileUploadManagerUtils.getIntentForState(this.props.file.status.state)}
        value={value}
        className={classNames}
      />
    );
  }

  renderPatientSubform() {
    return this.props.file.status.state == UploadStates.PENDING &&
      (<div className="patient-info-subform pt-callout pt-intent-primary">
        <h5>File information</h5>
        <label className="pt-label">
          Patient identifier:
          {this.renderPatientIdSelector()}
        </label>
        <label className="pt-label">
          Reference:
            <div className="pt-select pt-large">
            <select 
              value={this.state.refGenome} 
              onChange={this.handleRefGenomeChange}
            >
              <option value="">Choose an item...</option>
              <option value="GRCh38">GRCh38</option>
              <option value="GRCh37">GRCh37</option>
              <option value="NCBI36">NCBI36</option>
            </select>
          </div>
        </label>
        <button 
          type="button" 
          className="pt-button pt-icon-upload pt-intent-primary" 
          onClick={this.handleStartBtnClick}
          disabled={!this.state.patientId || !this.state.refGenome}
        >
          Start upload
        </button>
        <div style={{clear: 'both'}} />
      </div>);
  }

  renderPatientIdSelector() {
    if (this.props.exclusivePatientId) {
      return (<Select.Async
          value={{ label: this.state.patientId, value: this.state.patientId }}
          loadOptions={this.fetchPatientIdSuggestions}
          onChange={this.handlePatientIdChange}
          disabled={!!this.props.exclusivePatientId}
        />);
    } else {
      return (<Select.Async
          value={this.state.patientId}
          loadOptions={this.fetchPatientIdSuggestions}
          onChange={this.handlePatientIdChange}
        />);
    }
  }

  renderNoticeDetail() {
    let nextAction;
    if (this.props.file.status.error.step == UploadStates.PROCESSING) {
      nextAction = (<p>This file has been uploaded, but was not imported to the database. It will remain under the 
          Source Files tab until it is deleted. After you've understood the reason(s) for the import failure, 
          you should first delete this file from under the Source Files tab, then make the necessary changes 
          to the source file, and then upload it again. If you try to reupload the file with the same name before 
          deleting it here, the upload will fail due to a duplicate file name conflict.
        </p>);
    } else {
      nextAction = <p>This upload has been aborted. You'll need to re-add this file in order to retry.</p>
    }

    let detailMsg = null;
    if (this.props.file.status.state == UploadStates.FAILED) {
      detailMsg = (
        <div className="pt-callout pt-intent-danger pt-icon-error failure-notice">
          <h5>Upload failed</h5>
          {this.props.file.status.error && (<table>
            <tbody>
              <tr>
                <th>During:</th>
                <td>{SourceFileUploadManagerUtils.getStateName(this.props.file.status.error.step)}</td>
              </tr>
              <tr>
                <th>Reason:</th>
                <td>{this.props.file.status.error.detail}</td>
              </tr>
            </tbody>
          </table>)}
          {this.props.file.status.log && <p>Check the log file (using the button at top right) for more details.</p>}
          {nextAction}
        </div>
      );
    } else if (this.props.file.status.state == UploadStates.DONE_WITH_ISSUES) {
      detailMsg = (
        <div className="pt-callout pt-intent-warning pt-icon-warning-sign failure-notice">
          <h5>Upload completed with issues</h5>
          <p>This file was uploaded and imported into the database, but with some issues.</p>
          {this.props.file.status.log && <p>Check the log file (using the button at top right) for more details.</p>}
        </div>
      );
    }

    let log = this.props.file.status.log && (
      <Collapse isOpen={this.state.isLogExpanded}>
        <pre className="log">
          {this.props.file.status.log}
        </pre>
        <Button iconName="download" onClick={this.handleDetailedLogClick}>Download detailed log</Button>
      </Collapse>
    );

    return (_.includes([UploadStates.DONE, UploadStates.FAILED, UploadStates.DONE_WITH_ISSUES], this.props.file.status.state)) &&
      (<div className="notice-detail">
        {detailMsg}
        {log}
      </div>);
  }

  /* Handlers */

  handlePatientIdChange(event) {
    if (event) {
      // For now, we extract the full name out of the label provided to us by the suggestions service.
      let nameMatches = event.label.match(/name: '(.+)'\)$/);
      let patientName = (nameMatches && nameMatches[1]) || null;
      this.setState({ patientName: patientName, patientId: event.value });
    } else { // The clear button was pressed
      this.setState({ patientName: null, patientId: null });
    }
  }

  handleRefGenomeChange(event) {
    this.setState({ refGenome: event.target.value });
  }

  handleStartBtnClick() {
    // fileData will be merged into the file object in the root state
    let fileData = {
      refGenome: this.state.refGenome,
      patient: {
        id: this.state.patientId,
        name: this.state.patientName,
      }
    };
    this.props.startUpload(this.props.fileId, fileData);
  }

  handleViewBtnClick() {
    const patientId = this.props.file.patient.id;

    // This might be problematic for filenames with special chars
    const callsetId = patientId + '.' + this.props.file.fileName;

    const url = generatePatientRecordUrl(patientId, callsetId);
    window.open(url, '_blank');
  }

  handleDetailedLogClick() {
    location.href = XWiki.contextPath + '/rest/jobs/' + this.props.file.status.jobId + '/log';
  }

  /* Utils */

  fetchPatientIdSuggestions(input) {
    let suggestService = new XWiki.Document('SuggestPatientsService', 'PhenoTips');
    let url = suggestService.getURL('get', 'outputSyntax=plain&permission=edit&json=true&input='+input);
    return fetch(url, { credentials: 'include' })
      .then((response) => {
        return response.json();
      }).then((json) => {
        let suggestions = [];
        if (json.matchedPatients && json.matchedPatients.length) {
          suggestions = json.matchedPatients.map((patient) => {
            return {
              value: patient.id,
              label: patient.textSummary
            };
          });
        }
        return { options: suggestions };
      });
  }
}
