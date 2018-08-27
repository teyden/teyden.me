import React from 'react';
import ReactDOM from 'react-dom';
import queryString from 'query-string';

import Variants from './Variants.jsx';
import CallsetsCountCellRenderer from './VariantsTable/renderers/CallsetsCountCellRenderer.jsx';
import SinglePatientSourceFilesManager from './SourceFilesManager/SinglePatientSourceFilesManager.jsx'
import { CALLSET_FILTER_URL_PARAM } from './VariantsUtils.jsx';

export default class PatientVariants extends Variants {
  constructor(props) {
    super(props);

    // Used by extendVariantTableRequestFilters
    this.patientId = XWiki.currentDocument.page;

    // Parse preset callset id filter
    const queryParams = queryString.parse(location.search);
    const callsetIdParam = queryParams[CALLSET_FILTER_URL_PARAM];
    this.callsetIdFilter = callsetIdParam || null;

    _.bindAll(this, [
      'extendVariantTableColumns',
      'extendVariantTableRequestFilters',
      'getGridStateSessionStorageKey',
      'loadUserState',
      'saveUserState',
    ]);
  }

  extendVariantTableColumns(cols) {
    cols.unshift({
      headerName: 'Callset count',
      headerTooltip: 'Callset count',
      field: 'callset_ids',
      width: 70,
      cellRendererFramework: CallsetsCountCellRenderer,
      patientId: this.getExclusivePatientId(),
      unSortIcon: true,
    });

    const toToggleVisibility = ['zygosity', 'freeze_filter'];
    _.map(cols, (col) => { if (_.indexOf(toToggleVisibility, col.field) != -1) col.hide = false; });

    return cols;
  }

  extendVariantTableRequestFilters(filters) {
    filters.push('patient_ids::=::' + this.patientId);

    return filters;
  }

  getPresetFilters() {
    let filters = {};
    if (this.callsetIdFilter) {
      filters.callset_ids = {
        type: 'equals',
        filter: this.callsetIdFilter
      };
    }

    return filters;
  }

  renderSourceFilesManager() {
    return (<SinglePatientSourceFilesManager
      exclusivePatientId={this.getExclusivePatientId()}
    />);
  }

  getExclusivePatientId() {
    return this.patientId;
  }

  getGridStateSessionStorageKey() {
    return PatientVariants.GRID_STATE_SESSION_STORAGE_KEY + ':' + this.patientId;
  }

  loadUserState() {
    try {
      const stateStr = sessionStorage.getItem(this.getGridStateSessionStorageKey());
      if (stateStr) {
        return JSON.parse(stateStr);
      } else {
        return null;
      }
    } catch (e) {
      return null;
    }
  }

  saveUserState(state) {
    try {
      sessionStorage.setItem(this.getGridStateSessionStorageKey(), JSON.stringify(state));
      return true;
    } catch (e) {
      return false;
    }
  }
}

PatientVariants.GRID_STATE_SESSION_STORAGE_KEY = 'PatientVariantsState';
