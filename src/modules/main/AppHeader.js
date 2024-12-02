import React, { useState } from 'react';
import { Layout, Menu, Avatar, Space, Modal, Row, Col } from 'antd';
import {
    DownOutlined,
    UserOutlined,
    LoginOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    TranslationOutlined,
    SwapOutlined,
    PullRequestOutlined,
    ClearOutlined,
} from '@ant-design/icons';
const { Header } = Layout;

import styles from './AppHeader.module.scss';
import useAuth from '@hooks/useAuth';
import { useDispatch } from 'react-redux';
import { accountActions, appActions } from '@store/actions';
import useFetch from '@hooks/useFetch';
import apiConfig from '@constants/apiConfig';
import { getCacheAccessToken, removeCacheToken } from '@services/userService';
import { useNavigate } from 'react-router-dom';
import { apiUrl, AppConstants, DEFAULT_TABLE_ITEM_SIZE, DEFAULT_TABLE_ITEM_SIZE_10, storageKeys } from '@constants';
import { defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import useLocale from '@hooks/useLocale';
import ModalSession from '@components/common/form/entry/ModalSession';
import useDisclosure from '@hooks/useDisclosure';
import { getData } from '@utils/localStorage';
import { showErrorMessage, showSucsessMessage } from '@services/notifyService';
import axios from 'axios';
import { sessionStorageWrapper } from '@utils/sessionStorage';
import { NotificationForm } from '@components/common/form/NotificationForm';
import useValidatePermission from '@hooks/useValidatePermission';
import TextField from '@components/common/form/TextField';
import { commonMessage } from '@locales/intl';
import { BaseForm } from '@components/common/form/BaseForm';
import { useForm } from 'antd/es/form/Form';

const message = defineMessages({
    profile: 'Profile',
    logout: 'Logout',
    sessionKey: 'Session Key',
    requestKey: 'Request Key',
    locale: '{locale, select, en {Vietnamese} other {English}}',
    clearKey: 'Clear key',
});

const AppHeader = ({ collapsed, onCollapse }) => {
    const { locale } = useLocale();
    const { profile } = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { execute: executeLogout } = useFetch(apiConfig.account.logout);
    const { execute: executeRequestKey } = useFetch(apiConfig.account.exportExcel);
    const { execute: executeClearKey } = useFetch(apiConfig.account.clearKey);
    const translate = useTranslate();
    const [openedModal, handlerModal] = useDisclosure(false);
    const userAccessToken = getCacheAccessToken();
    const [openModalRequest, handlersModalRequest] = useDisclosure(false);
    const [ password, setPassword ] = useState('');

    const handleChangeLocale = () => {
        dispatch(appActions.changeLanguage(locale === 'en' ? 'vi' : 'en'));
    };

    const handleModalOpen = () => {
        handlerModal.open();
    };

    const handleClearKey = () => {
        executeClearKey({
            onCompleted: () => {
                if ( profile.isSuperAdmin != true)
                    onLogout();
                else {
                    showSucsessMessage('Clear key successfully !');
                    window.location.reload();
                }
            },
        });
    };

    const handleRequestKey = () => {
        axios({
            url: `${apiUrl}v1/account/request-key`,
            method: 'POST',
            responseType: 'blob',
            headers: {
                Authorization: `Bearer ${userAccessToken}`,
            },
            data: {
                password,
            },
        })
            .then((response) => {
                sessionStorageWrapper.removeItem('sessionKey');

                const excelBlob = new Blob([response.data], {
                    type: response.headers['content-type'],
                });

                const link = document.createElement('a');

                link.href = URL.createObjectURL(excelBlob);
                link.download = `request_session_key.txt`;
                link.click();
                showSucsessMessage('Tạo tệp session key thành công !');
                setPassword('');
                form.resetFields();
                handlersModalRequest.close();
                window.location.reload();
            })
            .catch((error) => {
                showErrorMessage('Tạo tệp session key thất bại !');
                setPassword('');
                form.resetFields();
                handlersModalRequest.close();
            });
    };

    const onLogout = () => {
        sessionStorageWrapper.removeItem('sessionKey');
        removeCacheToken();
        dispatch(accountActions.logout());
    };

    const {
        data: dataMyNotification,
        execute: executeGetDataMyNotification,
        loading: loadingDataMyNotification,
    } = useFetch(apiConfig.notification.myNotification, {
        immediate: true,
        parmas: {
            size: DEFAULT_TABLE_ITEM_SIZE_10,
        },
        mappingData: ({ data }) => {
            const pageTotal = data?.totalPages;
            const unReadTotal = data?.totalUnread;
            const listNotification = data?.content?.map((item) => item);
            return {
                pageTotal,
                unReadTotal,
                listNotification,
            };
        },
    });
    const { execute: executeUpdateState } = useFetch(apiConfig.notification.changeState, {
        immediate: false,
    });

    const validatePermission = useValidatePermission();

    function makeNavs(navs) {
        return navs.map((nav) => {
            const newNav = { ...nav };
            if (newNav.permission || newNav.kind) {
                if (!validatePermission(newNav.permission)) {
                    return null;
                }
            }
            if (newNav.children) {
                newNav.children = makeNavs(nav.children);
                if (newNav.children.every((item) => item === null)) {
                    return null;
                }
            }

            return newNav;
        });
    }

    const navMenuConfig = [
        {
            key: 'menu',
            label: (
                <Space>
                    <Avatar
                        icon={<UserOutlined />}
                        src={profile.avatarPath && `${AppConstants.contentRootUrl}${profile.avatarPath}`}
                    />
                    {profile?.fullName}
                    <DownOutlined />
                </Space>
            ),
            children: [
                {
                    label: translate.formatMessage(message.profile),
                    icon: <UserOutlined />,
                    key: 'profile',
                    onClick: () => navigate('/profile'),
                },
                {
                    label: translate.formatMessage(message.clearKey),
                    icon: <ClearOutlined />,
                    key: 'clearKey',
                    onClick: handleClearKey,
                    permission: [apiConfig.account.clearKey.baseURL],
                },
                // {
                //     label: translate.formatMessage(message.sessionKey),
                //     icon: <SwapOutlined />,
                //     key: 'sessionKey',
                //     onClick: handleModalOpen,
                // },
                {
                    label: translate.formatMessage(message.requestKey),
                    icon: <PullRequestOutlined />,
                    key: 'requestKey',
                    onClick: () => handlersModalRequest.open(),

                    
                },
                // {
                //     label: translate.formatMessage(message.locale, { locale }),
                //     key: 'locale',
                //     icon: <TranslationOutlined />,
                //     onClick: handleChangeLocale,
                // },
                {
                    label: translate.formatMessage(message.logout),
                    icon: <LoginOutlined />,
                    key: 'logout',
                    onClick: onLogout,
                },
            ],
        },
        {
            key: 'notification',
            label: (
                <NotificationForm
                    data={dataMyNotification?.listNotification}
                    executeGetData={executeGetDataMyNotification}
                    executeUpdateState={executeUpdateState}
                    loading={loadingDataMyNotification}
                    unReadTotal={dataMyNotification?.unReadTotal}
                    pageTotal={dataMyNotification?.pageTotal}
                />
            ),
        },
    ];

    const [ form ] = useForm();

    return (
        <Header className={styles.appHeader} style={{ padding: 0, background: 'white' }}>
            <span className={styles.iconCollapse} onClick={onCollapse}>
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>
            <Menu
                mode="horizontal"
                className={styles.rightMenu}
                selectedKeys={[]}
                items={makeNavs(navMenuConfig)}
            />
            <ModalSession open={openedModal} close={() => handlerModal.close()} handlerModal={handlerModal} />
            <Modal
                centered
                open={openModalRequest}
                onCancel={() => handlersModalRequest.close()}
                // footer={null}
                title={'Clear enter your password'}
                width={600}
                styles={{
                    header: { marginBottom: 20 },
                    footer: { marginTop: 0 },
                }}
                onOk={() => handleRequestKey()}
                okButtonProps={{
                    disabled: password == '',
                }}
                cancelButtonProps={{
                    style: { color: '#cf1322',
                        background: '#fff1f0',
                        borderColor: '#ffa39e',
                    },          
                }}
            >
                <BaseForm form={form} style={{ width: '100%' }}>
                    <Row gutter={10}>
                        <Col span={24}>
                            <TextField
                                type="password"
                                label={translate.formatMessage(commonMessage.password)}
                                required
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                }}                               
                            />
                        </Col>
                    </Row>
                </BaseForm>
            </Modal>
        </Header>
    );
};

export default AppHeader;
