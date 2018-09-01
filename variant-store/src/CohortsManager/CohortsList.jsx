import React from 'react';
import CohortsListItem from './CohortsListItem.jsx';

import './CohortsManager.scss';

export default class CohortsList extends React.Component {
  constructor(props) {
    super(props);

    _.bindAll(this, [
      'getListItems',
    ]);
  }

  render() {
    return (
      <div id="cohorts-list">
        <ul>
          {this.getListItems()}
        </ul>
      </div>
    );
  }

  getListItems() {
    let items = [];
    if (this.props.cohorts != null) {
      let entries = Object.entries(this.props.cohorts);
      entries = _.sortBy(entries, (item) => [item[1].attributes.creationDateTime]);
      _.reverse(entries);
      for (let [key, cohort] of entries) {
        items.push(<CohortsListItem
          {...cohort}
          key={key}
          openCohortDetailedPage={this.props.openCohortDetailedPage}
          processCohort={this.props.processCohort}
          deleteCohort={this.props.deleteCohort}
        />);
      }
    }
    return items;
  }
}