import React from 'react';
import _ from 'lodash';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

import ColumnListItem from './ColumnListItem.jsx';

const SortableColumnListItem = SortableElement(ColumnListItem);

const SortableColumnList = SortableContainer(({ children }) =>
  <div className="column-list">
    {children}
  </div>
);

export default class ColumnList extends React.PureComponent {
  constructor(props) {
    super(props);

    _.bindAll(this, [
      'handleSortEnd',
    ]);
  }

  render() {
    let columnListItems = [];
    if (this.props.gridState && this.props.gridState.columnState) {
      columnListItems = _.map(this.props.gridState.columnState, (column, i) =>
        (<SortableColumnListItem
          index={i}
          key={column.colId}
          column={column}
          gridState={this.props.gridState}
          getAllColumns={this.props.getAllColumns}
          columnDefsMap={this.props.columnDefsMap}
          toggleColumnStateProperty={this.props.toggleColumnStateProperty}
          updateSortState={this.props.updateSortState}
        />)
      );
    }

    return (
      <SortableColumnList
        lockToContainerEdges={true}
        helperClass='dragging'
        lockAxis='y'
        onSortEnd={this.handleSortEnd}
        useDragHandle={true}
      >
        {columnListItems}
      </SortableColumnList>
    );
  }

  handleSortEnd({ oldIndex, newIndex }) {
    this.props.reorderColumns(oldIndex, newIndex);
  }
}
