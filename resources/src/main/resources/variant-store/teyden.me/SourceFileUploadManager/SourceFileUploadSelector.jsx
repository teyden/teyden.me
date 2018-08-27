import React from 'react';
import Dropzone from 'react-dropzone';

export default class SourceFileUploadSelector extends React.Component {
  constructor(props) {
    super(props);
    this.onDrop = this.onDrop.bind(this);
  }

  render() {
    return (<div id="upload-selector">
      <Dropzone onDrop={this.onDrop} className="drop-zone" activeClassName="active">
        <div>
          <span className="pt-icon pt-icon-cloud-upload" />
          Drop files here<br />Click to select files to upload
        </div>
      </Dropzone>
    </div>);
  }

  onDrop(files) {
    for (let file of files) {
      this.props.addFileUpload({
        fileName: file.name,
        size: file.size,
        fileObj: file
      });
    }
  }
}

SourceFileUploadSelector.propTypes = {
  addFileUpload: React.PropTypes.func.isRequired,
};
