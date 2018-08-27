import React from 'react';
import { Popover, Button } from '@blueprintjs/core';

import PopoverDetailCellRenderer from './PopoverDetailCellRenderer.jsx';
import { generatePatientRecordUrl, getCallsetIdParts } from './../../VariantsUtils.jsx';

export default class PatientsCountCellRenderer extends PopoverDetailCellRenderer {
  constructor(props) {
    super(props);

    this.groupedCallsets = _.groupBy(props.value, (callsetId) => {
      return getCallsetIdParts(callsetId).patientId;
    });
    this.patientsCount = _.keys(this.groupedCallsets).length;

    _.bindAll(this, [
      'renderPopoverContent',
      'renderCellContent',
    ]);
  }

  renderCellContent() {
    return <span>{this.patientsCount}</span>;
  }

  renderPopoverContent() {
    let listItems = [];
    _.forEach(this.groupedCallsets, (callsetIds, patientId) => {
      let sublistItems = [];

      _.forEach(callsetIds, (callsetId) => {
        let link = <a href={generatePatientRecordUrl(patientId, callsetId)}>{callsetId}</a>;
        sublistItems.push(<li key={callsetId}>{link}</li>);
      });

      listItems.push(<li key={patientId}>
        <a href={generatePatientRecordUrl(patientId)}>{patientId}</a>
        <ul>
          {sublistItems}
        </ul>
      </li>);
    });

    return (<ul>{listItems}</ul>);
  }

  isPopoverAvailable() {
    return this.patientsCount > 0;
  }
}
