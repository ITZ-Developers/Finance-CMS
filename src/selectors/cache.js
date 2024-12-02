import { createSelector } from 'reselect';

export const selectCacheByName = name => createSelector(
    state => state.cache.cacheData,
    cacheData => cacheData[name],
);
