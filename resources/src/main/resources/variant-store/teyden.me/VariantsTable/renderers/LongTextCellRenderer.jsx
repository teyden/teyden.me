import React from 'react';
import { Popover, Button } from '@blueprintjs/core';

import PopoverDetailCellRenderer from './PopoverDetailCellRenderer.jsx';

export default class LongTextCellRenderer extends PopoverDetailCellRenderer {
  constructor(props) {
    super(props);

    _.bindAll(this, [
      'renderPopoverContent',
      'renderCellContent',
      'isPopoverAvailable',
    ]);
  }

  renderCellContent() {
    return <span>{this.props.value}</span>;
  }

  renderPopoverContent() {
    return <span>{this.props.value}</span>;
  }

  isPopoverAvailable() {
    return this.props.value && this.props.value.length > 0;
  }
}
