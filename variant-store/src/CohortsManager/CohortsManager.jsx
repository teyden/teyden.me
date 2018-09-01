import React from 'react';
import _ from 'lodash';
import update from 'immutability-helper';
import ReactPaginate from 'react-paginate';
import request from 'superagent';
import { Position, Toaster, Intent, NonIdealState, Button } from '@blueprintjs/core';
import CohortsList from './CohortsList.jsx';
import CohortDetailedPage from './CohortDetailedPage.jsx';

import './CohortsManager.scss';

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
      filterTerm: '',
      quickFilters: {},
      selectedCohort: null,
      selectedCohortPatientIds: null
    };
    this.state.pagination.totalPages = 0;

    _.bindAll(this, [
      'handleCohortsListPageClick',
      'handleFilterInput',
      'toggleQuickFilter',
      'openCohortDetailedPage',
      'processCohort',
      'updateCohort',
      'handleEditNameSubmit',
      'handleEditDescriptionSubmit',
      'debouncedHandleFilterInput',
      'fetchData',
    ]);

    this.debouncedHandleFilterInput = _.debounce(this.debouncedHandleFilterInput, 500);

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
            description='There are no cohorts in the database.'
          />
        </div>
      );
    } else {
      return (
        <div id="cohorts-manager" className={this.state.isLoading ? 'is-loading' : null}>
          <div id="cohorts-manager-list-container">
            <div id="cohorts-manager-list-filter-container">
              {this.renderFilterInput()}
              {this.renderCohortQuickFilters()}
            </div>
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
                onPageChange={this.handleCohortsListPageClick}
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
          {this.renderCohortDetailedPage()}
          <div className="clear"></div>
        </div>
      );
    }
  }

  renderFilterInput() {
    return (
      <div id="cohorts-filter-input" className="pt-input-group pt-large">
        <span className="pt-icon pt-icon-filter" />
        <input
          className="pt-input"
          type="search"
          placeholder="Begin typing to filter by cohort name or ID..."
          dir="auto"
          onInput={this.handleFilterInput}
        />
      </div>
    );
  }

  renderCohortQuickFilters() {
    return (
      <div id="cohort-quick-filters">
        <Button
          iconName="document"
          className={COHORT_QUICK_FILTERS.DRAFT}
          onClick={this.toggleQuickFilter(COHORT_QUICK_FILTERS.DRAFT)}
          active={this.isQuickFilterActive(COHORT_QUICK_FILTERS.DRAFT)}
        />
        <Button
          iconName="warning-sign"
          className={COHORT_QUICK_FILTERS.OUTDATED}
          onClick={this.toggleQuickFilter(COHORT_QUICK_FILTERS.OUTDATED)}
          active={this.isQuickFilterActive(COHORT_QUICK_FILTERS.OUTDATED)}
        />
        <Button
          iconName="tick"
          className={COHORT_QUICK_FILTERS.CLEAN}
          onClick={this.toggleQuickFilter(COHORT_QUICK_FILTERS.CLEAN)}
          active={this.isQuickFilterActive(COHORT_QUICK_FILTERS.CLEAN)}
        />
        <span className="divider" />
        <Button
          text={'ACTIVE'}
          className={COHORT_QUICK_FILTERS.ACTIVE}
          onClick={this.toggleQuickFilter(COHORT_QUICK_FILTERS.ACTIVE)}
          active={this.isQuickFilterActive(COHORT_QUICK_FILTERS.ACTIVE)}
        />
        <Button
          text={'QUEUED'}
          className={COHORT_QUICK_FILTERS.QUEUED}
          onClick={this.toggleQuickFilter(COHORT_QUICK_FILTERS.QUEUED)}
          active={this.isQuickFilterActive(COHORT_QUICK_FILTERS.QUEUED)}
        />
      </div>
    );
  }

  renderCohortsList() {
    return (
      <CohortsList 
        cohorts={this.state.cohorts}
        openCohortInVariantTable={this.openCohortInVariantTable}
        openCohortDetailedPage={this.openCohortDetailedPage}
        processCohort={this.processCohort}
      />
    );
  }

  renderCohortDetailedPage() {
    // TODO Job order is not completed
    return (
      <CohortDetailedPage
        {...this.state.selectedCohort}
        selectedCohortPatientIds={this.state.selectedCohortPatientIds}
        selectedCohortCallsetIds={this.state.selectedCohortCallsetIds}
        updateCohort={this.updateCohort}
        handleEditNameSubmit={this.handleEditNameSubmit}
        handleEditDescriptionSubmit={this.handleEditDescriptionSubmit}
      />
    );
  }

  isQuickFilterActive(filter) {
    return filter in this.state.quickFilters;
  }

  toggleQuickFilter(filter) {
    let _this = this;
    return function (e) {
      if (_this.isQuickFilterActive(filter)) {
        _this.setState((state) => {
          let change = { quickFilters: { $unset: [filter] }, isLoading: { $set: true } };
          return update(state, change);
        }, _this.fetchData);
      } else {
        _this.setState((state) => {
          let change = { quickFilters: { $merge: { [filter]: 1 } }, isLoading: { $set: true }  };
          return update(state, change);
        }, _this.fetchData);
      }
    };
  }
  
  openCohortDetailedPage(cohortId) {
    let cohort = _.find(this.state.cohorts, { id: cohortId });
    this.setState((state) => {
      let pids = new Set();
      _.forEach(cohort.attributes.currentCallsetIds, (callsetId) => {
        pids.add(_.split(callsetId, ".")[0]);
      });
      let callsetIds = new Set();
      _.forEach(cohort.attributes.currentCallsetIds, (callsetId) => {
        callsetIds.add(_.split(callsetId, ".")[0]);
      });
      let change = {
        selectedCohort: { $set: cohort },
        selectedCohortPatientIds: { $set: pids },
        selectedCohortCallsetIds: { $set: callsetIds}
      };
      return update(state, change);
    });
  }

  /**
   * Sends a request to process a cohort. A cohort could be of status "draft" or "outdated".
   *
   * @param cohortId The ID of the cohort to process.
   */
  processCohort(cohortId) {
    // TODO - backend is not ready yet
    // Job details added to the cohort object here may not be accurate.
    // Waiting for job details to be added to the cohorts data model.
    request.post(XWiki.contextPath + '/rest/cohorts/' + cohortId + '/process')
      .end((err, res) => {
        if (err) {
          console.error(err);
          return;
        }

        let job = res.body.data;
        this.setState((state) => {
          let cohortToUpdateIdx = _.findIndex(state.cohorts, { id: cohortId });

          // For now, just set the response object (a job status) as the body of a 'job' field on the cohort object.
          let change = {
            isLoading: { $set: false },
            cohorts: { $splice: [[cohortToUpdateIdx, 1, update(state.cohorts[cohortToUpdateIdx], { ['job']: { $set: job } } )]] },
          };
          return update(state, change);
        }, this.fetchData);
      });
  }

  openCohortInVariantTable() {
    // TODO - backend is not ready yet
  }
  
  deleteCohort() {
    // TODO - backend is not ready yet
  }

  handleEditNameSubmit(cohortId, version, name) {
    this.updateCohort(cohortId, {version: version, name: name});
  }

  handleEditDescriptionSubmit(cohortId, version, description) {
    this.updateCohort(cohortId, {version: version, description: description});
  }

  /**
   * Sends an update request. In order to delete a field, the key has to be present and the value null or empty.
   *
   * @param cohortId The ID of the cohort to update.
   * @param reqBody The body of the request. All fields are optional except version.
   */
  updateCohort(cohortId, reqBody) {
    if (!reqBody.version) {
      return;
    }
    request.patch(XWiki.contextPath + '/rest/cohorts/' + cohortId)
      .send(reqBody)
      .end((err, res) => {
        if (err) {
          // TODO impl a UI for failed updates
          console.error(err);
          return;
        }

        let cohort = res.body.data[0];
        this.setState((state) => {
          let change = {
            isLoading: { $set: false },
            cohorts: { $splice: [[_.findIndex(state.cohorts, { id: cohort.id }), 1, cohort]] },
          };
          return update(state, change);
        }, this.fetchData);
      });
  }

  handleCohortsListPageClick(data) {
    this.setState((state) => {
      let change = {
        isLoading: { $set: true },
        pagination: {
          offset: { $set: Math.ceil(data.selected * state.pagination.perPage) }
        },
      };
      return update(state, change);
    }, this.fetchData);
  }

  handleFilterInput(e) {
    e.persist();
    this.debouncedHandleFilterInput(e);
  }

  debouncedHandleFilterInput(e) {
    this.setState({ filterTerm: e.target.value, isLoading: true }, this.fetchData);
  }

  fetchData() {
    request.get(XWiki.contextPath + '/rest/cohorts')
      .query({
        cohortOffset: this.state.pagination.offset,
        cohortLimit: this.state.pagination.perPage,
        filterTerm: this.getFilterQueryString()
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

  getFilterQueryString() {
    // Generate filter query string from free-text filter term in combined with quick filters
    // Syntax required to do so -- the below is temporary (replace with appropriate delimiter)
    let filterQueryString = this.state.filterTerm;
    for (let term of Object.entries(this.state.quickFilters)) {
      if (filterQueryString) {
        filterQueryString += "delimiter" + term;
      } else {
        filterQueryString += term;
      }
    }
    return filterQueryString;
  }
}

const COHORT_QUICK_FILTERS = {
  DRAFT: "draft",
  OUTDATED: "outdated",
  CLEAN: "clean",
  ACTIVE: "active",
  QUEUED: "queued",
};