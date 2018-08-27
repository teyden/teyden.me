import React from 'react';
import { Button } from '@blueprintjs/core';

export default class QuickFilters extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="quick-filters pt-callout">
        <h5>Quick Filters</h5>
        {this.renderQuickFilterButtons(this.getQuickFilterConfig())}
      </div>
    );
  }

  renderQuickFilterButtons(models) {
    let items = [];
    for (let entry of models) {
      items.push(this.renderQuickFilterButton(entry.text, entry.field, {type: entry.type, filter: entry.filter}));
    }
    return items;
  }

  renderQuickFilterButton(text, field, model) {
    return (
      <Button
        className={'quick-filter ' + this.getFilterActiveState(field, model)}
        onClick={() => { this.props.toggleQuickFilter(field, model); }}
        text={text}
        key={field + model.type + model.filter}
      />
    );
  }

  getFilterActiveState(field, model) {
    let filterState = this.props.gridState && this.props.gridState.filterState || {};
    if (filterState[field] && filterState[field].type == model.type) {
      if (filterState[field].filter == model.filter) {
        return 'pt-active';
      }

      let stateFilterVals = filterState[field].filter.split("||");
      let modelFilterVals = model.filter.split("||");

      let matchedFilterVals = 0;
      for (let filter of model.filter.split("||")) {
        if (stateFilterVals.indexOf(filter) != -1) {
          matchedFilterVals++;
        }
      }

      if (matchedFilterVals == modelFilterVals.length) {
        return 'pt-active';
      }
    }
    return "";
  }

  getQuickFilterConfig() {
    return [
      {
        field: 'ref_genome',
        text: 'GRCh38',
        type: 'equals',
        filter: 'GRCh38',
      },
      {
        field: 'ref_genome',
        text: 'GRCh37',
        type: 'equals',
        filter: 'GRCh37',
      },
      {
        field: 'coding_variant_type',
        text: 'frameshift INDEL',
        type: 'equals',
        filter: 'frameshift_deletion||frameshift_insertion',
      },
      {
        field: 'coding_variant_type',
        text: 'stoploss',
        type: 'equals',
        filter: 'stoploss',
      },
      {
        field: 'coding_variant_type',
        text: 'stopgain',
        type: 'equals',
        filter: 'stopgain',
      },
      {
        field: 'coding_variant_type',
        text: 'nonsynonymous SNV',
        type: 'equals',
        filter: 'nonsynonymous_snv',
      },
      {
        field: 'af_exac',
        text: 'ExAC AF \u2264 0.01',
        type: 'lessThanOrEqual',
        filter: '0.01'
      },
      {
        field: 'af_1kgenomes',
        text: '1000G AF \u2264 0.01',
        type: 'lessThanOrEqual',
        filter: '0.01'
      },
      {
        field: 'af_wellderly',
        text: 'Wellderly AF \u2264 0.01',
        type: 'lessThanOrEqual',
        filter: '0.01'
      },
      {
        field: 'score_phylop_vert',
        text: 'PhyloP vert > 0',
        type: 'greaterThan',
        filter: '0'
      },
      {
        field: 'score_phylop_vert',
        text: 'PhyloP vert < 0',
        type: 'lessThan',
        filter: '0'
      },
      {
        field: 'score_cadd_raw',
        text: 'CADD \u2265 10',
        type: 'greaterThanOrEqual',
        filter: '10',
      },
      {
        field: 'dbsnp_common',
        text: 'dbSNP (142) Common',
        type: 'equals',
        filter: 'true',
      }
    ];
  }
}