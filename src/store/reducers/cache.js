import { createReducer } from '@store/utils';
import { cacheActions } from '@store/actions';

const {
    cacheByName,
} = cacheActions;

const initialState = {
    cacheData: {},
};

const cacheReducer = createReducer(
    {
        reducerName: 'cache',
        initialState,
    },
    {
        [cacheByName.type]: (state, { payload: { name, data } }) => {
            state.cacheData[name] = data;
        },
    },
);

export default cacheReducer;
