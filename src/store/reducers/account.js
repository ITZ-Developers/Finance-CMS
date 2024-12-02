import { createFailureActionType, createReducer } from '@store/utils';
import { accountActions } from '@store/actions';

const {
    logout,
    getProfileSuccess,
    getProfile,
} = accountActions;

const initialState = {
    profile: null,
};

const accountReducer = createReducer(
    {
        reducerName: 'account',
        initialState,
        // storage: true,
        storage: false,
    },
    {
        [getProfileSuccess.type]: (state, { payload }) => {
            state.profile = payload?.data || null;
        },
        [createFailureActionType(getProfile.type)]: (state, { payload }) => {
            console.log({ payload });
        },
        [logout.type]: (state) => {
            state.profile = null;
        },
    },
);

export default accountReducer;
