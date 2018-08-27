import React from 'react';
import _ from 'lodash';

export default class TableSummary extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <span>
        {this.renderNumberColumnsVisible()}, {this.renderNumberActiveFilters()}, {this.renderNumberColumnsSorted()}
      </span>
    );
  }

  renderNumberColumnsVisible() {
    let total = this.props.totalColumnsCount;
    let numColsVisible = this.props.visibleColumnsCount;

    return (
      <span>{numColsVisible + "/" + total + " columns visible"}</span>
    );
  }

  renderNumberActiveFilters() {
    let total = this.props.activeFiltersCount;
    return (
      <span>{total + " active " + (total === 1 ? "filter" : "filters")}</span>
    );
  }

  renderNumberColumnsSorted() {
    let total = this.props.sortedColumnsCount;
    return (
      <span>{total + (total === 1 ? " column" : " columns") + " sorted"}</span>
    );
  }
}