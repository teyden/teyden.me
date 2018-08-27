import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import SourceFileUploadSelector from './SourceFileUploadSelector.jsx';
import SourceFileUploadList from './SourceFileUploadList.jsx';
import request from 'superagent';
import update from 'immutability-helper';
import { UploadStates, BackendStatesToFrontendStates } from './SourceFileUploadManagerUtils.jsx';
// CSS
import './SourceFileUploadManager.scss';

export default class SourceFileUploadManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: props.files || {},
      currentUpload: {
        fileId: null,
        request: null,
      }
    };

    _.bindAll(this, [
      'addFileUpload',
      'startUpload',
      'cancelUpload',
      'createUploadRequest',
      'handleUploadProgress',
      'handleUploadFinished',
      'handleUploadError',
      'getNextWaitingUploadId',
      'fetchProcessingStatus',
      'updateProcessingStatus',
    ]);
  }

  componentDidMount() {
    this.fetchProcessingStatusInterval = setInterval(this.fetchProcessingStatus, 3000);
  }

  componentWillUnmount() {
    clearInterval(this.fetchProcessingStatusInterval);
  }

  render() {
    return (<div>
      <SourceFileUploadSelector 
        exclusivePatientId={this.props.exclusivePatientId} 
        addFileUpload={this.addFileUpload} 
      />
      <SourceFileUploadList 
        exclusivePatientId={this.props.exclusivePatientId} 
        startUpload={this.startUpload} 
        cancelUpload={this.cancelUpload} 
        files={this.state.files} 
      />
    </div>);
  }

  addFileUpload(file) {
    this.setState((state) => {
      let newFile = {
        fileId: fileId,
        fileName: file.fileName,
        addedAt: (new Date()).getTime(),
        jobId: null,
        fileObj: file.fileObj,
        size: file.size,
        refGenome: null,
        status: {
          state: UploadStates.PENDING,
          progress: 0,
          error: {
            step: null,
            detail: null
          }
        },
        patient: {
          id: (file.patient && file.patient.id) || null,
          name: null
        },
      };
      let fileId = newFile.fileName + '-' + newFile.addedAt;
      newFile.fileId = fileId;
      let change = { files: {} };
      change.files[fileId] = { $set: newFile };

      return update(state, change);
    });
  }

  startUpload(fileId, data) {
    this.setState((state) => {
      let change = { files: {} };
      if (state.currentUpload.fileId) {
        change.files[fileId] = {
          status: {
            state: { $set: UploadStates.WAITING }
          }
        };
      } else {
        change.files[fileId] = {
          status: {
            state: { $set: UploadStates.UPLOADING }
          }
        };
        change.currentUpload = {
          fileId: { $set: fileId }
        }
      }
      change.files[fileId].patient = { $set: _.clone(data.patient) };
      change.files[fileId].refGenome = { $set: _.clone(data.refGenome) };
      let newState = update(state, change);
      return newState;
    })
  }

  cancelUpload(fileId) {
    this.setState((state) => {
      let change = { files: {} };
      if (state.currentUpload.fileId == fileId) {
        this.abortRequest(state.currentUpload.request);
        let nextUploadId = this.getNextWaitingUploadId(state);
        change.currentUpload = {
          request: { $set: null },
          fileId: { $set: nextUploadId }
        };
        if (nextUploadId) {
          change.files[nextUploadId] = {
            status: { state: { $set: UploadStates.UPLOADING } }
          };
        }
      }
      let newState = update(state, change);
      newState = update(newState, { files: { $unset: [fileId] } });
      return newState;
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.currentUpload.fileId && prevState.currentUpload.fileId != this.state.currentUpload.fileId) {
      this.createUploadRequest(this.state.currentUpload.fileId);
    }
    
    // Invoke onActiveChange, if necessary. As shown below, the active state of the uploader is defined as
    // the presence of a file that is in any state other than "Done".
    let [currIsActive, prevIsActive] = _.map([this.state, prevState], (state) => {
      let activeFiles = _.filter(state.files, (file) => {
        return file.status.state != UploadStates.DONE && file.status.state != UploadStates.FAILED;
      });
      return activeFiles.length > 0;
    });

    if (currIsActive != prevIsActive) {
      this.props.onActiveChange && this.props.onActiveChange(currIsActive);
    }
  }

  createUploadRequest(fileId) {
    this.setState((state) => {
      let file = state.files[fileId];
      let url = XWiki.contextPath + '/rest/variant-source-files/patients/' + file.patient.id + '/files/' + file.fileName;
      let reqBody = {
        patientId: file.patient.id,
        refGenome: file.refGenome,
        fileName: file.fileName,
      };
      let req = request
        .put(url)
        .field('metadata', JSON.stringify(reqBody))
        .attach(file.fileName, file.fileObj)
        .on('progress', this.handleUploadProgress);
      req.then(this.handleUploadFinished, this.handleUploadError);

      return update(state, { currentUpload: { request: { $set: req } } });
    });
  }

  handleUploadFinished(res) {
    this.setState((state) => {
      let nextUploadId = this.getNextWaitingUploadId(state);
      let change = {
        currentUpload: { 
          request: { $set: null },
          fileId: { $set: nextUploadId }
        },
        files: {}
      };
      change.files[state.currentUpload.fileId] = {
        status: {
          state: { $set: UploadStates.PROCESSING },
          progress: { $set: null },
        },
        jobId: { $set: res.body.jobId }
      }
      if (nextUploadId) {
        change.files[nextUploadId] = {
          status: { state: { $set: UploadStates.UPLOADING } }
        };
      }

      return update(state, change);
    });
  }

  handleUploadError(err) {
    this.setState((state) => {
      // Set the error state
      let errMsg = '';
      if (err.response && err.response.body && err.response.body.errors && err.response.body.errors.length) {
        _.each(err.response.body.errors, (error) => {
          errMsg += error.title + ': ' + error.detail + '\n';
        });
      } else if (err.status) {
        if (err.status == 409) {
          errMsg = 'File name conflict - a source file with this name already exists for the selected patient. ';
          errMsg += 'Either delete the existing source file or rename the one you are uploading.'
        } else {
          errMsg = 'The server responded with: ' + err.message + ' (' + err.status + ')';
        }
      } else {
        errMsg = err.message;
      }

      let nextUploadId = this.getNextWaitingUploadId(state);
      let change = {
        currentUpload: {
          request: { $set: null },
          fileId: { $set: nextUploadId }
        },
        files: {}
      };
      change.files[state.currentUpload.fileId] = {
        status: {
          state: { $set: UploadStates.FAILED },
          progress: { $set: null },
          error: {
            step: { $set: UploadStates.UPLOADING },
            detail: { $set: errMsg }
          },
        }
      };
      if (nextUploadId) {
        change.files[nextUploadId] = {
          status: { state: { $set: UploadStates.UPLOADING } }
        };
      }

      return update(state, change);
    });
  }

  getNextWaitingUploadId(state) {
    // Find other uploads that are waiting
    let waitingUploads = _.filter(Object.values(state.files), (file) => {
      return file.status.state == UploadStates.WAITING;
    });
    if (waitingUploads.length) {
      // Start with the oldest one in the queue
      waitingUploads = _.sortBy(waitingUploads, (file) => [file.addedAt]);
      return waitingUploads[0].fileId;
    } else {
      return null;
    }
  }

  handleUploadProgress(event) {
    this.setState((state) => {
      let change = {files: {}};
      change.files[state.currentUpload.fileId] = { status: { progress: { $set: event.loaded / event.total } } };
      return update(state, change);
    });
  }

  fetchProcessingStatus() {
    let processingFiles = _.filter(_.values(this.state.files), (file) => {
      return file.status.state == UploadStates.PROCESSING;
    });
    if (!processingFiles.length) {
      return;
    }

    let statusService = XWiki.contextPath + '/rest/variant-source-files/pairs/metadata';
    let qs = '';
    _.each(processingFiles, (file) => {
      if (qs) {
        qs += '&';
      }
      qs += 'pair=' + file.patient.id + '.' + file.fileName;
    });
    
    request
      .get(statusService)
      .query(qs)
      .then(this.updateProcessingStatus);
  }

  updateProcessingStatus(res) {
    this.setState((state) => {
      let change = {files: {}};

      for (let job of res.body.data) {
        let file = _.find(state.files, (file) => { 
          return file.fileName && file.fileName == job.attributes.fileName && file.patient.id && file.patient.id == job.attributes.patientId 
        });
        if (file == null) {
          continue;
        }

        change.files[file.fileId] = {
          status: {
            state: { $set: BackendStatesToFrontendStates[job.attributes.jobStatus.toUpperCase()] },
            log: { $set: job.attributes.jobLog },
            jobId: { $set: job.attributes.jobId }
          }
        };

        // Look for the "magic" string below which indicates that there were errors or warnings during processing
        const completedWithIssuesTriggerPhrase = 'Successfully completed with';
        let didCompleteWithIssues = job.attributes.jobStatus.toUpperCase() == 'COMPLETE' &&
          job.attributes.jobLog &&
          job.attributes.jobLog.indexOf(completedWithIssuesTriggerPhrase) > -1;
        
        if (didCompleteWithIssues) {
          change.files[file.fileId].status.state = { $set: UploadStates.DONE_WITH_ISSUES };
          change.files[file.fileId].status.log = { $set: job.attributes.jobLog };
        } else if (job.attributes.jobErrorDetail) {
          let detail = 'The file was uploaded, but failed to be imported to the database.';

          change.files[file.fileId].status.error = {
            step: { $set: UploadStates.PROCESSING },
            detail: { $set: detail },
          }
          change.files[file.fileId].status.log = { $set: job.attributes.jobErrorDetail };
        }
      }

      return update(state, change);
    });
  }

  abortRequest(req) {
    if (req) {
      req.abort();
    }
  }
}
