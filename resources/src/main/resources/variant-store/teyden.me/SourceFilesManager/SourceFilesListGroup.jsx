import React from 'react';
import { Collapse } from '@blueprintjs/core';
import SourceFilesListItem from './SourceFilesListItem.jsx';
import _ from 'lodash';

export default class SourceFilesListGroup extends React.Component {
  constructor(props) {
    super(props);

    _.bindAll(this, [
      'renderListItems',
    ]);
  }

  render() {
    return (
      <li>
        <span 
          onClick={() => { this.props.toggleExpanded(this.props.id)}}
          className={'pt-icon-standard pt-tree-node-caret' + (this.props.isExpanded ? ' pt-tree-node-caret-open' : '')} 
        />
        <span className="name" onClick={() => { this.props.toggleExpanded(this.props.id) }}>
          <span className="pt-icon-large pt-icon-person" />
          {this.props.id}{!!this.props.name.trim() && <span> ({this.props.name})</span>}
        </span>
        <Collapse isOpen={this.props.isExpanded}>
          <ul className="source-file-items">
            {this.renderListItems()}
          </ul>
        </Collapse>
      </li>
    );
  }

  renderListItems() {
    return _.map(_.values(this.props.files), (file) => {
      return (
        <SourceFilesListItem 
          {...file} 
          toggleExpanded={() => this.props.toggleFileExpanded(file.id)}
          deleteFile={() => this.props.deleteFile(file.fileName)}
          key={file.id}
        />
      );
    });
  }
}
