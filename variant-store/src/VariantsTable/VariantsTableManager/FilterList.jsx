import React from 'react';
import _ from 'lodash';

import FilterListItem from './FilterListItem.jsx';

export default class FilterList extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      this.renderFilterList()
    );
  }

  renderFilterList() {
    let filterListItems = [];
    if (this.props.gridState && this.props.gridState.filterState) {
      let filters = _.toPairs(_.assign(_.cloneDeep(this.props.gridState.filterState), _.cloneDeep(this.props.inactiveFilters)));
      _.map(filters, (arr) => { arr[1].headerName = this.props.columnDefsMap[arr[0]].headerName; });
      filters = _.sortBy(filters, [(arr) => { return arr[1].headerName.toLowerCase(); }]);
      for (let [field, model] of filters) {
        filterListItems.push(
          <FilterListItem
            key={field}
            field={field}
            model={model}
            gridState={this.props.gridState}
            getAllColumns={this.props.getAllColumns}
            columnDefsMap={this.props.columnDefsMap}
            toggleFilterManagerCheckbox={this.props.toggleFilterManagerCheckbox}
            removeFilter={this.props.removeFilter}
          />
        );
      }
    }

    return (
      <div className="filter-list">
        {filterListItems.length == 0 ? EMPTY_STATE : filterListItems}
      </div>
    );
  }
}

const EMPTY_STATE =
  <div className="pt-non-ideal-state empty">
    <div className="pt-non-ideal-state-visual pt-non-ideal-state-icon">
      <span className="pt-icon pt-icon-filter"></span>
    </div>
    <h4 className="pt-non-ideal-state-title">No active filters</h4>
    <div className="pt-non-ideal-state-description">
      Activate a filter from above the table or by hovering over a column header to set a custom filter
    </div>
  </div>