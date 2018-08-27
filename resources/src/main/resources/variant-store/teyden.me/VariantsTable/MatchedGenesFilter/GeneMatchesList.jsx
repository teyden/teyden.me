import React from 'react';
import { NonIdealState, Spinner, Button, Intent } from '@blueprintjs/core';
import {
  Masonry, 
  CellMeasurer,
  CellMeasurerCache,
  createMasonryCellPositioner,
  AutoSizer
} from 'react-virtualized';

import GeneMatch from './GeneMatch.jsx';
import ListSelectionControls from './ListSelectionControls.jsx';

export default class GeneMatchesList extends React.PureComponent {
  constructor(props) {
    super(props);

    this.columnCount = 0;

    _.bindAll(this, [
      'renderListContent',
      'initMasonryUtils',
      'onResize',
      'renderMasonry',
      'renderGeneCell',
      'calculateColumnCount',
      'resetCellPositioner',
    ]);
  }

  shouldComponentUpdate(prevProps, prevState) {
    if (prevProps.genes !== this.props.genes) {
      return true;
    }
    if (prevProps.filterState !== this.props.filterState) {
      return true;
    }
    if (prevProps.isLoading !== this.props.isLoading) {
      return true;
    }

    return false;
  }

  componentWillUpdate(nextProps, nextState) {
  }

  render() {
    let listContent, numFiltered = 0;
    if (this.props.isLoading) {
      listContent = <Spinner />;
    } else if (this.props.genes === null) {
      listContent = (<Button
        className='load'
        text='Load matches'
        iconName='changes'
        intent={Intent.PRIMARY}
        onClick={this.props.fetchMatchedGenes}
      />);
    } else if (this.props.genes.length) {
      listContent = this.renderListContent();
      numFiltered = _.intersection(this.props.getCurrFilteredGenes(), _.map(this.props.genes, 'gene_symbol')).length;
    } else {
      listContent = null;
    }

    return (
      <div className='gene-matches-list'>
        <h6>Gene matches:</h6>
        <ListSelectionControls
          title='Filter'
          getSummaryText={_.template('filtering on <%= selectedCount %> / <%= totalCount %>')}
          selectNone={this.props.unfilterAllGenes}
          selectedCount={numFiltered}
          totalCount={(this.props.genes && this.props.genes.length) || 0}
          enabledButtons={{
            all: false,
            none: true
          }}
        />
        <div className='list'>
          {listContent}
        </div>
      </div>
    )
  }

  renderListContent() {
    return (
      <AutoSizer
        disableHeight
        onResize={this.onResize}
        filterState={this.props.filterState} /* This is only used to trigger a re-render in case the gene list changes */
        genes={this.props.genes}
      >
        {this.renderMasonry}
      </AutoSizer>
    );
  }

  onResize({ width }) {
    this.width = width;

    this.calculateColumnCount();
    this.resetCellPositioner();
    this.masonry.recomputeCellPositions();
  }

  initMasonryUtils() {
    this.cache = new CellMeasurerCache({
      defaultHeight: GeneMatchesList.GENE_MATCH_HEIGHT_PX,
      defaultWidth: GeneMatchesList.GENE_MATCH_WIDTH_PX,
      fixedWidth: true
    });
    this.cellPositioner = createMasonryCellPositioner({
      cellMeasurerCache: this.cache,
      columnCount: this.columnCount,
      columnWidth: GeneMatchesList.GENE_MATCH_WIDTH_PX,
      spacer: GeneMatchesList.GENE_MATCH_GUTTER_WIDTH_PX
    });
  }

  renderMasonry({ width }) {
    this.width = width;
    
    if (!this.masonry) { // Masonry is not currently mounted
      this.initMasonryUtils();
    }

    this.calculateColumnCount();

    return (<Masonry
        cellCount={this.props.genes.length}
        cellMeasurerCache={this.cache}
        cellPositioner={this.cellPositioner}
        cellRenderer={this.renderGeneCell}
        height={GeneMatchesList.CONTAINER_HEIGHT_PX}
        width={width}
        overscanByPixels={0}
        ref={(ref) => { this.masonry = ref; }}
        style={{
          padding: '5px',
        }}
        filterState={this.props.filterState} /* This is only used to trigger a re-render in case the gene list changes */
        genes={this.props.genes}
      />);
  }

  renderGeneCell({ index, key, parent, style }) {
    const gene = this.props.genes[index];
    const isFiltered = this.props.isGeneFiltered(gene.gene_symbol);

    return (
      <CellMeasurer
        cache={this.cache}
        index={index}
        key={key}
        parent={parent}
      >
        <div style={style}>
          <GeneMatch
            key={gene.gene_symbol}
            label={gene.gene_symbol}
            phenotypeCount={gene.terms.length}
            matchedPhenotypes={gene.terms}
            allPhenotypes={this.props.allPhenotypes}
            toggleIsFiltered={() => this.props.toggleGeneIsFiltered(gene.gene_symbol, !isFiltered)}
            isFiltered={isFiltered}
          />
        </div>
      </CellMeasurer>
    )
  }

  calculateColumnCount() {
    const scrollbarWidth = 20;
    this.columnCount = Math.floor((this.width - scrollbarWidth) / 
      (GeneMatchesList.GENE_MATCH_WIDTH_PX + GeneMatchesList.GENE_MATCH_GUTTER_WIDTH_PX));
  }

  resetCellPositioner() {
    this.cellPositioner.reset({
      columnCount: this.columnCount,
      columnWidth: GeneMatchesList.GENE_MATCH_WIDTH_PX,
      spacer: GeneMatchesList.GENE_MATCH_GUTTER_WIDTH_PX
    });
  }
}

GeneMatchesList.GENE_MATCH_WIDTH_PX = 187;
GeneMatchesList.GENE_MATCH_GUTTER_WIDTH_PX = 0;
GeneMatchesList.GENE_MATCH_HEIGHT_PX = 23;
GeneMatchesList.CONTAINER_HEIGHT_PX = 100;
