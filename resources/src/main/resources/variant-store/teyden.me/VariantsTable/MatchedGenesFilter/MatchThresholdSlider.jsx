import React from 'react';
import { Button } from '@blueprintjs/core';

export default class MatchThresholdSlider extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      thresholdVal: 1
    };

    _.bindAll(this, []);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.maxMatchCount != this.props.maxMatchCount) {
      const thresholdPercent = this.state.thresholdVal / this.props.maxMatchCount;
      this.setState({
        thresholdVal: Math.max(Math.floor(thresholdPercent * nextProps.maxMatchCount), 1)
      })
    }
  }

  render() {
    return (
      <div className='match-threshold-slider'>
        <span className='title'>Minimum # phenotype matches:</span>
        <div className='slider-and-tag'>
          <input
            type='range'
            min={1}
            max={this.props.maxMatchCount}
            onChange={(e) => this.setState({ thresholdVal: e.target.value })}
            value={this.state.thresholdVal}
          />
          <span className='pt-tag pt-round'>{this.state.thresholdVal}</span>
        </div>
        <Button
          text='Apply'
          className='pt-small'
          onClick={() => this.props.applyPhenotypeMatchThreshold(this.state.thresholdVal)}
        />
      </div>
    )
  }
}
