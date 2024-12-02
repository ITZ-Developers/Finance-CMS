import { createAction, createSuccessActionType } from '@store/utils';

export const login = createAction('account/LOGIN');
export const loginSuccess = createAction(createSuccessActionType(login.type));
export const logout = createAction('account/LOGOUT');
export const getProfile = createAction('account/GET_PROFILE');
export const getProfileSuccess = createAction(createSuccessActionType(getProfile.type));

export const actions = {
    login,
    loginSuccess,
    getProfile,
    logout,
    getProfileSuccess,
};
