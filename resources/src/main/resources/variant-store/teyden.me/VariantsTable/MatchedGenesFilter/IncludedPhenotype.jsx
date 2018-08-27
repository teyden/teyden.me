import React from 'react';
import classNames from 'classnames';

export default class IncludedPhenotype extends React.PureComponent {
  constructor(props) {
    super(props);

    _.bindAll(this, []);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.isNegated != nextProps.isNegated) {
      return true;
    }
    if (this.props.isDisabled != nextProps.isDisabled) {
      return true;
    }
    return false;
  }

  render() {
    const classNamesObj = {
      'phenotype': true,
      'negated': this.props.isNegated,
      'disabled': this.props.isDisabled
    };

    return (
      <span 
        className={classNames(classNamesObj)}
        onClick={(event) => this.props.togglePhenotypeDisabled(this.props.termId)}
      >
        {(this.props.isNegated ? 'NO ' : '') + this.props.label}
      </span>
    );
  }
}
