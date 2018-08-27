import { Intent } from '@blueprintjs/core';

export const UploadStates = {
    PENDING: 0,
    WAITING: 1,
    UPLOADING: 2,
    PROCESSING: 3,
    FAILED: 4,
    DONE: 5,
    DONE_WITH_ISSUES: 6
};

export const BackendStatesToFrontendStates = {
    'CREATED': UploadStates.PROCESSING,
    'PROCESSING': UploadStates.PROCESSING,
    'COMPLETE': UploadStates.DONE,
    'CANCELED': UploadStates.FAILED,
    'ERROR': UploadStates.FAILED,
    'INTERNAL_ERROR': UploadStates.FAILED
};

export const getIntentForState = function (state) {
    let statesToIntents = {};
    statesToIntents[UploadStates.PENDING] = null;
    statesToIntents[UploadStates.WAITING] = null;
    statesToIntents[UploadStates.UPLOADING] = Intent.PRIMARY;
    statesToIntents[UploadStates.PROCESSING] = Intent.PRIMARY;
    statesToIntents[UploadStates.DONE] = Intent.SUCCESS;
    statesToIntents[UploadStates.DONE_WITH_ISSUES] = Intent.WARNING;
    statesToIntents[UploadStates.FAILED] = Intent.DANGER;

    return statesToIntents[state];
}

export const getStateName = function (state) {
    let statesToIntents = {};
    statesToIntents[UploadStates.PENDING] = 'Queued';
    statesToIntents[UploadStates.WAITING] = 'Waiting';
    statesToIntents[UploadStates.UPLOADING] = 'Uploading';
    statesToIntents[UploadStates.PROCESSING] = 'Processing';
    statesToIntents[UploadStates.DONE] = 'Complete';
    statesToIntents[UploadStates.DONE_WITH_ISSUES] = 'Completed with issues';
    statesToIntents[UploadStates.FAILED] = 'Failed';

    return statesToIntents[state];
}