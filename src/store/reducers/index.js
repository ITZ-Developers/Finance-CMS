import { combineReducers } from 'redux';

const reducerCombined = {};

const reducers = require.context('./', true, /.\.js?$/);
reducers.keys().forEach((path) => {
    if (path !== './index.js') {
        const reducer = reducers(path).default;
        reducerCombined[reducer.name] = reducer;
    }
});

const rootReducer = combineReducers(reducerCombined);

export default rootReducer;
