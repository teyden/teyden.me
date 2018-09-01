import React from 'react';
import ReactPaginate from 'react-paginate';
import update from 'immutability-helper';
import Select from 'react-select';
import request from 'superagent';
import formatDate from 'date-format';
import { NonIdealState, Intent, Button, Popover, Position, Menu, MenuItem, MenuDivider, Alert, EditableText,
  Checkbox, Dialog } from '@blueprintjs/core';
import CohortJobStatusTag from './CohortJobStatusTag.jsx';
import CohortDocumentStatus from './CohortDocumentStatus.jsx';

import './CohortsManager.scss';

export default class CohortDetailedPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      pagination: {
        perPage: 10,
        offset: 0,
      },
      isDialogOpen: false,
      isDeleteCohortAlertOpen: false,
      checkedCallsetIdsToRemove: {},
      checkedCallsetIdsToAdd: {},
      singlePatientCallsets: [],
      patientId: null,
      patientName: null,
    };
    this.state.pagination.totalPages = 0;

    _.bindAll(this, [
      'handleEditNameSubmit',
      'handleEditDescriptionSubmit',
      'toggleCheckboxCallsetToRemove',
      'toggleCheckboxCallsetToAdd',
      'toggleDialog',
      'handlePatientIdChange',
      'handleAddCheckedCallsetsSubmit',
      'handleRemoveCheckedCallsetsSubmit'
    ]);
  }

  render() {
    if (!this.props.id && !this.state.isLoading) {
      return (
        <div id="cohort-detailed-page">
          <NonIdealState
            title='No cohort loaded'
            visual='folder-open'
            description='To load a cohort, please select one from the list.'
          />
        </div>
      );
    } else {
      return (
        <div id="cohort-detailed-page" className={this.state.isLoading ? 'is-loading' : null}>
          {this.renderId()}
          {this.renderStructuralMetadata()}
          {this.renderAdministrativeMetadata()}
          {this.renderStatuses()}
          {this.renderActionMenu()}
          {this.renderBasicInformation()}
          {this.renderCurrentCallsetsTable()}
          {this.renderRemoveButton()}
          <div className="horizontal-divider"></div>
          {this.renderAddDialogAndButtons()}
          {this.renderStagedCallsets()}
        </div>
      );
    }
  }

  renderId() {
    return (
      <div className="cohort-id">
        {this.props.id}
      </div>
    );
  }

  renderBasicInformation() {
    return (
      <div className="basic-information inline-edit">
        <div>
          <div className="label">
            Name:
          </div>
          <div className="inline-edit-container name">
            <EditableText
              className="inline-edit-text"
              defaultValue={this.props.attributes.name}
              multiline
              minLines={1}
              maxLines={1}
              maxLength={100}
              placeholder={'Click to enter a name'}
              confirmOnEnterKey={true}
              onConfirm={this.handleEditNameSubmit}
              key={this.props.id + "name"}
              isEditing={this.state.isEditingName}
            />
          </div>
        </div>
        <div>
          <div className="label">
            Description:
          </div>
          <div className="inline-edit-container description">
            <EditableText
              className="inline-edit-text"
              defaultValue={this.props.attributes.description}
              multiline
              minLines={6}
              maxLines={6}
              maxLength={500}
              placeholder={'Click to enter a description'}
              confirmOnEnterKey={true}
              onConfirm={this.handleEditDescriptionSubmit}
              key={this.props.id + "description"}
              isEditing={this.state.isEditingDescription}
            />
          </div>
        </div>
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

  renderAdministrativeMetadata() {
    let dateCreated = new Date(this.props.attributes.creationDateTime);
    let dateCreatedStr = formatDate('yyyy-MM-dd HH:mm:ss.SSS', dateCreated);
    let dateUpdated = new Date(this.props.attributes.lastUpdatedDateTime);
    let dateUpdatedStr = formatDate('yyyy-MM-dd HH:mm:ss.SSS', dateUpdated);
    return (
      <div className="cohort-administrative-metadata">
        <span>Created by {this.props.attributes.createdByUserId} on {dateCreatedStr}</span>
        <span>Last updated on {dateUpdatedStr}</span>
      </div>
    );
  }

  renderStatuses() {
    return (
      <div className="cohort-statuses">
        <CohortJobStatusTag
          {...this.props}
          jobOrder={this.props.jobOrder}
        />
        <CohortDocumentStatus
          status={this.props.status}
        />
      </div>
    );
  }

  renderActionMenu() {
    let isNotDraft = this.props.status == 'CLEAN' || this.props.status == 'OUTDATED';
    let dropdown = (
      <Menu>
        {isNotDraft && <MenuItem
          iconName="document-open"
          text="View in variant table"
          onClick={this.handleViewInVariantTableClick}
        />}
        {this.props.attributes.processingStatus != 'ACTIVE' && isNotDraft && <MenuDivider />}
        {this.props.attributes.processingStatus != 'ACTIVE' && <MenuItem
          text="Delete"
          iconName="delete"
          intent={Intent.DANGER}
          onClick={() => { this.setState({ isDeleteCohortAlertOpen: true })}}
        />}
      </Menu>
    );

    let isProcessingDeletion = this.isProcessingDeletion();

    let draftStatusButtonState = !this.props.callsetIdsToAdd || this.props.callsetIdsToAdd.length == 0
      ? "pt-disabled" : "pt-intent-primary";
    let outdatedStatusButtonState = this.props.callsetIdsToRemove && this.props.callsetIdsToRemove.length != 0
        || this.props.callsetIdsToAdd &&  this.props.callsetIdsToAdd.length != 0 ? "pt-intent-primary" : "pt-disabled";

    return (
      <div className="cohort-action-menu">
        {this.props.status == 'DRAFT' && <Button
          id="primary-action"
          className={draftStatusButtonState}
          iconName="circle-arrow-right"
          text="Process"
          onClick={this.handleProcessCohortClick}
        />}
        {this.props.status == 'OUTDATED' && <Button
          id="primary-action"
          className={outdatedStatusButtonState}
          iconName="repeat"
          text="Reprocess"
          onClick={this.handleProcessCohortClick}
        />}
        {this.props.status == 'CLEAN' && <Button
          id="primary-action"
          className="pt-disabled"
          iconName="repeat"
          text="Reprocess"
        />}
        <div className="pt-button-group pt-minimal" onClick={this.props.handleBlacklistedChildElClick || null}>
          {!isProcessingDeletion && [<Popover key="popover" content={dropdown} position={Position.LEFT_TOP}>
            <Button><span className="fa fa-lg fa-ellipsis-v" /></Button>
          </Popover>, this.renderDeleteConfirmAlert()]}
        </div>
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
    return this.props.jobType.indexOf('delete') !== -1
      && _.includes(['ACTIVE', 'QUEUED'], this.props.attributes.processingStatus);
  }

  renderCurrentCallsetsTable() {
    // The checkboxes can be refactored into a separate component, as well as the callsets table (includes filter and pagination)
    // TODO - client side pagination an filtering is not complete (use the source files rest endpoint to get the metadata for this section)
    let checkboxes = [];
    let _this = this;
    _.forEach(this.props.attributes.currentCallSetIds, (callsetId) => {
      let idParts = _.split(callsetId, ".");
      checkboxes.push(
        <Checkbox
          key={callsetId}
          id={callsetId}
          checked={_this.isCallsetChecked(callsetId, "remove")}
          onChange={_this.toggleCheckboxCallsetToRemove}
        >
          {idParts[1] + "." + idParts[2]}
          <span className="patient-id">{idParts[0]}</span>
          <span className="platform">HiSeq</span>
          <span className="upload-date">Uploaded {Date.now()}</span>
        </Checkbox>
      );
    });

    return (
      <div id="cohort-callsets-table">
        <div id="cohort-callsets-table-filter-input" className="pt-input-group pt-large">
          <span className="pt-icon pt-icon-filter" />
          <input
            className="pt-input"
            type="search"
            placeholder="Begin typing to filter by callset name, patient name or patient ID..."
            dir="auto"
            // TODO onInput={this.handleFilterInput}
          />
        </div>
        <div id="cohort-callsets-table-items">
          {checkboxes}
        </div>
        <div id="cohort-callsets-table-pagination">
          <ReactPaginate
            pageCount={this.state.pagination.totalPages}
            pageRangeDisplayed={this.state.pagination.perPage}
            forcePage={this.state.pagination.offset / this.state.pagination.perPage}
            marginPagesDisplayed={5}
            nextLabel={<span className="pt-icon-standard pt-icon-chevron-right pt-align-right" />}
            previousLabel={<span className="pt-icon-standard pt-icon-chevron-left" />}
            breakLabel={<a>...</a>}
            breakClassName={"break"}
            marginPagesDisplayed={2}
            onPageChange={this.handleCohortsListPageClick}
            containerClassName={"pagination pt-button-group"}
            subContainerClassName={"pages pagination"}
            previousClassName={"pt-button"}
            nextClassName={"pt-button"}
            pageClassName={"pt-button"}
            breakClassName={"pt-button pt-disabled"}
            activeClassName={"pt-intent-primary"}
            disabledClassName={"pt-disabled"}
          />
        </div>
      </div>
    );
  }

  getButtonText(action) {
    if (action == "remove") {
      let numCallsetsToRemove = Object.keys(this.state.checkedCallsetIdsToRemove).length;
      if (numCallsetsToRemove > 1) {
        return "Remove " + "(" + numCallsetsToRemove + " callsets)";
      }
      return numCallsetsToRemove == 1 ? "Remove (1 callset)" : "Remove";
    } else if (action == "add") {
      let numCallsetsToAdd = Object.keys(this.state.checkedCallsetIdsToAdd).length;
      if (numCallsetsToAdd > 1) {
        return "Add " + "(" + numCallsetsToAdd + " callsets)";
      }
      return numCallsetsToAdd == 1 ? "Add (1 callset)" : "Add";
    }
  }

  renderRemoveButton() {
    return (
      <Button
        id="cohort-callsets-remove-button"
        className={Object.keys(this.state.checkedCallsetIdsToRemove).length == 0 ? "pt-disabled" : "pt-intent-primary"}
        iconName="trash"
        text={this.getButtonText("remove")}
        onClick={this.handleRemoveCheckedCallsetsSubmit}
      />
    );
  }

  getResolutionMessageForCallsetToAdd(callset) {
    if (this.props.selectedCohortCallsetIds.has(callset.id)
      || this.props.attributes.callsetIdsToAdd.includes(callset.id)) { // Should change to a map
      return "Already exists in the cohort";
    }
    if (this.props.attributes.refGenome !== callset.attributes.refGenome) {
      return "Reference genome does not match";
    }
    if (this.props.selectedCohortPatientIds.has(callset.attributes.patientId)) {
      return "Patient has another callset in the cohort";
    }
    // TODO - potential bug: handling add of callsets which are already considered "deleted" from the cohort and are in the staging area
    // Will need to check the toRemove list when adding a callset
  }

  validateCallsetToAdd(callset) {
    if (this.props.selectedCohortCallsetIds.has(callset.id)
      || this.props.attributes.callsetIdsToAdd.includes(callset.id)
      || this.props.attributes.refGenome !== callset.attributes.refGenome) { // Should change toAdd array to a map or set
        return true;
    } else if (this.props.selectedCohortPatientIds.has(callset.attributes.patientId)) {
      return false;
    }
  }

  renderAddDialogAndButtons() {
    let checkboxes = [];
    let _this = this;
    _.forEach(this.state.singlePatientCallsets, (callset) => {
      checkboxes.push(
        <Checkbox
          key={callset.id}
          id={callset.id}
          checked={_this.isCallsetChecked(callset.id, "add")}
          onChange={_this.toggleCheckboxCallsetToAdd}
          disabled={_this.validateCallsetToAdd(callset)}
        >
          {callset.attributes.fileName}
          <span className="ref-genome">{callset.attributes.refGenome}</span>
          <span className="platform">HiSeq</span>
          <span className="upload-date">
            Uploaded {formatDate('yyyy-MM-dd', new Date(callset.attributes.jobCreatedDateTime))}
          </span>
          <span className="resolution-message">{_this.getResolutionMessageForCallsetToAdd(callset)}</span>
        </Checkbox>
      );
    });

    return (
      <Button
        id="cohort-callsets-add-by-patient-id-button"
        iconName="add"
        text="Add callsets by patient ID"
        onClick={this.toggleDialog}
      >
        <Dialog
          isOpen={this.state.isOpen}
          onClose={this.toggleDialog}
          title={"Add callsets to cohort " + this.props.id}
        >
          <div className="pt-dialog-body">
            {this.renderPatientIdSelector()}
            <div className="cohort-structural-metadata">
              <span>{this.props.attributes.refGenome}</span>
            </div>
            <div id="single-patient-callsets-table-items">
              {checkboxes.length == 0 ?
                <NonIdealState
                  title='No callsets loaded'
                  visual='folder-open'
                  description='To load a callsets, please enter a patient ID or name above.'
                /> : <span className="title">Select callsets to add:</span>}
              {checkboxes}
            </div>
          </div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-actions">
              <Button
                id="cohort-callsets-add-button"
                intent={Intent.PRIMARY}
                onClick={this.handleAddCheckedCallsetsSubmit}
                text={this.getButtonText("add")}
              />
              <Button text="Cancel"
                onClick={this.toggleDialog}
              />
            </div>
          </div>
        </Dialog>
      </Button>
    );
  }

  renderPatientIdSelector() {
    return (
      <Select.Async
        value={this.state.patientId}
        loadOptions={this.fetchPatientIdSuggestions}
        onChange={this.handlePatientIdChange}
      />
    );
  }

  renderStagedCallsets() {

  }

  handleEditNameSubmit(name) {
    if (name != "" && name != this.props.attributes.name) {
      this.props.handleEditNameSubmit(this.props.id, this.props.attributes.version, name);
    }
  }

  handleEditDescriptionSubmit(description) {
    if (description != "" && description != this.props.attributes.description) {
      this.props.handleEditDescriptionSubmit(this.props.id, this.props.attributes.version, description);
    }
  }

  isCallsetChecked(callsetId, action) {
    if (action == "remove") {
      return callsetId in this.state.checkedCallsetIdsToRemove;
    } else if (action == "add") {
      return callsetId in this.state.checkedCallsetIdsToAdd;
    }
  }

  toggleCheckboxCallsetToRemove(e) {
    if (e.target && e.target.id) {
      let callsetId = e.target.id;
      if (callsetId in this.state.checkedCallsetIdsToRemove) {
        this.setState((state) => {
          return update(state, { checkedCallsetIdsToRemove: { $unset: [callsetId] } });
        });
      } else {
        this.setState((state) => {
          return update(state, { checkedCallsetIdsToRemove:  { $merge: { [callsetId]: true } } });
        });
      }
    }
  }

  toggleCheckboxCallsetToAdd(e) {
    if (e.target && e.target.id) {
      let callsetId = e.target.id;
      if (callsetId in this.state.checkedCallsetIdsToAdd) {
        this.setState((state) => {
          return update(state, { checkedCallsetIdsToAdd: { $unset: [callsetId] } });
        });
      } else {
        this.setState((state) => {
          return update(state, { checkedCallsetIdsToAdd:  { $merge: { [callsetId]: true } } });
        });
      }
    }
  }

  handleRemoveCheckedCallsetsSubmit() {
    let updatedCallsetsToRemoveList = _.map(this.props.attributes.callsetIdsToRemove, _.cloneDeep);
    _.forEach(Object.keys(this.state.checkedCallsetIdsToRemove), (callsetId) => {
      updatedCallsetsToRemoveList.push(callsetId);
    });
    this.props.updateCohort(this.props.id,
      {callsetIdsToRemove: updatedCallsetsToRemoveList, version: this.props.attributes.version});
  }

  handleAddCheckedCallsetsSubmit() {
    this.toggleDialog();
    let updatedCallsetsToAddList = _.map(this.props.attributes.callsetIdsToAdd, _.cloneDeep);
    _.forEach(Object.keys(this.state.checkedCallsetIdsToAdd), (callsetId) => {
      updatedCallsetsToAddList.push(callsetId);
    });
    this.props.updateCohort(this.props.id,
      {callsetIdsToAdd: updatedCallsetsToAddList, version: this.props.attributes.version});
  }

  toggleDialog() {
    this.setState({ isOpen: !this.state.isOpen });
    this.handlePatientIdChange();
  }

  handlePatientIdChange(e) {
    if (e) {
      let patientId = e.value;
      if (patientId == this.state.patientId) {
        return;
      }
      // For now, we extract the full name out of the label provided to us by the suggestions service.
      let nameMatches = e.label.match(/name: '(.+)'\)$/);
      let patientName = (nameMatches && nameMatches[1]) || null;
      request.get(XWiki.contextPath + '/rest/variant-source-files/patients/' + patientId + "/metadata")
        .end((err, res) => {
          if (err) {
            console.error(err);
            return;
          }
          this.setState({
            patientName: patientName,
            patientId: patientId,
            singlePatientCallsets: res.body.data,
            checkedCallsetIdsToAdd: {}
          });
        });

    } else { // The clear button was pressed
      this.setState({ patientName: null, patientId: null, singlePatientCallsets: [], checkedCallsetIdsToAdd: {}});
    }
  }

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


