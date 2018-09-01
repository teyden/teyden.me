import React from 'react';
import _ from 'lodash';
import SourceFilesListGroup from './SourceFilesListGroup.jsx';
import update from 'immutability-helper';
import ReactPaginate from 'react-paginate';
import request from 'superagent';
import { Position, Toaster, Intent, NonIdealState } from '@blueprintjs/core';

import './SourceFilesManager.scss';

export default class SourceFilesManager extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      pagination: {
        perPage: 10,
        offset: 0,
      },
      patients: null,
      filterTerm: ''
    };
    this.state.pagination.totalPages = 0;

    _.bindAll(this, [
      'handlePageClick',
      'handleFilterInput',
      'debouncedHandleFilterInput',
      'togglePatientExpanded',
      'toggleFileExpanded',
      'renderListGroups',
      'fetchData',
      'deleteFile',
      'getPatientsStateObjFromServerObj',
    ]);

    this.debouncedHandleFilterInput = _.debounce(this.debouncedHandleFilterInput, 500);

    this.fetchData();
  }

  render() {
    if (this.state.patients !== null
        && _.keys(this.state.patients).length === 0
        && !this.state.filterTerm
        && !this.state.isLoading) {
      return (
        <div id="source-files-manager">
          <NonIdealState
            title='No source files'
            visual='folder-open'
            description='There are no source files in the database. Use the Uploader tab to upload new source files.'
          />
        </div>
      );
    } else {
      return (
        <div id="source-files-manager" className={this.state.isLoading ? 'is-loading' : null}>
          {this.renderFilterInput()}
          <ul className="source-file-groups">
            {this.renderListGroups()}
          </ul>
          <div id="source-files-pagination">
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

  fetchData() {
    request.get(XWiki.contextPath + '/rest/variant-source-files/metadata')
      .query({
        patientOffset: this.state.pagination.offset,
        patientLimit: this.state.pagination.perPage,
        filterTerm: this.state.filterTerm,
      })
      .end((err, res) => {
        if (err) {
          console.error(err);
          return;
        }
        
        let data = res.body;
        this.setState((state) => {
          let patients = this.getPatientsStateObjFromServerObj(data);

          let change = {
            isLoading: { $set: false },
            patients: { $set: patients },
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

  debouncedHandleFilterInput(e) {
    this.setState({ filterTerm: e.target.value, isLoading: true }, this.fetchData);
  }
  
  /**
   * Extract patient state object from server data, preserving the current isExpanded state for patients
   * and files.
   */
  getPatientsStateObjFromServerObj(data) {
    let patients = {};
    for (let patient of (data.included || [])) {
      let curPatient = this.state.patients && this.state.patients[patient.id];
      patients[patient.id] = {
        name: patient.attributes.fullName,
        id: patient.id,
        isExpanded: (curPatient && curPatient.isExpanded) || false,
        files: {}
      };
    }
    for (let sourceFile of (data.data || [])) {
      let patientId = sourceFile.relationships.parent.data.id;
      patients[patientId].files[sourceFile.id] = _.clone(sourceFile.attributes);
      patients[patientId].files[sourceFile.id].id = sourceFile.id;
      let curFile = this.state.patients && this.state.patients[patientId] && this.state.patients[patientId].files[sourceFile.id];
      patients[patientId].files[sourceFile.id].isExpanded = (curFile && curFile.isExpanded) || false;
    }

    return patients;
  }

  renderListGroups() {
    return _.map(_.values(this.state.patients), (patient) => {
      return (
        <SourceFilesListGroup 
          {...patient} 
          toggleExpanded={() => this.togglePatientExpanded(patient.id)}
          toggleFileExpanded={(filename) => this.toggleFileExpanded(patient.id, filename)}
          deleteFile={(fileId) => this.deleteFile(patient.id, fileId)}
          key={patient.id}
        />
      );
    });
  }

  renderFilterInput() {
    return (
      <div id="filter-input" className="pt-input-group pt-large">
        <span className="pt-icon pt-icon-filter" />
        <input
          className="pt-input"
          type="search"
          placeholder="Begin typing to filter by patient last name or source file name..."
          dir="auto"
          onInput={this.handleFilterInput}
        />
      </div>
    );
  }

  togglePatientExpanded(id) {
    this.setState((state) => {
      let change = { patients: {}};
      change.patients[id] = {
        isExpanded: { $set: !state.patients[id].isExpanded }
      };
      let newState = update(state, change);
      return newState;
    });
  }

  toggleFileExpanded(patientId, fileId) {
    this.setState((state) => {
      let change = { patients: {} };
      change.patients[patientId] = {files: {}};
      change.patients[patientId].files[fileId] = {
        isExpanded: { $set: !state.patients[patientId].files[fileId].isExpanded }
      };
      let newState = update(state, change);
      return newState;
    });
  }

  deleteFile(patientId, fileId) {
    let url = XWiki.contextPath + '/rest/variant-source-files/patients/' + patientId + '/files/' + fileId;
    request.delete(url)
      .end((err, res) => {
        if (err || !res.ok) {
          let toaster = Toaster.create({
            position: Position.BOTTOM,
          });
          toaster.show({ 
            message: 'Deleting the file ' + fileId + ' failed. Please contact an administrator if the issue persists.',
            intent: Intent.DANGER
          });
        } else {
          this.fetchData();
        }
      });
  }
}
