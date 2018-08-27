import React from 'react';
import _ from 'lodash';
import { Button, RadioGroup, Radio } from '@blueprintjs/core';
import { SortableHandle } from 'react-sortable-hoc';

const DragHandle = SortableHandle(() => <span
  className="column-modifier pt-icon-large pt-icon-drag-handle-vertical drag-handle"
/>);

export default class ColumnListItem extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      radioValue: ""
    }

    /** Column properties that undergo change **/
    const PINNED = 'pinned';
    const HIDE = 'hide';
    const SORT = 'sort'

    this.PINNED = PINNED;
    this.HIDE = HIDE;
    this.SORT = SORT;
  }

  render() {
    return (
      this.renderColumnListItem()
    );
  }

  renderColumnListItem() {
    return (
      <span
        className="column-list-item"
      >
        {this.renderOrderingOption()}
        {this.renderPinningOption()}
        {this.renderHidingOption()}
        {this.renderColumnListItemText()}
        {this.renderSortingOption()}
      </span>
    );
  }

  renderOrderingOption() {
    return <DragHandle />;
  }

  renderPinningOption() {
    return (
      <Button
        className={'column-modifier ' + (this.props.column.pinned ? this.PINNED + ' pt-active' : '')}
        iconName={'pt-icon-pin'}
        key={this.props.column.colId + this.PINNED}
        onClick={() => { this.props.toggleColumnStateProperty(this.props.column, this.PINNED); }}/>
    );
  }

  renderHidingOption() {
    return (
      <Button
        className={'column-modifier ' + (this.props.column.hide ? this.HIDE + ' pt-active' : '')}
        iconName={'pt-icon-eye-off'}
        key={this.props.column.colId + this.HIDE}
        onClick={() => { this.props.toggleColumnStateProperty(this.props.column, this.HIDE); }}/>
    );
  }

  renderColumnListItemText() {
    return (
      <span className="text">
        {this.props.columnDefsMap[this.props.column.colId].headerName}
      </span>
    );
  }

  renderSortingOption() {
    return (
      <RadioGroup
        className={this.SORT}
        disabled={this.props.columnDefsMap[this.props.column.colId].suppressSorting ? true : false}
        onChange={(e) => this.props.updateSortState(this.props.column, e.target.value)}
        selectedValue={this.getSelectedValue(this.props.column, this.state.radioValue)}
      >
        {this.renderSortOrder()}
        <Radio className="pt-align-right" value="off">
          <span className="pt-icon-large pt-icon-double-caret-vertical" />
        </Radio>
        <Radio className="pt-align-right" value="desc">
          <span className="pt-icon-large pt-icon-caret-down" />
        </Radio>
        <Radio className="pt-align-right" value="asc">
          <span className="pt-icon-large pt-icon-caret-up" />
        </Radio>
      </RadioGroup>
    );
  }

  renderSortOrder() {
    let sortOrder = this.getSortOrder();
    return (
      <span
        key={this.props.column.colId + 'sort-order'}
        className={'sort-order' + (sortOrder ?  ' column-modifier pt-tag pt-minimal' : '')}>
        {sortOrder}
      </span>
    );

  }

  getSortOrder() {
    for (let i = 0; i < this.props.gridState.sortState.length; i++) {
      if (this.props.gridState.sortState[i].colId == this.props.column.colId) {
        return i+1;
      }
    }
  }


  getSelectedValue() {
    // TODO: Improve responsiveness of radio button selection. Can you change the button status *before* the state update?
    let sort = "off";
    if (!this.props.columnDefsMap[this.props.column.colId].suppressSorting) {
      for (let col of this.props.gridState.sortState) {
        if (col.colId == this.props.column.colId) {
          sort = col.sort;
          break;
        }
      }
    }
    return sort;
  }
}