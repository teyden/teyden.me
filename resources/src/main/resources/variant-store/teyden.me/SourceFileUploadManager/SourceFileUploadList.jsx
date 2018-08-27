import React from 'react';
import SourceFileUploadListItem from './SourceFileUploadListItem.jsx';
import { UploadStates } from './SourceFileUploadManagerUtils.jsx';

export default class SourceFileUploadList extends React.Component {
  constructor(props) {
    super(props);
    this.getListItems = this.getListItems.bind(this);
  }

  render() {
    return (<div>
      <ul id="source-file-upload-list">
        {this.getListItems()}
      </ul>
    </div>);
  }

  getListItems() {
    let items = [];
    let entries = Object.entries(this.props.files);
    entries = _.sortBy(entries, (item) => [item[1].addedAt]);
    _.reverse(entries);

    for (let [key, file] of entries) {
      items.push(<SourceFileUploadListItem 
        startUpload={this.props.startUpload}
        cancelUpload={this.props.cancelUpload}
        file={file}
        fileId={key}
        key={key}
        exclusivePatientId={this.props.exclusivePatientId}
      />);
    } 
    return items;
  }
}
