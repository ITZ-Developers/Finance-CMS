import { takeLatest } from 'redux-saga/effects';
import { accountActions } from "@store/actions";
import { processAction } from "@store/utils";
import apiConfig from "@constants/apiConfig";

const loginSaga = payload => processAction(apiConfig.account.login, payload);

const getProfileSaga = payload => processAction(apiConfig.account.getProfile, payload);

const sagas = [
    takeLatest(accountActions.login.type, loginSaga),
    takeLatest(accountActions.getProfile.type, getProfileSaga),
];

export default sagas;
