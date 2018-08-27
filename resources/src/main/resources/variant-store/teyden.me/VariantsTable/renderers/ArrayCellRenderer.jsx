import React from 'react';
import { Popover, Button } from '@blueprintjs/core';

import PopoverDetailCellRenderer from './PopoverDetailCellRenderer.jsx';

export default class ArrayCellRenderer extends PopoverDetailCellRenderer {
  constructor(props) {
    super(props);

    _.bindAll(this, [
      'renderPopoverContent',
      'renderCellContent',
      'isPopoverAvailable',
    ]);
  }

  renderCellContent() {
    return <span>{this.props.value && this.props.value.length && this.props.value.join(', ')}</span>;
  }

  renderPopoverContent() {
    let items = _.map(this.props.value, (value, idx) => {
      return (<span key={idx} className="pt-tag pt-minimal">{value}</span>);
    });
    return <div>{items}</div>;
  }

  isPopoverAvailable() {
    return this.props.value && this.props.value.length > 1;
  }
}
