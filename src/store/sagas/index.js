import { all } from 'redux-saga/effects';

const sagas = [];

const sagasImport = require.context('./', true, /.\.js?$/);
sagasImport.keys().forEach((path) => {
    if (path !== './index.js') {
        sagas.push(...sagasImport(path).default);
    }
});

function* rootSaga() {
    yield all(sagas);
}

export default rootSaga;
