import { createSelector } from 'reselect';

export const isAuthenticated = createSelector([ state => state.account ], acc => acc.isAuthenticated);
export const selectProfile = createSelector([ state => state.account ], acc => acc.profile);
export const selectToken = createSelector([ state => state.account ], acc => acc.token);

const accountSelectors = {
    isAuthenticated,
    selectProfile,
    selectToken,
};

export default accountSelectors;
