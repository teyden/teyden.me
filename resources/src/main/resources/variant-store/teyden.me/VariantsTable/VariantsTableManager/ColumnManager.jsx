import React from 'react';
import { Button, Popover } from '@blueprintjs/core';

import ColumnList from './ColumnList.jsx';

export default class ColumnManager extends React.PureComponent {
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
        popoverClassName="column-manager-popover pt-popover-content-sizing"
        lazy={true}
      >
        {this.renderPopoverTrigger()}
        {this.renderPopoverContent()}
      </Popover>
    );
  }

  renderPopoverTrigger() {
    return (<Button
      text="Manage columns"
    />);
  }

  renderPopoverContent() {
    return (
      <div>
        <div className="popover-content-header">
          {this.renderResetButton()}
        </div>
        <div className="popover-content-body">
          {this.renderColumnList()}
        </div>
      </div>
    );
  }

  renderJumpToColumnInput() {
    return (
      <input
        className="jump-to-column pt-input default"
        type="text"
        placeholder="Jump to column"
        dir="auto"
        onInput={this.handleFilterInput}
      />
    );
  }

  renderResetButton() {
    return (<Button
      className={'reset pt-intent-warning'}
      text={'Reset'}
      iconName={'pt-icon-refresh'}
      onClick={() => { this.props.resetColumnManager(); }}
    />);
  }

  renderColumnList() {
    return (
      <ColumnList
        gridState={this.props.gridState}
        getAllColumns={this.props.getAllColumns}
        columnDefsMap={this.props.columnDefsMap}
        toggleColumnStateProperty={this.props.toggleColumnStateProperty}
        updateSortState={this.props.updateSortState}
        reorderColumns={this.props.reorderColumns}
      />
    );
  }
}