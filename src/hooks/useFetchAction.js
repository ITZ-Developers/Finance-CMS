import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { appActions } from '@store/actions';
import { createFailureActionType, createSuccessActionType } from '@store/utils';
import useActionLoading from './useActionLoading';
import { showErrorMessage } from '@services/notifyService';

const { showAppLoading, hideAppLoading, toggleActionLoading } = appActions;

const handleByType = (typeConfig, handler) => {
    if (!typeConfig) {
        return;
    }

    if (Array.isArray(typeConfig)) {
        for (let type of typeConfig) {
            handler?.[type]?.();
        }
    } else {
        handler?.[typeConfig]?.();
    }
};

const coverFunction = (func, data, ...restParams) => {
    if (typeof func !== 'function') {
        return data;
    }

    return func(data, ...restParams);
};

const LOADING_TYPE = {
    REDUX: 'REDUX',
    APP: 'APP',
};

const useFetchAction = (
    action,
    { immediate = false, prepareSuccessData, payload, loading = LOADING_TYPE.REDUX } = {},
) => {
    const dispatch = useDispatch();
    const isLoading = useActionLoading(action.type);

    const execute = async (payload = {}) => {
        handleByType(loading, {
            [LOADING_TYPE.REDUX]: () => dispatch(toggleActionLoading({ type: action.type, isLoading: true })),
            [LOADING_TYPE.APP]: () => dispatch(showAppLoading()),
        });

        try {
            const response = await new Promise((resolve, reject) => {
                dispatch(
                    action({
                        ...payload,
                        onCompleted: (response) => resolve(response?.data || {}),
                        onError: (err) => {
                            reject();
                            showErrorMessage('ERROR SYSTEM NOT READY');
                        },
                    }),
                );
            });

            dispatch({
                type: createSuccessActionType(action.type),
                payload: coverFunction(prepareSuccessData, response, payload),
            });
        } catch (error) {
            console.log({ error });
            dispatch({ type: createFailureActionType(action.type), payload: error });
        } finally {
            handleByType(loading, {
                [LOADING_TYPE.REDUX]: () => dispatch(toggleActionLoading({ type: action.type, isLoading: false })),
                [LOADING_TYPE.APP]: () => dispatch(hideAppLoading()),
            });
        }
    };

    useEffect(() => {
        if (immediate) {
            execute(payload);
        }
    }, []);

    return { execute, loading: isLoading };
};

useFetchAction.LOADING_TYPE = LOADING_TYPE;

export default useFetchAction;
