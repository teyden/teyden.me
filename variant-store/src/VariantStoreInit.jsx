/**
 * This file simply initializes whichever Variant Store component is meant to be initialized
 * on this page. The code assumes that only one should be initialized per page.
 */
import React from 'react';
import ReactDOM from 'react-dom';

import PatientVariants from './PatientVariants.jsx';
import AllVariants from './AllVariants.jsx';

import './AllVariants.scss';
import './PatientVariants.scss';

const PATIENT_MODULE_ID = 'variant-store-patient';
const ALL_VARIANTS_MODULE_ID = 'variant-store-all-variants';

if (document.getElementById(PATIENT_MODULE_ID)) {
  ReactDOM.render(<PatientVariants />, document.getElementById(PATIENT_MODULE_ID));
} else if (document.getElementById(ALL_VARIANTS_MODULE_ID)) {
  ReactDOM.render(<AllVariants />, document.getElementById(ALL_VARIANTS_MODULE_ID));
}

// Temp. workaround due to https://github.com/zloirock/core-js/issues/289
Object.defineProperty(Array.prototype, Symbol.toStringTag, { value: 'Array' });
