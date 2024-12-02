import { useSelector } from 'react-redux';

import accountSelectors from '@selectors/account';
import useFetchAction from './useFetchAction';
import { accountActions } from '@store/actions';
import useActionLoading from './useActionLoading';
import { getCacheAccessToken } from '@services/userService';
import { UserTypes } from '@constants';
import { useCallback } from 'react';

const useAuth = () => {
    const profile = useSelector(accountSelectors.selectProfile);
    const token = getCacheAccessToken();

    const immediate = !!token && !profile;

    useFetchAction(accountActions.getProfile, { immediate });

    const { loading } = useActionLoading(accountActions.getProfile.type);

    const permissions = profile?.group?.permissions?.map((permission) => permission.action);
    const permissionCodes = profile?.group?.permissions?.map((permission) => permission.permissionCode);
    const kind = profile?.kind;
    const isAdmin = useCallback(() => {
        if (kind === UserTypes.ADMIN) return true;
        return false;
    }, [kind]);
    const isEmployee = useCallback(() => {
        if (kind === UserTypes.EMPLOYEE) return true;
        return false;
    }, [kind]);
    const isCustomer = useCallback(() => {
        if (kind === UserTypes.CUSTOMER) return true;
        return false;
    }, [kind]);

    return {
        isAdmin,
        isEmployee,
        isCustomer,
        isAuthenticated: !!profile,
        profile,
        kind,
        permissions,
        permissionCodes,
        token,
        loading: immediate || loading,
    };
};

export default useAuth;
