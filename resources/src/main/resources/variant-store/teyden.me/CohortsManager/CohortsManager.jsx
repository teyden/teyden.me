import React from 'react';
import _ from 'lodash';
import update from 'immutability-helper';
import ReactPaginate from 'react-paginate';
import request from 'superagent';
import { Position, Toaster, Intent, NonIdealState, Button } from '@blueprintjs/core';
import CohortsList from './CohortsList.jsx';

import './CohortsManager.scss';

// cohort filter input
// cohort quick filters
// cohort list ->
// cohort detailed page ->
// cohort pagination
// cohort kebab

export default class CohortsManager extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      pagination: {
        perPage: 10,
        offset: 0,
      },
      cohorts: null,
      filterTerm: ''
    };
    this.state.pagination.totalPages = 0;

    _.bindAll(this, [
      'renderCohortsList',
      'handlePageClick',
      'handleFilterInput',
      'debouncedHandleFilterInput',
      'fetchData',
    ]);

    this.fetchData();
  }

  render() {
    if (this.state.cohorts !== null
      && _.keys(this.state.cohorts).length === 0
      && !this.state.filterTerm
      && !this.state.isLoading) {
      return (
        <div id="cohort-manager">
          <NonIdealState
            title='No cohorts'
            visual='folder-open'
            description='There are no cohorts in the database. Use the Uploader tab to upload new source files.'
          />
        </div>
      );
    } else {
      return (
        <div id="cohorts-manager" className={this.state.isLoading ? 'is-loading' : null}>
          {this.renderFilterInput()}
          {this.renderCohortQuickFilters()}
          {this.renderCohortsList()}
          <div id="cohorts-pagination">
            <ReactPaginate
              pageCount={this.state.pagination.totalPages}
              pageRangeDisplayed={this.state.pagination.perPage}
              forcePage={this.state.pagination.offset / this.state.pagination.perPage}
              marginPagesDisplayed={5}
              nextLabel={<span className="pt-icon-standard pt-icon-chevron-right pt-align-right" />}
              previousLabel={<span className="pt-icon-standard pt-icon-chevron-left" />}
              breakLabel={<a>...</a>}
              breakClassName={"break"}
              marginPagesDisplayed={2}
              onPageChange={this.handlePageClick}
              containerClassName={"pagination pt-button-group"}
              subContainerClassName={"pages pagination"}
              previousClassName={"pt-button"}
              nextClassName={"pt-button"}
              pageClassName={"pt-button"}
              breakClassName={"pt-button pt-disabled"}
              activeClassName={"pt-intent-primary"}
              disabledClassName={"pt-disabled"}
            />
          </div>
        </div>
      );
    }
  }

  renderFilterInput() {
    return (
      <div id="filter-input" className="pt-input-group pt-large">
        <span className="pt-icon pt-icon-filter" />
        <input
          className="pt-input"
          type="search"
          placeholder="Begin typing to filter by cohort name..."
          dir="auto"
          onInput={this.handleFilterInput}
        />
      </div>
    );
  }

  renderCohortQuickFilters() {
    // add a bar between filter buttons for cohort states vs job statuses
    return (
      <div id="cohort-quick-filters">
        <Button iconName="document" onClick={this.handleQuickFilterClick}></Button>
        <Button iconName="warning-sign" onClick={this.handleQuickFilterClick}></Button>
        <Button iconName="tick" onClick={this.handleQuickFilterClick}></Button>
      </div>
    );
  }

  renderCohortsList() {
    return (
      <CohortsList 
        cohorts={this.state.cohorts}
      />
    );
  }

  handlePageClick(data) {
    this.setState((state) => {
      let change = {
        isLoading: { $set: true },
        pagination: {
          offset: { $set: Math.ceil(data.selected * state.pagination.perPage) }
        },
      };
      let newState = update(state, change);
      return newState;
    }, this.fetchData);
  }

  handleFilterInput(e) {
    e.persist();
    this.debouncedHandleFilterInput(e);
  }

  handleQuickFilterClick() {
    // TODO
  }

  debouncedHandleFilterInput(e) {
    this.setState({ filterTerm: e.target.value, isLoading: true }, this.fetchData);
  }

  fetchData() {
    request.get(XWiki.contextPath + '/rest/cohorts')
      .query({
        cohortOffset: this.state.pagination.offset,
        cohortLimit: this.state.pagination.perPage,
        filterTerm: this.state.filterTerm,
      })
      .end((err, res) => {
        if (err) {
          console.error(err);
          return;
        }

        let data = res.body;
        this.setState((state) => {
          let cohorts = data.data;

          let change = {
            isLoading: { $set: false },
            cohorts: { $set: cohorts },
            pagination: {
              totalPages: { $set: Math.ceil(data.meta.total / state.pagination.perPage) },
              offset: { $set: data.meta.offset }
            }
          };
          let newState = update(state, change);
          return newState;
        });
      });

  }
}


const DUMMY_DATA = [
  {
    "attributes":{
      "currentCallSetIds":[
        "P0000003.2_4.csv",
        "P0000002.4_5.csv"
      ],
      "toRemoveCallSetIds":[ ],
      "name":"Cohort A",
      "description":"no description atm",
      "toAddCallSetIds":[ ],
      "refGenome":"GRCh38",
      "version":"1.7"
    },
    "id":"COH0000001",
    "type":"cohort"
  },
  {
    "attributes":{
      "currentCallSetIds":[
        "P0000001.1_2_3.csv",
        "P0000002.4_5.csv"
      ],
      "toRemoveCallSetIds":[
        "P0000002.4_5.csv"
      ],
      "name":"",
      "description":"",
      "toAddCallSetIds":[
        "P0000004.test.csv"
      ],
      "refGenome":"GRCh38",
      "version":"1.4"
    },
    "id":"COH0000002",
    "type":"cohort"
  }
];