import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Button, Form } from 'antd';

import apiConfig from '@constants/apiConfig';
import { setCacheAccessToken } from '@services/userService';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import InputTextField from '@components/common/form/InputTextField';
import styles from './index.module.scss';
import { accountActions } from '@store/actions';
import useAuth from '@hooks/useAuth';
import useFetch from '@hooks/useFetch';
import useFetchAction from '@hooks/useFetchAction';
import Title from 'antd/es/typography/Title';
import { showErrorMessage } from '@services/notifyService';
import { appAccount, brandName, storageKeys, UserTypes } from '@constants';
import { commonMessage } from '@locales/intl';
import { Buffer } from 'buffer';
import useTranslate from '@hooks/useTranslate';
import { setData } from '@utils/localStorage';
window.Buffer = window.Buffer || Buffer;
const message = defineMessages({
    copyRight: '{brandName} - © Copyright {year}. All Rights Reserved',
    loginFail: 'Sai tên đăng nhập hoặc mật khẩu !!!',
    loginNoAccess: 'Loại tài khoản không phù hợp!!!',
    username: 'Username',
    password: 'Password',
});

const LoginPage = () => {
    const intl = useIntl();
    const translate = useTranslate();
    const base64Credentials = Buffer.from(`${appAccount.APP_USERNAME}:${appAccount.APP_PASSWORD}`).toString('base64');
    const { execute, loading } = useFetch({
        ...apiConfig.account.loginBasic,
        authorization: `Basic ${base64Credentials}`,
    });
    const { execute: executeGetProfile } = useFetchAction(accountActions.getProfile, {
        loading: useFetchAction.LOADING_TYPE.APP,
    });
    const { profile } = useAuth();

    const onFinish = (values) => {
        execute({
            data: { ...values, grant_type: 'password' },
            onCompleted: (res) => {
                if (res.user_kind != UserTypes.ADMIN) showErrorMessage(translate.formatMessage(message.loginNoAccess));
                handleLoginSuccess(res);
            },
            onError: () => showErrorMessage(translate.formatMessage(message.loginFail)),
        });
    };

    const handleLoginSuccess = (res) => {
        setCacheAccessToken(res.access_token);
        setData(storageKeys.USER_KIND, res.user_kind);
        executeGetProfile({ kind: res.user_kind });
    };

    const checkUserName = (_, value) => {
        if (value) {
            const usernameRegex = /^[a-zA-Z0-9_]{2,20}$/;
            if (!usernameRegex.test(value)) {
                return Promise.reject('Username invalid !');
            }
        } else return Promise.reject('Username invalid !');

        return Promise.resolve();
    };
    const checkPassword = (_, value) => {
        if (value) {
            const passwordRegex = /^[A-Za-z\d!@#$%^&*()_+\-=]{6,}$/;
            if (!passwordRegex.test(value)) {
                return Promise.reject('Password invalid !');
            }
        } else return Promise.reject('Password invalid !');

        return Promise.resolve();
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginForm}>
                <Title level={3}>{intl.formatMessage(commonMessage.login).toUpperCase()}</Title>
                <Form
                    name="login-form"
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <InputTextField
                        name="username"
                        fieldProps={{ prefix: <UserOutlined /> }}
                        label={intl.formatMessage(message.username)}
                        placeholder={intl.formatMessage(commonMessage.username)}
                        size="large"
                        rules={[
                            {
                                required: true,
                                validator: checkUserName,
                            },
                        ]}
                    />
                    <InputTextField
                        name="password"
                        fieldProps={{ prefix: <LockOutlined /> }}
                        label={intl.formatMessage(message.password)}
                        placeholder={intl.formatMessage(commonMessage.password)}
                        size="large"
                        type="password"
                        rules={[
                            {
                                required: true,
                                validator: checkPassword,
                            },
                        ]}
                    />

                    <Button type="primary" size="large" loading={loading} htmlType="submit" style={{ width: '100%' }}>
                        {intl.formatMessage(commonMessage.login)}
                    </Button>
                    <center className="s-mt4px">
                        <small>
                            {intl.formatMessage(message.copyRight, { brandName, year: new Date().getFullYear() })}
                        </small>
                    </center>
                </Form>
            </div>
        </div>
    );
};

export default LoginPage;
