import React from 'react';
import ReactDOM from 'react-dom';
import { Tabs2, Tab2 } from '@blueprintjs/core';

import SourceFileUploadManager from './SourceFileUploadManager/SourceFileUploadManager.jsx'
import SourceFilesManager from './SourceFilesManager/SourceFilesManager.jsx'
import CohortsManager from './CohortsManager/CohortsManager.jsx'
import VariantsTable from './VariantsTable/VariantsTable.jsx'

export default class Variants extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedTabId: 'var',
      uploaderIsActive: false
    };

    this.handleTabChange = this.handleTabChange.bind(this);
    _.bindAll(this, [
      'handleTabChange',
      'handleUploaderActiveChange',
      'handleBeforeUnload',
      'renderVariantsTable',
      'renderSourceFilesManager',
      'renderSourceFileUploadManager',
    ]);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.uploaderIsActive != this.state.uploaderIsActive) {
      if (this.state.uploaderIsActive) {
        addEventListener('beforeunload', this.handleBeforeUnload);
      } else {
        removeEventListener('beforeunload', this.handleBeforeUnload);
      }
    }
  }

  render() {
    return (
      <Tabs2
        id="patient-variants-tabs"
        renderActiveTabPanelOnly={false}
        selectedTabId={this.state.selectedTabId}
        onChange={this.handleTabChange}
        animate={false}
      >
        <Tab2
          id="var"
          title="Variants"
          panel={this.renderVariantsTable()}
        />
        <Tab2
          id="src"
          title="Source Files"
          /* Only render this panel when it is selected. This forces the component to be totally re-rendered every time
          it becomes the current tab. This is necessary because the Blueprintjs collapsibles don't animate nicely if
          they are first rendered while hidden. */
          panel={this.state.selectedTabId === 'src' && this.renderSourceFilesManager()}
        />
        <Tab2
          id="up"
          title="Uploader"
          panel={this.renderSourceFileUploadManager()}
        />
        <Tab2
          id="cohorts"
          title="Cohorts"
          panel={this.renderCohortsManager()}
        />
        <Tabs2.Expander />
      </Tabs2>
    );
  }

  renderCohortsManager() {
    return (<CohortsManager 
        
      />);
  }

  renderVariantsTable() {
    return (<VariantsTable
        extendRequestFilters={this.extendVariantTableRequestFilters}
        extendColumns={this.extendVariantTableColumns}
        loadUserState={this.loadUserState}
        saveUserState={this.saveUserState}
        presetFilters={this.getPresetFilters()}
        exclusivePatientId={this.getExclusivePatientId()}
        ref={varTab => this.variantsTableTabInstance = varTab}
      />);
  }

  renderSourceFilesManager() {
    return (<SourceFilesManager 
        exclusivePatientId={this.getExclusivePatientId()}
      />);
  }

  renderSourceFileUploadManager() {
    return (<SourceFileUploadManager 
        onActiveChange={this.handleUploaderActiveChange} 
        exclusivePatientId={this.getExclusivePatientId()}
      />);
  }

  handleUploaderActiveChange(isActive) {
    this.setState({
      uploaderIsActive: isActive
    });
  }

  handleBeforeUnload(e) {
    let confirmationMessage = Variants.NAV_CONFIRM_MSG;

    e.returnValue = confirmationMessage;     // Gecko, Trident, Chrome 34+
    return confirmationMessage;              // Gecko, WebKit, Chrome <34
  }

  handleTabChange(newTabId, prevTabId) {
    if (newTabId == 'var') {
      // The variants might have changed since we were last on the tab, so force a refresh.
      this.variantsTableTabInstance && this.variantsTableTabInstance.refreshDisplayedData();
    }

    this.setState({
      selectedTabId: newTabId, 
      uploaderIsActive: false // Uploader is always reset on a tab change
    });
  }

  /* These methods can be overridden to change the default behaviour */

  /**
   * Change table column definition
   * @param {*} cols The table columns object, after already being initialized with default values.
   */
  extendVariantTableColumns(cols) {
    return cols;
  }

  /**
   * Change filters right before they are sent in the server request.
   * Makes it possible to set "hardcoded" filters.
   * 
   * @param {*} filters The filters object from ag-grid, as it is right before generating the request.
   */
  extendVariantTableRequestFilters(filters) {
    return filters;
  }

  /**
   * Returns a set of preset filters to apply to the Variant Table upon initialization.
   */
  getPresetFilters() {
    return {};
  }

  /**
   * Gets an exclusive patient ID to be used for various functionalities in the UI. 
   * E.g. This is used to "lock" the UI to a given patient when it's rendered on the patient form.
   */
  getExclusivePatientId() {
    return undefined;
  }

  /**
   * Loads and returns the user state.
   * 
   * @return If successfully loaded, returns an object. Otherwise, returns null.
   */
  loadUserState() {
    return null;
  }

  /**
   * Saves the user state.
   * 
   * @param {Object} the object to save.
   * @return {boolean} true if the save succeeded, otherwise false.
   */
  saveUserState(state) {
    return false;
  }
}

Variants.NAV_CONFIRM_MSG = 'There are active uploads. If you navigate away from this tab, you\'ll no longer be able ';
Variants.NAV_CONFIRM_MSG += 'to track their progress.\n\nQueued and uploading uploads will be canceled, while ';
Variants.NAV_CONFIRM_MSG += 'processing uploads will continue on the server.\n\n';
Variants.NAV_CONFIRM_MSG += 'Are you sure you want to leave this tab?';
