import React from 'react';
import ReactDOM from 'react-dom';

import PatientsCountCellRenderer from './VariantsTable/renderers/PatientsCountCellRenderer.jsx';
import Variants from './Variants.jsx';

export default class AllVariants extends Variants {
  constructor(props) {
    super(props);

    _.bindAll(this, [
      'extendVariantTableColumns',
      'extendVariantTableRequestFilters',
      'loadUserState',
      'saveUserState',
    ]);
  }

  extendVariantTableColumns(cols) {
    cols.unshift({
      'headerName': 'Patient count',
      'headerTooltip': 'Patient count',
      'field': 'callset_ids',
      'cellRendererFramework': PatientsCountCellRenderer,
      'width': 70,
      unSortIcon: true,
    });

    return cols;
  }

  loadUserState() {
    try {
      const stateStr = localStorage.getItem(AllVariants.GRID_STATE_LOCALSTORAGE_KEY);
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
      localStorage.setItem(AllVariants.GRID_STATE_LOCALSTORAGE_KEY, JSON.stringify(state));
      return true;
    } catch(e) {
      return false;
    }
  }
}

AllVariants.GRID_STATE_LOCALSTORAGE_KEY = 'AllVariantsState';

