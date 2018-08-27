import React from 'react';
import { Button, Checkbox } from '@blueprintjs/core';

export default class FilterListItem extends React.PureComponent {
  constructor(props) {
    super(props);

    this.filterOperators = FILTER_OPERATORS;
  }

  render() {
    return (
      this.renderFilterListItem()
    );
  }

  renderFilterListItem() {
    return (
      <span
        className="filter-list-item"
        id={this.props.field}
      >
        {this.renderCheckbox()}
        {this.renderFieldName()}
        {this.renderOperator()}
        {this.renderFilterValues()}
        {this.renderRemoveButton()}
      </span>
    );
  }

  renderCheckbox() {
    return (
      <Checkbox
        className="pt-large"
        checked={this.isFilterActive(this.props.model)}
        onChange={(e) => { this.props.toggleFilterManagerCheckbox(this.props.field, e.target.checked); }}
      />
    );
  }

  isFilterActive() {
    return !this.props.model.isInactive;
  }

  renderFieldName() {
    return (
      <span className="column-name">{this.props.columnDefsMap[this.props.field].headerName}</span>
    );
  }

  renderOperator() {
    const isNumericOp = (op) => {
      return op != 'contains' && op != 'notContains' && op != 'startsWith' && op != 'endsWith';
    };
    return (
      <span className="operator pt-tag pt-minimal">{this.filterOperators[this.props.model.type].prettyName}</span>
    );
  }

  renderFilterValues() {
    let filterVals = this.props.model.filter;
    if (this.props.model.type == 'inRange') {
      filterVals = this.props.model.filter + " to " + this.props.model.filterTo;
    }
    return (
      <span className="filter">{filterVals}</span>
    );
  }

  renderRemoveButton() {
    return (
      <Button
        className="pt-intent-danger remove"
        onClick={() => { this.props.removeFilter(this.props.field); }}
        iconName='minus'
      >
      </Button>
    );
  }
}

const FILTER_OPERATORS = {
  'contains': {
    symbol: '(=',
    prettyName: 'contains'
  },
  'notContains': {
    symbol: '!(=',
    prettyName: 'not contains'
  },
  'startsWith': {
    symbol: '^=',
    prettyName: 'starts with'
  },
  'endsWith': {
    symbol: '$=',
    prettyName: 'ends with'
  },
  'equals': {
    symbol: '=',
    prettyName: '='
  },
  'notEqual': {
    symbol: '!=',
    prettyName: '\u2260'
  },
  'lessThan': {
    symbol: '<',
    prettyName: '<'
  },
  'lessThanOrEqual': {
    symbol: '<=',
    prettyName: '\u2264'
  },
  'greaterThan': {
    symbol: '>',
    prettyName: '>'
  },
  'greaterThanOrEqual': {
    symbol: '>=',
    prettyName: '\u2265'
  },
  'inRange': {
    symbol: '>= && <=',
    prettyName: 'in range'
  }
};

FilterListItem.FILTER_OPERATORS = FILTER_OPERATORS;