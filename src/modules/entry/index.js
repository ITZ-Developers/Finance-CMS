import notFoundImage from '@assets/images/bg_404.png';
import { storageKeys, UserTypes } from '@constants';
import useNotification from '@hooks/useNotification';
import routes from '@routes';
import { removeCacheToken } from '@services/userService';
import { accountActions } from '@store/actions';
import { getData } from '@utils/localStorage';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
const Dashboard = () => {
    const userKind = getData(storageKeys.USER_KIND);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const notification = useNotification();
    useEffect(() => {
        if (userKind != UserTypes.ADMIN) {
            removeCacheToken();
            dispatch(accountActions.logout());
            notification({ type: 'error', message: 'Loại tài khoản không phù hợp để đăng nhập vô trang này !!!' });
        } else {
            navigate(routes.transactionListPage.path);
        }
    }, []);

    return null;
};

export default Dashboard;
