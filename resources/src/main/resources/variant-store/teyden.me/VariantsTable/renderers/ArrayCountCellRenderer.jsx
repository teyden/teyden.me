import React from 'react';

import ArrayCellRenderer from './ArrayCellRenderer.jsx';

export default class ArrayCountCellRenderer extends ArrayCellRenderer {
  constructor(props) {
    super(props);

    this.valuesCount = (this.props.value && this.props.value.length) || 0;

    _.bindAll(this, [
      'renderCellContent',
      'isPopoverAvailable',
    ]);
  }

  renderCellContent() {
    if (this.valuesCount) {
      return <span>{this.valuesCount} {this.valuesCount == 1 ? 'value' : 'values'}</span>;
    } else {
      return null;
    }
  }

  isPopoverAvailable() {
    return this.valuesCount > 0;
  }
}
