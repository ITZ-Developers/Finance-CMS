import { sendRequest } from '@services/api';
import { useCallback, useEffect, useMemo, useState } from 'react';
import apiUrl from '@constants/apiConfig';
import useIsMounted from './useIsMounted';
import { getSessionStorageWithExpiry } from '@utils/sessionStorage';

const useFetch = (apiConfig, { immediate = false, mappingData, params = {}, pathParams = {} } = {}) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [errorCode, setErrorCode] = useState({});
    const isMounted = useIsMounted();
    const dataSessionKey = useMemo(() => getSessionStorageWithExpiry('sessionKey'));
    const execute = useCallback(
        async ({ onCompleted, onError, ...payload } = {}, cancelType) => {
            if (isMounted()) {
                setLoading(true);
                setError(null);
            }
            try {
                const { data, error } = await sendRequest(apiConfig, { params, pathParams, ...payload }, cancelType);
                error && setErrorCode(error);
                if (!data.result && data.statusCode !== 200 && apiConfig.baseURL != apiUrl.account.loginBasic.baseURL) {
                    throw data;
                }
                if (isMounted()) {
                    !cancelType && setData(mappingData ? mappingData(data) : data);
                }
                onCompleted && onCompleted(data);
                return data;
            } catch (err) {
                if (isMounted()) {
                    !cancelType && setError(err);
                }
                onError && onError(err);
                return errorCode;
            } finally {
                if (isMounted()) {
                    !cancelType && setLoading(false);
                }
            }
        },
        [apiConfig],
    );
    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate, dataSessionKey]);

    return { loading, execute, data, error, setData };
};

export default useFetch;