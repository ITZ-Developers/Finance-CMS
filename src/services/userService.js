import { storageKeys } from "@constants";
import { getData, removeItem, setData } from "@utils/localStorage";

const { USER_ACCESS_TOKEN, USER_REFRESH_TOKEN, USER_EMAIL } = storageKeys;

export const getCacheAccessToken = () => getData(USER_ACCESS_TOKEN);

export const getCacheRefreshToken = () => getData(USER_REFRESH_TOKEN);

export const setCacheAccessToken = (accessToken) => setData(USER_ACCESS_TOKEN, accessToken);

export const setCacheRefreshToken = (refreshToken) => setData(USER_REFRESH_TOKEN, refreshToken);

export const setCacheToken = (accessToken, refreshToken) => {
    setCacheAccessToken(accessToken);
    setCacheRefreshToken(refreshToken);
};

export const removeCacheAccessToken = () => removeItem(USER_ACCESS_TOKEN);

export const removeCacheRefreshToken = () => removeItem(USER_REFRESH_TOKEN);

export const removeCacheToken = () => {
    removeCacheAccessToken();
    removeCacheRefreshToken();
};

export const setCacheUserEmail = email => setData(USER_EMAIL, email);

export const getCacheUserEmail = () => getData(USER_EMAIL);
