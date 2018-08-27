import React from 'react';
import classNames from 'classnames';
import request from 'superagent';

import { Popover, Position, Button, PopoverInteractionKind } from '@blueprintjs/core';

export default class GeneMatch extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      geneInfo: null,
      isFetchingPopoverContent: false,
      fetchPopoverContentReq: null,
      isPopoverOpen: false
    };

    _.bindAll(this, [
      'renderPopoverContent',
      'renderPopoverSectionValues',
      'fetchPopoverContent',
      'renderPopoverXrefButtons',
      'getPopoverXrefUrl',
    ]);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.phenotypeCount != nextProps.phenotypeCount) {
      return true;
    }
    if (this.props.isFiltered != nextProps.isFiltered) {
      return true;
    }
    if (this.state.geneInfo != nextState.geneInfo) {
      return true;
    }
    if (this.state.isPopoverOpen != nextState.isPopoverOpen) {
      return true;
    }
    return false;
  }

  render() {
    const tetherOptions = {
      constraints: [{
        attachment: 'together',
        pin: true,
        to: 'window',
      }]
    };

    return (
      <div className='gene'>
        <Button
          iconName='filter'
          className={classNames({
            'filter': true,
            'enabled': this.props.isFiltered
          })}
          onClick={this.props.toggleIsFiltered}
        />
        <span className='name'>{this.props.label}</span>
        <Popover
          popoverClassName='pt-popover-content-sizing'
          popoverWillOpen={() => {
            if (!this.state.geneInfo) {
              this.fetchPopoverContent();
            }
          }}
          tetherOptions={tetherOptions}
          lazy={true}
          position={Position.LEFT}
          isOpen={this.state.isPopoverOpen}
          onInteraction={(nextOpenState) => { this.setState({ isPopoverOpen: nextOpenState }); }}
          interactionKind={PopoverInteractionKind.CLICK}
        >
          <Button
            iconName='info-sign'
            className='info pt-minimal'
          />
          {this.state.isPopoverOpen && this.renderPopoverContent()}
        </Popover>
        <span className='pt-tag pt-round'>{this.props.phenotypeCount}</span>
      </div>
    );
  }

  renderPopoverContent() {
    if (this.state.geneInfo) {
      return (
        <div className='gene-match-popover'>
          <a className='hgnc-link' href="http://www.genenames.org/">HUGO Gene Nomenclature Committee's GeneNames (HGNC)</a>
          <div className='header'>
            <span className='gene-symbol'>{this.state.geneInfo.symbol}</span>
            <span className='gene-desc'>{this.state.geneInfo.name}</span>
          </div>
          <div className='matched-phenotypes'>
            <span className='title'>Matched phenotypes</span>
            {this.renderPopoverSectionValues(this.props.matchedPhenotypes, (termId) => {
              const termName = this.props.allPhenotypes[termId].label;
              return <span className='value pt-tag pt-minimal' key={termId}>{termName}</span>;
            })}
          </div>
          <div className='aliases'>
            <span className='title'>Aliases</span>
            {this.renderPopoverSectionValues(this.state.geneInfo.alias_symbol)}
          </div>
          <div className='prev-symbols'>
            <span className='title'>Previous symbols</span>
            {this.renderPopoverSectionValues(this.state.geneInfo.prev_symbol)}
          </div>
          <div className='gene-family'>
            <span className='title'>Gene family</span>
            {this.renderPopoverSectionValues(this.state.geneInfo.gene_family)}
          </div>
          <div className='xref-buttons'>
            {this.renderPopoverXrefButtons('OMIM', this.state.geneInfo.omim_id)}
            {this.renderPopoverXrefButtons('Entrez', this.state.geneInfo.entrez_id)}
            {this.renderPopoverXrefButtons('RefSeq', this.state.geneInfo.refseq_accession)}
            {this.renderPopoverXrefButtons('Ensembl', this.state.geneInfo.ensembl_gene_id)}
          </div>
        </div>
      );
    } else {
      return <p>Loading...</p>;
    }

  }

  renderPopoverSectionValues(values, renderer) {
    const defaultRenderer = (val) => <span className='value pt-tag pt-minimal' key={val}>{val}</span>;

    if (values && values.length) {
      return _.map(values, renderer || defaultRenderer)
    } else {
      return <span className='value empty'>(none)</span>;
    }
  }

  renderPopoverXrefButtons(label, ids) {
    return _.map(ids, (id) =>
      <a 
        href={this.getPopoverXrefUrl(label, id)}
        key={label + id}
        className='pt-button pt-intent-primary pt-small'
        role='button'
        target='_blank'
      >{label + ': ' + id}</a>);
  }

  getPopoverXrefUrl(label, id) {
    const labelToTemplate = {
      'omim': 'https://www.omim.org/entry/{}',
      'entrez': 'https://www.ncbi.nlm.nih.gov/gene/?term={}',
      'refseq': 'https://www.ncbi.nlm.nih.gov/nuccore/{}',
      'ensembl': 'http://useast.ensembl.org/Homo_sapiens/Gene/Compara_Tree?g={}',
    }

    return labelToTemplate[label.toLowerCase()].replace('{}', id);
  }

  fetchPopoverContent() {
    let req = request
      .get(XWiki.contextPath + '/rest/vocabularies/hgnc/' + this.props.label)
      .send('id=' + this.props.label);

    if (this.state.isFetchingPopoverContent) {
      this.state.fetchPopoverContentReq.abort();
    }

    this.setState({
      isFetchingPopoverContent: true,
      fetchPopoverContentReq: req,
    });

    req.end((err, res) => {
      this.setState({
        isFetchingPopoverContent: false,
        fetchPopoverContentReq: null,
        geneInfo: res.body || null
      });
    });
  }
}
