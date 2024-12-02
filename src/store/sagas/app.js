import apiConfig from '@constants/apiConfig';
import { sendRequest } from '@services/api';
import { handleApiResponse } from '@utils/apiHelper';
import { call, takeLatest } from 'redux-saga/effects';
import { uploadFile } from '@store/actions/app';
function* _uploadFile({ payload: { params, onCompleted, onError } }) {
    try {
        const result = yield call(sendRequest, apiConfig.file.upload, params);
        handleApiResponse(result, onCompleted, onError);
    } catch (error) {
        onError(error);
    }
}

const sagas = [ takeLatest(uploadFile.type, _uploadFile) ];

export default sagas;
