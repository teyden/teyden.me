import React from 'react';
import { Popover, Button } from '@blueprintjs/core';

import PopoverDetailCellRenderer from './PopoverDetailCellRenderer.jsx';
import { getCallsetIdParts } from './../../VariantsUtils.jsx';

export default class DynamicFieldCellRenderer extends PopoverDetailCellRenderer {
  constructor(props) {
    super(props);

    // Check if we are rendering for a single patient. If yes, ignore values for other patients.
    const callsetIdsCol = this.props.columnApi.getColumn('callset_ids');
    if (callsetIdsCol && callsetIdsCol.colDef.patientId) {
      this.patientId = callsetIdsCol.colDef.patientId;
    }
  
    this.entries = {};
    this.entriesCount = 0;
    if (props.data && props.data.callset_ids) {
      _.forEach(props.data.callset_ids, (callsetId) => {
        if (!this.patientId || getCallsetIdParts(callsetId).patientId == this.patientId) {
          let key = callsetId + '__' + this.getDynamicFieldName();
          let val = props.data[key]
          if (val) {
            this.entries[key] = val;
          }
        }
      });

      this.entriesCount = _.keys(this.entries).length;
    }

    _.bindAll(this, [
      'renderPopoverContent',
      'renderCellContent',
      'isPopoverAvailable',
      'getDynamicFieldName',
    ]);
  }

  renderCellContent() {
    if (this.entriesCount > 1) {
      return <span>{this.entriesCount} {this.entriesCount == 1 ? 'entry' : 'entries'}</span>;
    } else if (this.entriesCount == 1) {
      return <span>{_.values(this.entries)[0]}</span>;
    } else {
      return null;
    }
  }

  renderPopoverContent() {
    let rows = [];
    let i = 0;
    _.forEach(this.entries, (val, callsetId) => {
      rows.push(<tr key={callsetId}><th>{callsetId}</th><td>{val}</td></tr>);
    });

    return (<table className="variant-table-object-popover"><tbody>{rows}</tbody></table>);
  }

  isPopoverAvailable() {
    return this.entriesCount > 1;
  }

  getDynamicFieldName() {
    return this.props.colDef.field;
  }
}
