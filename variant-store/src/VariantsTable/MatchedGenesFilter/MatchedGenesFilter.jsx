import React from 'react';
import update from 'immutability-helper';
import request from 'superagent';

import IncludedPhenotypesList from './IncludedPhenotypesList.jsx';
import GeneMatchesList from './GeneMatchesList.jsx';
import MatchThresholdSlider from './MatchThresholdSlider.jsx';
import { FILTER_OR_SEPARATOR } from '../../VariantsUtils.jsx';

export default class MatchedGenesFilter extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      phenotypes: {},
      genes: [],
      isFetchingGenes: false,
      fetchGenesReq: null,
    }

    _.bindAll(this, [
      'updatePhenotypes',
      'togglePhenotypeDisabled',
      'toggleAllPhenotypesDisabled',
      'fetchMatchedGenes',
      'fetchMatchedGenesResponseHandler',
      'toggleGeneIsFiltered',
      'getCurrFilteredGenes',
      'isGeneFiltered',
      'unfilterAllGenes',
      'applyPhenotypeMatchThreshold',
    ]);

    document.observe('phenotips:phenotypeChanged', this.updatePhenotypes);    
  }

  render() {
    let maxPhenotypeMatchCount = (this.state.genes && this.state.genes.length && this.state.genes[0].terms.length) || 1;

    return (
      <div className='pt-callout matched-genes-filter'>
        <h5>Filter by matched genes&nbsp;<span className="fa fa-question-circle  xHelpButton" title="Genes that are associated with this patient's phenotypes according to the HPO" /></h5>
        <MatchThresholdSlider
          maxMatchCount={maxPhenotypeMatchCount}
          applyPhenotypeMatchThreshold={this.applyPhenotypeMatchThreshold}
        />
        <IncludedPhenotypesList 
          phenotypes={this.state.phenotypes} 
          togglePhenotypeDisabled={this.togglePhenotypeDisabled}
          toggleAllPhenotypesDisabled={this.toggleAllPhenotypesDisabled}
        />
        <span className='pt-icon-large pt-icon-arrow-right arrow-icon' />
        <GeneMatchesList 
          genes={this.state.genes}
          isLoading={this.state.isFetchingGenes}
          fetchMatchedGenes={this.fetchMatchedGenes}
          toggleGeneIsFiltered={this.toggleGeneIsFiltered}
          filterState={this.props.filterState}
          isGeneFiltered={this.isGeneFiltered}
          getCurrFilteredGenes={this.getCurrFilteredGenes}
          allPhenotypes={this.state.phenotypes}
          unfilterAllGenes={this.unfilterAllGenes}
        />
      </div>
    );
  }

  updatePhenotypes(event) {
    let phenotypesState = _.mapValues(event.memo.phenotype.all, (phenotype, key) => {
      return {
        termId: phenotype.key,
        label: phenotype.text,
        isNegated: phenotype.type == 'not_symptom',
        isDisplayed: event.memo.phenotype.displayed[key]
      };
    });

    _.forEach(phenotypesState, (phenotype, key) => {
      const existingPhenotype = this.state.phenotypes[key];
      if (existingPhenotype) {
        phenotype.isDisabled = existingPhenotype.isDisabled;
      }
    });
    
    this.setState({
      phenotypes: phenotypesState,
      genes: null /* invalidate the fetched genes */
    })
  }

  togglePhenotypeDisabled(termId, isDisabled) {
    this.setState((state) => {
      return update(state, _.set({}, 'phenotypes.' + termId + '.isDisabled', { $apply: (isDisabled) => !isDisabled }));
    }, this.fetchMatchedGenes);
  }

  toggleAllPhenotypesDisabled(disabled) {
    this.setState((state) => {
      let newPhenotypes = {}, numChanged = 0;
      _.forEach(this.state.phenotypes, (phenotype, key) => {
        if (phenotype.isDisplayed && phenotype.isDisabled != disabled) {
          let newPhenotype = _.clone(phenotype);
          newPhenotype.isDisabled = disabled;
          newPhenotypes[key] = newPhenotype;
          numChanged++;
        } else {
          newPhenotypes[key] = phenotype;
        }
      });

      if (numChanged) {
        return update(state, { phenotypes: { $set: newPhenotypes } });
      } else {
        return state;
      }
    }, this.fetchMatchedGenes);
  }

  fetchMatchedGenes() {
    let presentTermIds = [];
    _.each(this.state.phenotypes, (phenotype) => {
      !phenotype.isDisabled && phenotype.isDisplayed && presentTermIds.push(phenotype.termId);
    });

    let req = request
      .post(XWiki.contextPath + '/rest/suggested-gene-panels/summary')
      .type('form')
      .send({ 'present-term': presentTermIds });

    if (this.state.isFetchingGenes) {
      this.state.fetchGenesReq.abort();
    }
    
    this.setState({
      isFetchingGenes: true,
      fetchGenesReq: req
    });

    req.end(this.fetchMatchedGenesResponseHandler);
  }

  fetchMatchedGenesResponseHandler(err, res) {
    this.setState({
      isFetchingGenes: false,
      fetchGenesReq: null,
      genes: (res.body && res.body.genes) || []
    });
  }

  getCurrFilteredGenes() {
    return (this.props.filterState.gene &&
      this.props.filterState.gene.filter &&
      this.props.filterState.gene.filter.split(FILTER_OR_SEPARATOR)) || [];
  }

  isGeneFiltered(geneSymbol) {
    return this.getCurrFilteredGenes().indexOf(geneSymbol) !== -1;
  }

  toggleGeneIsFiltered(geneSymbol, isFiltered) {
    if (isFiltered) {
      this.props.addFilterOrClause('gene', geneSymbol);
    } else {
      this.props.removeFilterOrClause('gene', geneSymbol);
    }
  }

  applyPhenotypeMatchThreshold(val) {
    const thresholdMatches = _.map(_.filter(this.state.genes, (gene) => gene.terms.length >= val), 'gene_symbol');
    const allGenes = _.map(this.state.genes, 'gene_symbol');
    this.props.removeThenAddFilterOrClause('gene', allGenes, thresholdMatches);
  }

  unfilterAllGenes() {
    this.props.removeFilterOrClause('gene', _.map(this.state.genes, 'gene_symbol'));
  }
}
