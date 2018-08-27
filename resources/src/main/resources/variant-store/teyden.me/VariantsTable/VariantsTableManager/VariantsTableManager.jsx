import React from 'react';

import TableSummary from "./TableSummary.jsx";
import ColumnManager from "./ColumnManager.jsx";
import FilterManager from "./FilterManager.jsx";

export default class VariantsTableManager extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="variants-table-manager pt-callout">
        <TableSummary
          className="table-summary"
          totalColumnsCount={_.keys(this.props.getAllColumns()).length}
          visibleColumnsCount={_.filter(this.props.gridState.columnState, (col) => !col.hide).length}
          activeFiltersCount={_.keys(this.props.gridState.filterState).length}
          sortedColumnsCount={this.props.gridState.sortState.length}
        />
        <FilterManager
          className="filter-manager"
          gridState={this.props.gridState}
          inactiveFilters={this.props.inactiveFilters}
          columnDefsMap={this.props.columnDefsMap}
          getAllColumns={this.props.getAllColumns}
          resetFilterManager={this.props.resetFilterManager}
          toggleFilterManagerCheckbox={this.props.toggleFilterManagerCheckbox}
          removeFilter={this.props.removeFilter}
        />
        <ColumnManager
          className="column-manager"
          gridState={this.props.gridState}
          columnDefsMap={this.props.columnDefsMap}
          getAllColumns={this.props.getAllColumns}
          resetColumnManager={this.props.resetColumnManager}
          toggleColumnStateProperty={this.props.toggleColumnStateProperty}
          updateSortState={this.props.updateSortState}
          reorderColumns={this.props.reorderColumns}
        />
      </div>
    );
  }
}