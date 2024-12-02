import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootReducer from '@store/reducers';
import rootSaga from '@store/sagas';

const getMiddleWare = (sagaMiddleware) => {
    if (process.env.NODE_ENV === 'development') {
        const composeEnhancers =
            window?.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__?.({ trace: true, traceLimit: 25 }) || compose;

        return composeEnhancers(applyMiddleware(sagaMiddleware));
    }

    return applyMiddleware(sagaMiddleware);
};

const configureStore = () => {
    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(rootReducer, getMiddleWare(sagaMiddleware));
    sagaMiddleware.run(rootSaga);
    return store;
};

const store = configureStore();

export default store;
