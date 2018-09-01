import React from 'react';
import _ from 'lodash';
import update from 'immutability-helper';
import request from 'superagent';
import { Position, Toaster, Intent, NonIdealState } from '@blueprintjs/core';

import SourceFilesListItem from './SourceFilesListItem.jsx';

import './SourceFilesManager.scss';

export default class SinglePatientSourceFilesManager extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      files: null
    };

    _.bindAll(this, [
      'fetchData',
      'renderListItems',
      'toggleFileExpanded',
    ]);

    this.fetchData();
  }

  render() {
    return (
      <div id="source-files-manager">
        {this.state.files !== null && _.keys(this.state.files).length === 0 && <NonIdealState
          title='No source files'
          visual='folder-open'
          description='There are no source files for this patient. Use the Uploader tab to upload new source files.'
        />}
        {this.state.files !== null && _.keys(this.state.files).length !== 0 && <ul className="source-file-items single-patient">
          {this.renderListItems()}
        </ul>}
      </div>
    );
  }

  fetchData() {
    let url = XWiki.contextPath + '/rest/variant-source-files/patients/' + this.props.exclusivePatientId + '/metadata';
    request.get(url)
      .end((err, res) => {
        if (err) {
          console.error(err);
          return;
        }

        let data = res.body;
        this.setState((state) => {
          let files = {};
          for (let sourceFile of (data.data || [])) {
            let curFile = this.state.files && this.state.files[sourceFile.id];
            files[sourceFile.id] = _.clone(sourceFile.attributes);
            files[sourceFile.id].id = sourceFile.id;
            files[sourceFile.id].isExpanded = (curFile && curFile.isExpanded || false);
          }

          let change = {
            files: { $set: files },
          };
          return update(state, change);
        });
      });
  }

  renderListItems() {
    return _.map(_.values(this.state.files), (file) => {
      return (
        <SourceFilesListItem
          {...file}
          toggleExpanded={() => this.toggleFileExpanded(file.id)}
          deleteFile={() => this.deleteFile(file.fileName)}
          key={file.id}
        />
      );
    });
  }

  toggleFileExpanded(fileId) {
    this.setState((state) => {
      let change = { files: {} };
      change.files[fileId] = {
        isExpanded: { $set: !state.files[fileId].isExpanded }
      };
      let newState = update(state, change);
      return newState;
    });
  }

  deleteFile(fileId) {
    let url = XWiki.contextPath + '/rest/variant-source-files/patients/' + this.props.exclusivePatientId + '/files/' + fileId;
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
