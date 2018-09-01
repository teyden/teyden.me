/**
 * Get a URL to a patient record, with 
 * 
 * @param {*} patientId The patient ID.
 * @param callsetId Optional callset ID. If included, the variants table will use it as a preset filter.
 */
export function generatePatientRecordUrl(patientId, callsetId) {
  let queryArgs = '';
  if (callsetId) {
    queryArgs = CALLSET_FILTER_URL_PARAM + '=' + callsetId;
  }
  let url = new XWiki.Document(patientId, 'data').getURL('edit', queryArgs + '#HGeneticvariants');
  return url;
}

/**
 * Gets the parts of a callset ID: the patient ID and the file name.
 * 
 * @param {*} callsetId the callset ID string
 * @returns an object with keys `patientId` and `filename`.
 */
export function getCallsetIdParts(callsetId) {
  const parts = callsetId.split(/\.(.+)/);
  return {
    patientId: parts[0],
    filename: parts[1],
  }
}

export const CALLSET_FILTER_URL_PARAM = 'vs_callset_id';
export const FILTER_OR_SEPARATOR = '||';
