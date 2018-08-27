import React from 'react';
import { Popover, Button } from '@blueprintjs/core';

import PopoverDetailCellRenderer from './PopoverDetailCellRenderer.jsx';
import { getCallsetIdParts } from './../../VariantsUtils.jsx';

export default class PatientsCountCellRenderer extends PopoverDetailCellRenderer {
  constructor(props) {
    super(props);

    this.patientsCallsetsCount = (this.props.data && this.props.colDef && this.props.colDef.patientId
      && this.props.data[this.props.colDef.patientId + '__callset_id_count']) || 0;

    _.bindAll(this, [
      'renderPopoverContent',
      'renderCellContent',
    ]);
  }

  renderCellContent() {
    return <span>{this.patientsCallsetsCount}</span>;
  }

  renderPopoverContent() {
    let listItems = [];
    _.forEach(this.props.value, (callsetId) => {
      const parts = getCallsetIdParts(callsetId);
      if (parts.patientId == this.props.colDef.patientId) {
        listItems.push(<li key={callsetId}>{callsetId}</li>);
      }
    });

    return (<ul>{listItems}</ul>);
  }

  isPopoverAvailable() {
    return this.patientsCallsetsCount > 0;
  }
}
