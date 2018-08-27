import React from 'react';
import CohortsListItem from './CohortsListItem.jsx';

import './CohortsManager.scss';

export default class CohortsList extends React.Component {
  constructor(props) {
    super(props);
    this.getListItems = this.getListItems.bind(this);
  }

  render() {
    return (<div>
      <ul id="cohorts-list">
        {this.getListItems()}
      </ul>
    </div>);
  }

  getListItems() {
    let items = [];
    if (this.props.cohorts != null) {
      let entries = Object.entries(this.props.cohorts);
      entries = _.sortBy(entries, (item) => [item[1].addedAt]);
      _.reverse(entries);

      for (let [key, cohort] of entries) {
        console.log(key, cohort);
        let numCallsets = cohort.attributes.currentCallSetIds && cohort.attributes.currentCallSetIds.length
        let numPatients = this.getNumPatientsInCohort(cohort.attributes.currentCallSetIds);
        items.push(<CohortsListItem
          cohort={cohort}
          cohortId={cohort.id}
          cohortName={cohort.attributes.name}
          cohortDescription={cohort.attributes.description}
          numPatients={numPatients}
          numCallsets={numCallsets}
          refGenome={cohort.attributes.refGenome}
          jobOrder={'3/11'}
          jobStatus={'QUEUED'}
          jobType={'REPROCESSING'}
          cohortState={'OUTDATED'}
          key={key}

          toggleDetailedPage={this.toggleDetailedPage}
          deleteCohort={this.deleteCohort}
        />);
      }
    }
    return items;
  }

  toggleDetailedPage() {

  }

  deleteCohort() {

  }

  getNumPatientsInCohort(callsets) {
    if (callsets && callsets.length > 0) {
      uniqs = {};
      for (let [callset] of callsets) {
        let pid = _.split(callset, '.')[0];
        if (pid in uniqs) {
          uniqs[pid] += 1;
        } else {
          uniqs[pid] = 1;
        }
      }
      return uniqs.length;
    }
    return 0;
  }
}
