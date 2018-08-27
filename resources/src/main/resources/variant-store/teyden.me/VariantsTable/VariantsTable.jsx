import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import request from 'superagent';
import update from 'immutability-helper';
import { AgGridReact } from 'ag-grid-react';
import Clipboard from 'clipboard';
import { Toaster, Position, Intent } from '@blueprintjs/core';

import QuickFilters from './QuickFilters.jsx';
import VariantsTableManager from "./VariantsTableManager/VariantsTableManager.jsx";
import MatchedGenesFilter from './MatchedGenesFilter/MatchedGenesFilter.jsx';
import { FILTER_OR_SEPARATOR } from '../VariantsUtils.jsx';
import { VariantsTableColumnDefs, 
  VariantsTableDefaultColDef 
} from './VariantsTableColumnDefs.js';

import './VariantsTable.scss';

class DataSource {
  constructor(extendRequestFilters, exclusivePatientId) {
    this.extendRequestFilters = extendRequestFilters;
    this.exclusivePatientId = exclusivePatientId;
    this.activeReq = null;
    this.lastResponseWasEmpty = false;

    _.bindAll(this, [
      'getRows'
    ]);
  }

  getRows(args) {
    let sorts = [];
    for (let sort of args.sortModel) {
      if (sort.colId == 'callset_ids') {
        if (this.exclusivePatientId) {
          sort.colId = this.exclusivePatientId + '__callset_id_count';
        } else {
          sort.colId = 'patient_count';
        }
      }
      sorts.push(sort.colId + '::' + sort.sort);
    }

    let constructFilterClause = (column, operator, value) => {
      return column + "::" + operator + "::" + value;
    };

    let filters = [];
    for (let colId in args.filterModel) {
      let operator;
      let filterTypeToOperator = {
        'contains': '(=',
        'notContains': '!(=',
        'startsWith': '^=',
        'endsWith': '$=',
        'equals': '=',
        'notEqual': '!=',
        'lessThan': '<',
        'lessThanOrEqual': '<=',
        'greaterThan': '>',
        'greaterThanOrEqual': '>=',
      };
      let filterType = args.filterModel[colId].type;
      if (filterType == 'inRange') {
        filters.push(constructFilterClause(colId, '>=', args.filterModel[colId].filter));
        filters.push(constructFilterClause(colId, '<=', args.filterModel[colId].filterTo));
      } else {
        operator = filterTypeToOperator[args.filterModel[colId].type];
        filters.push(constructFilterClause(colId, operator, args.filterModel[colId].filter));
      }
    }

    if (this.extendRequestFilters) {
      filters = this.extendRequestFilters(filters);
    }

    this.activeReq && this.activeReq.abort();
    this.activeReq = request
      .post(XWiki.contextPath + '/rest/variants')
      .send({
        offset: args.startRow,
        limit: args.endRow - args.startRow,
        sort: sorts,
        filter: filters
      })
      .end((err, res) => {
        this.activeReq = null;
        if (err) {
          this.lastResponseWasEmpty = true;
          Toaster.create({
            position: Position.BOTTOM,
          }).show({
            intent: Intent.DANGER,
            iconName: "warning-sign",
            message: 'The variants table server request failed. If this issue persists, please contact an administrator.'
          });
          args.failCallback();
        } else {
          let rows = _.map(res.body.data, 'attributes');
          let meta = res.body.meta;
          let lastRow;
          if (meta.returned < meta.limit) {
            lastRow = meta.offset + meta.returned;
          } else {
            lastRow = null;
          }
          this.lastResponseWasEmpty = rows.length === 0;
          args.successCallback(rows, lastRow);
        }
      });
  }
}

export default class VariantsTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      inactiveFilters: {},
      gridState: {
        columnState: [],
        sortState: [],
        filterState: {}
      }
    };

    _.bindAll(this, [
      'onGridReady',
      'toggleQuickFilter',
      'handleKeyboardCopy',
      'syncGridStateToComponentState',
      'syncGridColStateToComponentState',
      'syncGridSortStateToComponentState',
      'syncGridFilterStateToComponentState',
      'addFilterOrClause',
      'removeFilterOrClause',
      'removeThenAddFilterOrClause',
      'getAllColumns',
      'getColumnDefsMap',
      'resetColumnManager',
      'toggleColumnStateProperty',
      'updateSortState',
      'reorderColumns',
      'resetFilterManager',
      'toggleFilterManagerCheckbox',
      'removeFilter',
      'updateGridNoRowsOverlay'
    ]);
    
    // Set ag-grid's props here so that they are not regenerated on each render.
    // Without this, state changes in this component cause the entire ag-grid state to be lost.
    this.gridProps = {
      onGridReady: this.onGridReady,
      defaultColDef: VariantsTableDefaultColDef,
      columnDefs: this.getColumnDefs(),
      sortingOrder: ['desc', 'asc', null],
      enableServerSideSorting: true,
      enableServerSideFilter: true,
      rowModelType: 'infinite',
      enableColResize: true,
      headerHeight: 55,
      datasource: new DataSource(this.props.extendRequestFilters, this.props.exclusivePatientId),
    }
  }

  render() {
    return (
      <div className="variants-table-wrapper">
        <QuickFilters
          gridState={this.state.gridState}
          toggleQuickFilter={this.toggleQuickFilter}
          clearColumnFilterModel={this.clearColumnFilterModel}
        />
        {this.props.exclusivePatientId && <MatchedGenesFilter
          filterState={(this.state.gridState && this.state.gridState.filterState) || {}}
          addFilterOrClause={this.addFilterOrClause}
          removeFilterOrClause={this.removeFilterOrClause}
          removeThenAddFilterOrClause={this.removeThenAddFilterOrClause}
        />}
        <VariantsTableManager
          gridState={this.state.gridState}
          getAllColumns={this.getAllColumns}
          columnDefsMap={this.getColumnDefsMap()}

          resetColumnManager={this.resetColumnManager}
          toggleColumnStateProperty={this.toggleColumnStateProperty}
          updateSortState={this.updateSortState}
          reorderColumns={this.reorderColumns}

          inactiveFilters={this.state.inactiveFilters}
          resetFilterManager={this.resetFilterManager}
          toggleFilterManagerCheckbox={this.toggleFilterManagerCheckbox}
          removeFilter={this.removeFilter}
        />
        <div className="ag-fresh" onKeyDown={this.handleKeyboardCopy}>
          <AgGridReact
            {...this.gridProps}
          />
        </div>
      </div>
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.gridState && !_.isEqual(this.state.gridState.columnState, this.columnApi.getColumnState())) {
      let colStateByColId = {
        prev: _.groupBy(this.columnApi.getColumnState(), 'colId'),
        curr: _.groupBy(this.state.gridState.columnState, 'colId')
      };
      const changedColIds = _.reduce(colStateByColId.prev, function (result, value, key) {
        return _.isEqual(value, colStateByColId.curr[key]) ?
          result : result.concat(key);
      }, []);

      if (changedColIds.length == 1) { // column properties change
        const changedColId = changedColIds[0];
        const prevColState = colStateByColId.prev[changedColId][0];
        const currColState = colStateByColId.curr[changedColId][0];
        
        if (prevColState.hide != currColState.hide) {
          this.columnApi.setColumnVisible(changedColId, !currColState.hide);
        }
        if (prevColState.pinned != currColState.pinned) {
          this.columnApi.setColumnPinned(changedColId, currColState.pinned);
        }
      } else if (changedColIds.length == 0) { // column ordering change
        // Check for a rearrangement of columns triggered by the drag-and-drop reordering UI. With this type of
        // operation, an array element moves up or down in the array, with the other elements moving 1 index as 
        // necessary. Example: [1,2,3,4,5,6] => [1,4,2,3,5,6]
        const getSingleArrayElMoveIndices = (oldArr, newArr) => {
          let newArrIdx = 0, oldArrIdx = 0, oldIdx = null, newIdx = null;
          if (oldArr.length !== newArr.length) {
            return {
              oldIdx: oldIdx,
              newIdx: newIdx,
            };
          }
          while (newArrIdx <= newArr.length || oldArrIdx <= oldArr.length) {
            if (newArr[newArrIdx] === oldArr[oldArrIdx]) {
              newArrIdx++; oldArrIdx++;
            } else if ((newArrIdx > newArr.length || newArr[newArrIdx] === oldArr[oldArrIdx + 1]) && Math.abs(newArrIdx - oldArrIdx) <= 1) {
              oldIdx = oldArrIdx;
              oldArrIdx++;
            } else if ((oldArrIdx > oldArr.length || newArr[newArrIdx + 1] === oldArr[oldArrIdx]) && Math.abs(newArrIdx - oldArrIdx) <= 1) {
              newIdx = newArrIdx;
              newArrIdx++;
            } else {
              // Not a valid case. There was more than one rearrangement.
              oldIdx = newIdx = null;
              break;
            }
          }
          return {
            oldIdx: oldIdx,
            newIdx: newIdx,
          }
        }
        let newColIds = _.map(this.state.gridState.columnState, 'colId');
        let oldColIds = _.map(this.columnApi.getColumnState(), 'colId');
        const { oldIdx, newIdx } = getSingleArrayElMoveIndices(oldColIds, newColIds);
        if (oldIdx >= 0 && newIdx >= 0) {
          this.columnApi.moveColumnByIndex(oldIdx, newIdx);
        } else {
          // If this wasn't a valid single-element move, fall back to setting the whole state, which is slower
          this.columnApi.setColumnState(this.state.gridState.columnState);
        }
      } else {
        this.columnApi.setColumnState(this.state.gridState.columnState);
      }
    }
    if (this.state.gridState && !_.isEqual(this.state.gridState.sortState, this.api.getSortModel())) {
      this.api.setSortModel(this.state.gridState.sortState);
    }
    if (this.state.gridState && !_.isEqual(this.state.gridState.filterState, this.api.getFilterModel())) {
      this.api.setFilterModel(this.state.gridState.filterState);
    }
    this.props.saveUserState(this.state.gridState);
  }

  handleKeyboardCopy(e) {
    let clipboard = (text, event) => {
      const cb = new Clipboard('.null', {
        text: () => text
      });

      cb.on('success', function (e) {
        cb.off('error');
        cb.off('success');
      });

      cb.on('error', function (e) {
        cb.off('error');
        cb.off('success');
      });

      cb.onClick(event);
    }

    if (e.keyCode == 67 && (e.metaKey || e.ctrlKey)) {
      let cellVal = $$('.ag-cell-focus')[0].innerText;
      clipboard(cellVal, e);
    }
  }

  getAllColumns() {
    if (this.columnApi && this.columnApi.getAllColumns()) {
      let columns = {};
      for (let column of this.columnApi.getAllColumns()) {
        columns[column.colId] = column;
      }
      return columns;
    } else {
      return {};
    }
  }

  /**
   * Adds an OR clause to the given column. 
   * If any filter is set for the column, the existing filter type is maintained and the clause added. 
   * If no filter is set for the column, a type "equals" filter is set on the column and the clause added.
   * @param {*} colId ID of the column
   * @param {*} value The value for the OR clause. May be a single value, or an array.
   */
  addFilterOrClause(colId, value) {
    this.setState((state) => {
      let filterState = state.gridState.filterState;
      let change = {};
      if (filterState[colId]) {
        const addClauseFn = (filterStr) => {
          let filterClauses = (filterStr && filterStr.split(FILTER_OR_SEPARATOR)) || [];
          if (_.isArray(value)) {
            filterClauses = _.uniq(_.concat(filterClauses, value));
          } else {
            if (filterClauses.indexOf(value) === -1) {
              filterClauses.push(value);
            }
          }
          return filterClauses.join(FILTER_OR_SEPARATOR);
        };
        _.set(change, 'gridState.filterState.' + colId + '.filter', { $apply: addClauseFn });
      } else {
        const filterObj = {
          type: 'equals',
          filter: _.isArray(value) ? value.join(FILTER_OR_SEPARATOR) : value
        };
        _.set(change, 'gridState.filterState.' + colId, { $set: filterObj });
      }
      return update(state, change);
    });
  }

  /**
   * Removes an OR clause to the given column. 
   * If any filter is set for the column, the clause is removed if it exists. 
   * If no filter is set for the column, nothing happens.
   * @param {*} colId ID of the column
   * @param {*} value The value for the OR clause. May be a single value, or an array.
   */
  removeFilterOrClause(colId, value) {
    this.setState((state) => {
      let filterState = state.gridState.filterState;
      let change = {};
      if (filterState[colId]) {
        const removeClauseFn = (filterStr) => {
          let filterClauses = (filterStr && filterStr.split(FILTER_OR_SEPARATOR)) || [];
          if (_.isArray(value)) {
            return _.difference(filterClauses, value).join(FILTER_OR_SEPARATOR);
          } else {
            return _.pull(filterClauses, value).join(FILTER_OR_SEPARATOR);
          }
        };
        _.set(change, 'gridState.filterState.' + colId + '.filter', { $apply: removeClauseFn });
      }
      return update(state, change);
    });
  }

  /**
   * Modifies an OR clause for the given column, first removing and then adding the respective arguments.
   * If no filter is set for the column, `toRemove` will be ignored and `toAdd` will be added.
   * @param {*} colId ID of the column
   * @param {*} toRemove The value to remove. May be a single value, or an array.
   * @param {*} toAdd The value to add. May be a single value, or an array.
   */
  removeThenAddFilterOrClause(colId, toRemove, toAdd) {
    // Convert both to array format so that we can handle them easily
    const toRemoveArr = _.isArray(toRemove) ? toRemove : [toRemove];
    const toAddArr = _.isArray(toAdd) ? toAdd : [toAdd];

    this.setState((state) => {
      let filterState = state.gridState.filterState;
      let change = {};
      if (filterState[colId]) {
        const removeThenAddClauseFn = (filterStr) => {
          let filterClauses = (filterStr && filterStr.split(FILTER_OR_SEPARATOR)) || [];
          return _.uniq(_.concat(_.difference(filterClauses, toRemoveArr), toAddArr)).join(FILTER_OR_SEPARATOR);
        };
        _.set(change, 'gridState.filterState.' + colId + '.filter', { $apply: removeThenAddClauseFn });
      } else {
        const filterObj = {
          type: 'equals',
          filter: toAdd.join(FILTER_OR_SEPARATOR)
        };
        _.set(change, 'gridState.filterState.' + colId, { $set: filterObj });
      }
      return update(state, change);
    });
  }

  addFilterState(field, model) {
    this.setState((state) => {
      let change = { gridState: { filterState: { $merge: { [field]: model } } } };
      return update(state, change);
    });
  }

  removeFilterState(field) {
    this.setState((state) => {
      let change = { gridState: { filterState: { $unset: [field] } } };
      return update(state, change);
    });
  }

  addInactiveFilter(field, model) {
    this.setState((state) => {
      let change = { inactiveFilters: { $merge: { [field]: model } } };
      return update(state, change);
    });
  }

  removeInactiveFilter(field) {
    this.setState((state) => {
      let change = { inactiveFilters: { $unset: [field] } };
      return update(state, change);
    });
  }

  /**
   * Handles toggling the filter active state. If checked, then the filter is active, and if not, then
   * the filter is inactive but remains in the filter manager UI.
   * @param {*} field the field name of the column
   * @param {*} checked true if checked, false if not
   */
  toggleFilterManagerCheckbox(field, checked) {
    const removeInactiveFilterThenAddFilterState = (field, model) => {
      this.setState((state) => {
        let change = {
          inactiveFilters: { $unset: [field] },
          gridState: { filterState: { $merge: { [field]: model } } }
        };
        return update(state, change);
      });
    }
    const removeFilterStateThenAddInactiveFilter = (field, model) => {
      this.setState((state) => {
        let change = {
          gridState: { filterState: { $unset: [field] } },
          inactiveFilters: { $merge: { [field]: model } }
        };
        return update(state, change);
      });
    }

    if (checked == true) {
      let model = _.cloneDeep(this.state.inactiveFilters[field]);
      delete model.isInactive;
      removeInactiveFilterThenAddFilterState(field, model);

    } else if (checked == false) {
      let model = _.cloneDeep(this.state.gridState.filterState[field]);
      model.isInactive = true;
      removeFilterStateThenAddInactiveFilter(field, model);
    }
  }

  /**
   * Handles removing a filter from the filter manager, whether active or inactive.
   * @param {*} field the field name of the column
   */
  removeFilter(field) {
    if (this.state.gridState.filterState[field]) {
      this.removeFilterState(field);
    } else {
      this.removeInactiveFilter(field);
    }
  }

  /**
   * Handles resetting filters from the filter manager, inclusive of filters in the filter state (active)
   * and the inactive filters.
   */
  resetFilterManager() {
    this.setState((state) => {
      let change = { gridState: { filterState: { $set: {} } }, inactiveFilters: { $set: {} } };
      return update(state, change);
    });
  }

  /**
   * Adds OR filter clauses to the existing filter for a column.
   * @param {*} field the field name of the column
   * @param {*} filters an array of the filters that will be appended as OR clauses
   */
  extendFilter(field, filtersToAdd) {
    this.setState((state) => {
      let extendedFilter = state.gridState.filterState[field].filter.split(FILTER_OR_SEPARATOR);
      for (let filter of filtersToAdd) {
        extendedFilter.push(filter);
      }
      let change = { gridState: { filterState: { [field]: { filter: { $set: extendedFilter.join(FILTER_OR_SEPARATOR) } } } } }
      return update(state, change);
    });
  }

  /**
   * Removes OR filter clauses from an existing filter for a column.
   * @param {*} field the field name of the column
   * @param {*} filters an array of the current filters for the column that will be removed
   */
  trimFilter(field, filtersToRemove) {
    this.setState((state) => {
      let trimmedFilter = [];
      let stateFilters = state.gridState.filterState[field].filter.split(FILTER_OR_SEPARATOR);
      for (let filter of stateFilters) {
        if (filtersToRemove.indexOf(filter) == -1) {
          trimmedFilter.push(filter);
        }
      }
      let change = { gridState: { filterState: { [field]: { filter: { $set: trimmedFilter.join(FILTER_OR_SEPARATOR) } } } } }
      return update(state, change);
    });
  }

  /**
   * Checks whether a given column's filter value exists in its filter state, if it does not, then adds to the
   * return array.
   * @param {*} field the field name of the column
   * @param {*} model the filter model object
   * @param {*} filterState the current filterState
   * @returns {Array} containing all the unique filter values for the column that aren't in the filterState
   */
  static getOrClauseFiltersToAdd(field, model, filterState) {
    let uniques = [];
    if (filterState[field] && filterState[field].type == model.type) {
      let stateFilters = filterState[field].filter.split(FILTER_OR_SEPARATOR);
      let modelFilters = model.filter.split(FILTER_OR_SEPARATOR);
      for (let filter of modelFilters) {
        if (stateFilters.indexOf(filter) == -1) {
          uniques.push(filter);
        }
      }
    }
    return uniques;
  };

  /**
   * Handles toggling a quick filter button.
   * @param {*} field the field name of the column
   * @param {*} model the filter model object
   */
  toggleQuickFilter(field, model) {
    let filterState = this.state.gridState.filterState;
    const identicalExists = filterState[field] && filterState[field].type == model.type
      && filterState[field].filter == model.filter;
    const sameTypeExists = filterState[field] && filterState[field].type == model.type
      && filterState[field].filter != model.filter;

    if (identicalExists) {
      this.removeFilterState(field);
    } else if (sameTypeExists) {

      let filtersToConcat = VariantsTable.getOrClauseFiltersToAdd(field, model, filterState);
      if (filtersToConcat.length > 0) {
        this.extendFilter(field, filtersToConcat);
      } else {
        this.trimFilter(field, model.filter.split(FILTER_OR_SEPARATOR));
      }

    } else {
      this.addFilterState(field, model);
    }
  }

  /**
   * Resets (clears or resets back to default) both the column state and sort state.
   */
  resetColumnManager() {
    this.setState((state) => {
      let change = { gridState: {
        columnState: { $set: this.defaultColumnState },
        sortState: { $set: [] }
      } };
      return update(state, change);
    })
  }

  /**
   * Updates the order of the columns in the table.
   * @param {*} fromIndex the index of the column's original position
   * @param {*} toIndex the target index where the column will be moved to
   */
  reorderColumns(fromIndex, toIndex) {
    this.setState((state) => {
      let newColumnState = _.clone(state.gridState.columnState);
      newColumnState.splice(toIndex, 0, newColumnState.splice(fromIndex, 1)[0]);
      return update(state, { gridState: { columnState: { $set: newColumnState }}});
    });
  }

  /**
   * Toggles a property state of a column.
   * @param {*} column the column object to update
   * @param {*} property the property of the column to toggle
   */
  toggleColumnStateProperty(column, property) {
    const toggleColumnProperty = (column, key) => {
      if (key === 'pinned') {
        return column.pinned ? null : 'left';
      } else if (key === 'hide') {
        return !column.hide;
      }
      return null;
    };

    this.setState((state) => {
      let columnIdx = _.findIndex(state.gridState.columnState, { colId: column.colId });
      let columnToUpdate = state.gridState.columnState[columnIdx];
      let valueChange = toggleColumnProperty(columnToUpdate, property);
      let change = { gridState: { columnState: { $splice:
        [[columnIdx, 1, update(columnToUpdate, { [property]: { $set: valueChange }})]] } } }
      return update(state, change);
    })
  }

  /**
   * Updates the sort state of a column.
   * @param {*} column the column object to update
   * @param {*} sort the value of the sorting direction, either "off", "asc" or "desc"
   */
  updateSortState(column, sort) {
    const getAddColumnSortChange = (colId, sort) => {
      return { gridState: { sortState: { $push: [{ colId: colId, sort: sort }] } } }
    };
    const getRemoveColumnSortChange = (existingColumnIdx) => {
      return { gridState: { sortState: { $splice: [[existingColumnIdx, 1]] } } };
    };
    const getUpdateColumnSortChange = (sortState, existingColumnIdx, sort) => {
      return { gridState: { sortState: {
        $splice: [[existingColumnIdx, 1, update(sortState[existingColumnIdx], { sort: { $set: sort } })]] } } };
    };

    this.setState((state) => {
      let existingColumnIdx = _.findIndex(state.gridState.sortState, { colId: column.colId });
      let change;
      if (existingColumnIdx == -1) {
        if (sort == "off") {
          return state;
        }
        change = getAddColumnSortChange(column.colId, sort);
      } else {
        change = sort == "off" ?
          getRemoveColumnSortChange(existingColumnIdx) :
          getUpdateColumnSortChange(state.gridState.sortState, existingColumnIdx, sort);
      }
      return update(state, change);
    })
  }

  getColumnDefsMap() {
    let columnDefsMap = {};
    for (let col of this.getColumnDefs()) {
      columnDefsMap[col.field] = col;
    }
    return columnDefsMap
  }

  getColumnDefs() {
    if (!this.columnDefs) {
      let cols = VariantsTableColumnDefs;

      if (this.props.extendColumns) {
        cols = this.props.extendColumns(cols);
      }

      this.columnDefs = cols;
    }
    return this.columnDefs;
  }

  onGridReady(params) {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.defaultColumnState = this.columnApi.getColumnState();

    const colEvts = ['columnResized', 'columnRowGroupChanged', 'gridColumnsChanged', 'displayedColumnsChanged'];
    const sortEvts = ['sortChanged'];
    const filterEvts = ['filterChanged'];
    _.each(colEvts, (evtName) => { this.api.addEventListener(evtName, this.syncGridColStateToComponentState); });
    _.each(sortEvts, (evtName) => { this.api.addEventListener(evtName, this.syncGridSortStateToComponentState); });
    _.each(filterEvts, (evtName) => { this.api.addEventListener(evtName, this.syncGridFilterStateToComponentState); });

    this.api.addEventListener('modelUpdated', this.updateGridNoRowsOverlay);
    this.updateGridNoRowsOverlay();

    let userGridState = this.props.loadUserState();

    if (this.props.gridState || this.props.presetFilters || userGridState) {
      let initGridState = _.merge({}, userGridState, this.props.gridState);
      let { columnState, sortState, filterState } = initGridState;
      columnState && this.columnApi.setColumnState(columnState);
      sortState && this.api.setSortModel(sortState);
      filterState = _.merge(filterState, this.props.presetFilters);
      filterState && this.api.setFilterModel(filterState);
    }

    this.syncGridStateToComponentState();
  }

  updateGridNoRowsOverlay() {
    const dataSource = this.api.infinitePageRowModel.datasource;
    if (dataSource.activeReq === null && dataSource.lastResponseWasEmpty) {
      this.api.showNoRowsOverlay();
    } else {
      this.api.hideOverlay();
    }
  }

  syncGridStateToComponentState() {
    const gridState = {
      columnState: this.columnApi.getColumnState(),
      sortState: this.api.getSortModel(),
      filterState: this.api.getFilterModel()
    };

    this.setState({
      gridState: gridState
    });
  }

  syncGridColStateToComponentState() {
    // Capture the state at the time of event firing, not at the time of state update.
    const newState = this.columnApi.getColumnState();

    this.setState((state) => {
      return update(state, _.set({}, 'gridState.columnState.$set', newState));
    });
  }

  syncGridSortStateToComponentState() {
    // Capture the state at the time of event firing, not at the time of state update.
    const newState = this.api.getSortModel();

    this.setState((state) => {
      return update(state, _.set({}, 'gridState.sortState.$set', newState));
    });
  }

  syncGridFilterStateToComponentState() {
    // Capture the state at the time of event firing, not at the time of state update.
    const newFilterModel = this.api.getFilterModel();

    this.setState((state) => {
      let change = _.set({}, 'gridState.filterState.$set', newFilterModel);

      // For any filters that have been added to filterState that already exist in inactiveFilters, remove the filter
      // from inactiveFilters
      _.set(change, 'inactiveFilters.$unset', _.keys(newFilterModel));

      return update(state, change);
    });
  }

  refreshDisplayedData() {
    this.api.onFilterChanged();
  }
}