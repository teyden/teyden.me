import React from 'react';
import { Popover, Button } from '@blueprintjs/core';

import PopoverDetailCellRenderer from './PopoverDetailCellRenderer.jsx';

export default class ClinVarCellRenderer extends PopoverDetailCellRenderer {
  constructor(props) {
    super(props);

    this.entriesCount = this.props.value && 
      this.props.value.length &&
      this.props.value[0] &&
      this.props.value[0].CLINSIG && 
      this.props.value[0].CLINSIG.length;
    this.entriesCount = this.entriesCount || 0;

    _.bindAll(this, [
      'renderPopoverContent',
      'renderCellContent',
      'isPopoverAvailable',
    ]);
  }

  renderCellContent() {
    if (this.entriesCount) {
      return <span>{this.entriesCount} {this.entriesCount == 1 ? 'entry' : 'entries'}</span>;
    }
  }

  renderPopoverContent() {
    if (!this.entriesCount) {
      return;
    }
    
    let entries = this.props.value[0];
    let rows = [];

    let header = (<thead><tr>
        <th key="SIG">SIG</th>
        <th key="DBN">DBN</th>
        <th key="REVSTAT">REVSTAT</th>
        <th key="ACC">ACC</th>
        <th key="DSDB">DSDB</th>
        <th key="DSDBID">DSDBID</th>
      </tr></thead>);

    for (let i = 0; i < this.entriesCount; i++) {
      rows.push(<tr key={i}>
          <td key={'SIG' + i}>{(entries.CLINSIG || [])[i]}</td>
          <td key={'DBN' + i}>{(entries.CLNDBN || [])[i]}</td>
          <td key={'REVSTAT' + i}>{(entries.CLNREVSTAT || [])[i]}</td>
          <td key={'ACC' + i}>{(entries.CLNACC || [])[i]}</td>
          <td key={'DSDB' + i}>{(entries.CLNDSDB || [])[i]}</td>
          <td key={'DSDBID' + i}>{(entries.CLNDSDBID || [])[i]}</td>
        </tr>);
    }

    return (<table className="variant-table-object-popover">{header}<tbody>{rows}</tbody></table>);
  }

  isPopoverAvailable() {
    return this.entriesCount > 0;
  }
}
