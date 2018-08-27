import React from 'react';
import _ from 'lodash';
import { Button, Popover } from '@blueprintjs/core';

import FilterList from './FilterList.jsx';

export default class FilterManager extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      this.renderPopover()
    );
  }

  renderPopover() {
    const tetherOptions = {
      constraints: [{
        attachment: 'together',
        pin: true,
        to: 'window'
      }]
    };

    return (
        <Popover
          tetherOptions={tetherOptions}
          popoverClassName="filter-manager-popover pt-popover-content-sizing"
          lazy={true}
        >
          {this.renderPopoverTrigger()}
          {this.renderPopoverContent()}
        </Popover>
    );
  }

  renderPopoverTrigger() {
    return (<Button
      text="Manage filters"
    />);
  }

  renderPopoverContent() {
    return (
      <div>
        <div className="popover-content-header">
          {this.renderResetButton()}
        </div>
        <div className="popover-content-body">
          {this.renderFilterList()}
        </div>
      </div>
    );
  }

  renderResetButton() {
    const isEmpty = () => {
      return _.size(this.props.gridState.filterState) == 0 && _.size(this.props.inactiveFilters) == 0;
    };
    if (!isEmpty()) {
      return (<Button
        className={'reset pt-intent-warning'}
        text={'Reset'}
        iconName={'pt-icon-refresh'}
        onClick={() => { this.props.resetFilterManager(); }}
      />);
    }
  }

  renderFilterList() {
    return (
      <FilterList
        gridState={this.props.gridState}
        inactiveFilters={this.props.inactiveFilters}
        getAllColumns={this.props.getAllColumns}
        columnDefsMap={this.props.columnDefsMap}
        toggleFilterManagerCheckbox={this.props.toggleFilterManagerCheckbox}
        removeFilter={this.props.removeFilter}
      />
    );
  }
}