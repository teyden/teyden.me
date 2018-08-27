import React from 'react';
import { Button } from '@blueprintjs/core';

import IncludedPhenotype from './IncludedPhenotype.jsx';
import ListSelectionControls from './ListSelectionControls.jsx';

export default class IncludedPhenotypesList extends React.PureComponent {
  constructor(props) {
    super(props);

    _.bindAll(this, []);
  }

  render() {
    const displayedPhenotypes = _.filter(_.values(this.props.phenotypes), (phenotype) => { 
      return phenotype.isDisplayed && !phenotype.isNegated;
    });
    let totalCount = 0, enabledCount = 0;
    const includedPhenotypes = _.map(displayedPhenotypes, (phenotype) => {
      totalCount++;
      phenotype.isDisabled || enabledCount++;
      
      return (
        <IncludedPhenotype
          key={phenotype.termId}
          togglePhenotypeDisabled={this.props.togglePhenotypeDisabled}
          {...phenotype}
        />
      );
    });


    return (
      <div className='included-phenotypes-list'>
        <h6>Phenotypes to include in match:</h6>
        <ListSelectionControls
          title='Include'
          getSummaryText={_.template('<%= selectedCount %> / <%= totalCount %> included')}
          selectAll={() => this.props.toggleAllPhenotypesDisabled(false)}
          selectNone={() => this.props.toggleAllPhenotypesDisabled(true)}
          selectedCount={enabledCount}
          totalCount={totalCount}
          enabledButtons={{
            all: true,
            none: true
          }}
        />
        <div className='list'>
          {includedPhenotypes}
        </div>
      </div>
    )
  }
}
