import React from 'react';
import { Popover, Button } from '@blueprintjs/core';

import PopoverDetailCellRenderer from './PopoverDetailCellRenderer.jsx';

export default class ObjectCountCellRenderer extends PopoverDetailCellRenderer {
  constructor(props) {
    super(props);

    this.entriesCount = (this.props.value && this.props.value.length) || 0;

    _.bindAll(this, [
      'renderPopoverContent',
      'renderCellContent',
      'isPopoverAvailable',
    ]);
  }

  renderCellContent() {
    if (this.entriesCount) {
      return <span>{this.entriesCount} {this.entriesCount == 1 ? 'entry' : 'entries'}</span>;
    } else {
      return null;
    }
  }

  renderPopoverContent() {
    let rows = [];
    let i = 0;
    _.forEach(this.props.value, (entry) => {
      rows.push(<tr key={'entry' + i}><th colSpan={2}>Entry {++i}</th></tr>);

      _.forEach(entry, (val, key) => {
        rows.push(<tr key={key + i}><th className="right">{key}</th><td>{val}</td></tr>);
      });
    });

    return (<table className="variant-table-object-popover"><tbody>{rows}</tbody></table>);
  }

  isPopoverAvailable() {
    return this.entriesCount > 0;
  }
}
