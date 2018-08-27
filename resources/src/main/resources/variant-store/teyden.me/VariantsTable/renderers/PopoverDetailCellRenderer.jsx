import React from 'react';
import { Popover, Button } from '@blueprintjs/core';

export default class PopoverDetailCellRenderer extends React.Component {
  constructor(props) {
    super(props);

    _.bindAll(this, [
      'renderPopover',
      'renderPopoverTrigger',
    ]);
  }

  render() {
    return (<div className="count popover-cell">
      {this.renderCellContent()}
      {this.renderPopover()}
    </div>);
  }

  renderCellContent() {
    return null;
  }

  /**
   * A cell renderer only renders once.
   */
  shouldComponentUpdate() {
    return false;
  }

  renderPopover() {
    const tetherOptions = {
      constraints: [{
        attachment: 'together',
        pin: true,
        to: 'window',
      }]
    };
    
    return this.isPopoverAvailable() && (<Popover 
        tetherOptions={tetherOptions} 
        popoverClassName="pt-popover-content-sizing variants-table-detail" 
        lazy={true}
      >
        {this.renderPopoverTrigger()}
        {this.renderPopoverContent()}
      </Popover>);
  }

  isPopoverAvailable() {
    return true;
  }

  renderPopoverTrigger() {
    return (<Button
      iconName="more"
    />);
  }

  renderPopoverContent() {
    return null;
  }
}
