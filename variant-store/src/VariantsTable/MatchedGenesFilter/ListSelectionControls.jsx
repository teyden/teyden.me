import React from 'react';
import { Button } from '@blueprintjs/core';

export default class ListSelectionControls extends React.PureComponent {
  constructor(props) {
    super(props);

    _.bindAll(this, []);
  }

  render() {
    return (
      <div className='selection-controls'>
        <span className='title'>{this.props.title}:</span>
        {this.props.enabledButtons.all && <Button
          text='All'
          className='pt-small'
          onClick={this.props.selectAll}
        />}
        {this.props.enabledButtons.none && <Button
          text='None'
          className='pt-small'
          onClick={this.props.selectNone}
        />}
        <span className='summary'>
          {this.props.getSummaryText({ selectedCount: this.props.selectedCount, totalCount: this.props.totalCount })}
        </span>
      </div>
    )
  }
}
