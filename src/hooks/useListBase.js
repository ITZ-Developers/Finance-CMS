import React, { useEffect, useMemo, useState } from 'react';
import useQueryParams from './useQueryParams';
import {
    commonStatus,
    commonStatusColor,
    DEFAULT_TABLE_ISPAGED,
    DEFAULT_TABLE_ITEM_SIZE,
    DEFAULT_TABLE_PAGE_START,
    STATUS_INACTIVE,
    storageKeys,
} from '@constants';

import { Modal, Button, Divider, Tag, Form, Col, Row, Flex } from 'antd';
import { DeleteOutlined, LockOutlined, CheckOutlined, EditOutlined } from '@ant-design/icons';

import { defineMessages, useIntl } from 'react-intl';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ActionBar from '@components/common/elements/ActionBar';
import useFetch from './useFetch';
import useNotification from './useNotification';
import SearchForm from '@components/common/form/SearchForm';
import HasPermission from '@components/common/elements/HasPermission';
import useAuth from './useAuth';
import { removePemFormat, validatePermission } from '@utils';
import { BaseTooltip } from '@components/common/form/BaseTooltip';
import { getData } from '@utils/localStorage';
import TextField from '@components/common/form/TextField';
import { BaseForm } from '@components/common/form/BaseForm';
import { showErrorMessage, showSucsessMessage } from '@services/notifyService';
import ModalSession from '@components/common/form/entry/ModalSession';
import PageNotSessionKey from '@components/common/page/PageNotSessionKey';
import { getSessionStorageWithExpiry, sessionStorageWrapper } from '@utils/sessionStorage';
import apiConfigSystem from '@constants/apiConfig';

const message = defineMessages({
    deleteConfirm: {
        title: {
            id: 'hook.useListBase.deleteConfirm.title',
            defaultMessage: 'Bạn có chắc chắn muốn xóa {objectName} này không?',
        },
        ok: {
            id: 'hook.useListBase.deleteConfirm.ok',
            defaultMessage: 'Có',
        },
        cancel: {
            id: 'hook.useListBase.deleteConfirm.cancel',
            defaultMessage: 'Không',
        },
    },
    changeStatusConfirm: {
        title: {
            id: 'hook.useListBase.deleteConfirm.title',
            defaultMessage: 'Bạn có chắc chắn muốn khóa {objectName} này không?',
        },
        ok: {
            id: 'hook.useListBase.deleteConfirm.ok',
            defaultMessage: 'Có',
        },
        cancel: {
            id: 'hook.useListBase.deleteConfirm.cancel',
            defaultMessage: 'Không',
        },
    },
    tableColumn: {
        action: {
            id: 'hook.useListBase.tableColumn.action',
            defaultMessage: 'Hành động',
        },
        status: {
            title: {
                id: 'hook.useListBase.tableColumn.status.title',
                defaultMessage: 'Trạng thái',
            },
            [commonStatus.ACTIVE]: {
                id: 'hook.useListBase.tableColumn.status.active',
                defaultMessage: 'Hoạt động',
            },
            [commonStatus.PENDING]: {
                id: 'hook.useListBase.tableColumn.status.pending',
                defaultMessage: 'Đang chờ',
            },
            [commonStatus.INACTIVE]: {
                id: 'hook.useListBase.tableColumn.status.lock',
                defaultMessage: 'Khóa',
            },
            [commonStatus.DELETE]: {
                id: 'hook.useListBase.tableColumn.status.delete',
                defaultMessage: 'Đã xoá',
            },
        },
    },
    notification: {
        deleteSuccess: {
            id: 'hook.useListBase.notification.deleteSuccess',
            defaultMessage: 'Xóa {objectName} thành công',
        },
    },
});

const notificationMessage = defineMessages({
    deleteSuccess: 'Delete {objectName} successfully',
    deleteTitle: 'Are you sure delete this {objectName}?',
    verifyTitle: 'You must enter private key',
    ok: 'Yes',
    cancel: 'No',
    verify: 'Verify',
});

const useListBase = ({
    apiConfig = {
        getList: null,
        delete: null,
        create: null,
        update: null,
        getById: null,
        changeStatus: null,
        verify: null,
    },
    options = {
        objectName: '',
        pageSize: DEFAULT_TABLE_ITEM_SIZE,
        isPaged: DEFAULT_TABLE_ISPAGED,
    },
    tabOptions = {
        queryPage: {},
        isTab: false,
    },
    isSessionKey = false,
    override,
    localSearch = false,
} = {}) => {
    const { params: queryParams, setQueryParams, serializeParams, deserializeParams } = useQueryParams();
    const [data, setData] = useState(0);
    const [loading, setLoading] = useState(false);
    const { execute: executeGetList } = useFetch(apiConfig.getList);
    const { execute: executeDelete } = useFetch(apiConfig.delete);
    const { execute: executeVerify } = useFetch(apiConfigSystem.account.verify);
    const [currentPageTab, setCurrentPageTab] = useState(0);
    const [form] = Form.useForm();
    const dataSessionKey = JSON.parse(getSessionStorageWithExpiry('sessionKey'));
    const [checkKey, setCheckKey] = useState(!!dataSessionKey);
    const [pagination, setPagination] = useState({
        pageSize: options.pageSize,
        isPaged: options.isPaged,
        total: 0,
        current: 1,
    });
    const notification = useNotification();
    const { pathname: pagePath } = useLocation();
    const { permissions } = useAuth();
    const navigate = useNavigate();
    const intl = useIntl();
    const { profile } = useAuth();

    const queryFilter = useMemo(() => deserializeParams(queryParams), [queryParams]);

    const hasPermission = (requiredPermissions) => {
        return validatePermission(requiredPermissions, permissions);
    };

    const mappingData = (response) => {
        return {
            data: response.data.content,
            total: response.data.totalElements,
        };
    };

    const handleGetListError = (error) => {
        if (error.code == 'ERROR-PRIVATE-KEY-INVALID')
            notification({ type: 'error', message: 'Private key invalid' });
        else
            notification({ type: 'error', message: 'Get list error' });
    };

    const onCompletedGetList = (response) => {
        const { data, total } = mixinFuncs.mappingData(response);

        setData(data || []);
        setPagination((p) => ({ ...p, total }));
    };

    const prepareGetListPathParams = () => {
        return {};
    };

    const handleFetchList = (params) => {
        if (!apiConfig.getList) throw new Error('apiConfig.getList is not defined');
        setLoading(true);
        executeGetList({
            pathParams: mixinFuncs.prepareGetListPathParams(),
            params,
            onCompleted: (response) => {
                mixinFuncs.onCompletedGetList(response);
                setLoading(false);
            },
            onError: (error) => {
                setLoading(false);
                if (error.code == 'ERROR-NOT-READY' && profile.isSuperAdmin == true) {
                    confirm();
                }
                else {
                    mixinFuncs.handleGetListError(error);
                }
            },
        });
    };

    const confirm = () => {
        const handleFinish = () => {
            const values = form.getFieldsValue();
            executeVerify({
                data: {
                    privateKey: removePemFormat(values.privateKey),
                },
                onCompleted: (res) => {
                    Modal.destroyAll();
                    form.resetFields();
                    // sessionStorage.clear();
                    showSucsessMessage('Verify key success');
                    mixinFuncs.getList();
                },
                onError: (error) => {
                    mixinFuncs.handleGetListError(error);
                    setLoading(false);
                    form.resetFields();
                },
            });
        };
        return Modal.confirm({
            title: intl.formatMessage(notificationMessage.verifyTitle),
            footer: null,
            width: '520px',
            content: (
                <div>
                    <BaseForm
                        form={form}
                        onFinish={(values) => {
                            handleFinish(values);
                        }}
                        size="100%"
                    >
                        <div style={{ marginTop: 10, marginLeft: '-30px' }}>
                            <Row>
                                <Col span={24}>
                                    <TextField
                                        label={'Private key'}
                                        name="privateKey"
                                        type="textarea"
                                        style={{ height: 200 }}
                                        required
                                    />
                                </Col>
                            </Row>
                            <Row justify={'end'}>
                                {/* <Button onClick={handleCancel}>Cancel</Button> */}
                                {/* <Button type="dashed" style={{ marginLeft: 5 }} onClick={handleDeleteKey} disabled={!dataValueKey}>Delete key</Button> */}
                                <Button key="submit" htmlType="submit" type="primary" style={{ marginLeft: 5 }}>
                                    {'Verify'}
                                </Button>
                            </Row>
                        </div>
                    </BaseForm>
                </div>
            ),
            okText: intl.formatMessage(notificationMessage.verify),
            cancelText: intl.formatMessage(notificationMessage.cancel),
            // centered: true,
            onOk: () => {
                handleFinish();
            },
        });
    };

    const prepareGetListParams = (filter) => {
        if (localSearch) {
            let copyFilter = { };
            copyFilter.isPaged = options.isPaged;

            return copyFilter;
        } else {
            let copyFilter = { ...filter };
            let page = parseInt(queryParams.get('page'));
            if (tabOptions.isTab) {
                copyFilter = { ...filter, ...options.queryPage };
                page = parseInt(currentPageTab);
            }

            copyFilter.page = page > 0 ? page - 1 : DEFAULT_TABLE_PAGE_START;

            copyFilter.size = options.pageSize;
            copyFilter.isPaged = options.isPaged;

            return copyFilter;
        }
    };

    const handleStorageChange = () => {

        const handleStorageChange = (event) => {
            if (event.key === 'sessionKey') {
                const dataValueKey = JSON.parse(getSessionStorageWithExpiry('sessionKey'));
                if (dataValueKey?.decrytSecretKey) {
                    setCheckKey(true);
                } else setCheckKey(false);
            } else {
                setCheckKey(false);
            }
        };
        if (dataSessionKey?.decrytSecretKey) {
            setCheckKey(true);
        } else {
            window.addEventListener('sessionStorageChange', handleStorageChange);
            return () => {
                window.removeEventListener('sessionStorageChange', handleStorageChange);
            };
        }
    };

    const getList = (filter) => {
        let params = mixinFuncs.prepareGetListParams(queryFilter);
        if (tabOptions.isTab) {
            params = mixinFuncs.prepareGetListParams({ ...tabOptions.queryPage, ...filter });
        }
        // if (isSessionKey) {
        //     !checkKey && handleStorageChange();
        //     if (checkKey) mixinFuncs.handleFetchList({ ...params });
        // } else mixinFuncs.handleFetchList({ ...params });
        if (tabOptions.queryPage) {
            mixinFuncs.handleFetchList({ ...params, ...tabOptions.queryPage });
        } else mixinFuncs.handleFetchList({ ...params });
    };

    const changeFilter = (filter) => {
        if (tabOptions.isTab) {
            mixinFuncs.getList(filter);
        } else {
            setQueryParams(serializeParams(filter));
        }
    };

    function changePagination(page) {
        if (tabOptions.isTab) {
            setCurrentPageTab(page.current);
        } else {
            queryParams.set('page', page.current);
            setQueryParams(queryParams);
        }
    }

    const handleDeleteItemError = (error) => {
        notification({ type: 'error', message: error.message || `Delete ${options.objectName} failed` });
    };

    const onDeleteItemCompleted = (id) => {
        let currentPage = queryParams.get('page');
        if (tabOptions.isTab) {
            currentPage = currentPageTab;
        }
        if (data.length === 1 && currentPage > 1) {
            if (tabOptions.isTab.isTab) {
                setCurrentPageTab(currentPage - 1);
            } else {
                queryParams.set('page', currentPage - 1);
                setQueryParams(queryParams);
            }
        } else {
            mixinFuncs.getList();
            // setData((data) => data.filter((item) => item.id !== id));
        }
    };

    const handleDeleteItem = (id) => {
        setLoading(true);
        executeDelete({
            pathParams: { id },
            onCompleted: (response) => {
                mixinFuncs.onDeleteItemCompleted(id);

                notification({
                    message: intl.formatMessage(message.notification.deleteSuccess, {
                        objectName: options.objectName,
                    }),
                });
            },
            onError: (error) => {
                mixinFuncs.handleDeleteItemError(error);
                setLoading(false);
            },
        });
    };

    const showDeleteItemConfirm = (id) => {
        if (!apiConfig.delete) throw new Error('apiConfig.delete is not defined');

        Modal.confirm({
            title: intl.formatMessage(message.deleteConfirm.title, { objectName: options.objectName }),
            content: '',
            okText: intl.formatMessage(message.deleteConfirm.ok),
            cancelText: intl.formatMessage(message.deleteConfirm.cancel),
            onOk: () => {
                mixinFuncs.handleDeleteItem(id);
            },
        });
    };

    const handleChangeStatusError = (error) => {
        notification({ type: 'error', message: error.message });
    };

    // This function is currently not needed
    const handleChangeStatus = (id, status) => {};

    const showChangeStatusConfirm = (id, status) => {
        if (!apiConfig.changeStatus) throw new Error('apiConfig.changeStatus is not defined');

        Modal.confirm({
            title: intl.formatMessage(message.changeStatusConfirm.title, { objectName: options.objectName }),
            content: '',
            okText: intl.formatMessage(message.changeStatusConfirm.ok),
            cancelText: intl.formatMessage(message.changeStatusConfirm.cancel),
            onOk: () => {
                mixinFuncs.handleChangeStatus(id, status);
            },
        });
    };

    const additionalActionColumnButtons = () => {
        return {};
    };

    const actionColumnButtons = (additionalButtons = {}) => ({
        delete: ({ id, buttonProps }) => {
            if (!mixinFuncs.hasPermission(apiConfig.delete?.baseURL)) return null;

            return (
                <BaseTooltip type="delete" objectName={options.objectName}>
                    <Button
                        {...buttonProps}
                        type="link"
                        onClick={(e) => {
                            e.stopPropagation();
                            mixinFuncs.showDeleteItemConfirm(id);
                        }}
                        style={{ padding: 0 }}
                    >
                        <DeleteOutlined style={{ color: 'red' }} />
                    </Button>
                </BaseTooltip>
            );
        },
        changeStatus: ({ id, status, buttonProps }) => {
            return (
                <Button
                    {...buttonProps}
                    type="link"
                    onClick={(e) => {
                        e.stopPropagation();
                        mixinFuncs.showChangeStatusConfirm(id, !status);
                    }}
                    style={{ padding: 0 }}
                >
                    {status === commonStatus.ACTIVE ? <LockOutlined /> : <CheckOutlined />}
                </Button>
            );
        },
        edit: ({ buttonProps, ...dataRow }) => {
            if (!mixinFuncs.hasPermission([apiConfig.update?.baseURL, apiConfig.getById?.baseURL]))
                return null;

            return (
                <BaseTooltip type="edit" objectName={options.objectName}>
                    <Button
                        {...buttonProps}
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(mixinFuncs.getItemDetailLink(dataRow), {
                                state: { action: 'edit', prevPath: location.pathname },
                            });
                        }}
                        type="link"
                        style={{ padding: 0 }}
                    >
                        <EditOutlined color="red" />
                    </Button>
                </BaseTooltip>
            );
        },
        ...additionalButtons,
    });

    const createActionColumnButtons = (actions, data) => {
        const actionButtons = [];
        const buttons = mixinFuncs.actionColumnButtons(mixinFuncs.additionalActionColumnButtons());

        Object.entries(actions).forEach(([key, value]) => {
            let _value = value;
            if (typeof value === 'function') {
                _value = value(data);
            }
            if (_value && buttons[key]) {
                actionButtons.push(buttons[key]);
            }
        });

        return actionButtons;
    };

    const checkPermission = (actions) => {
        let isShow = false;
        Object.entries(actions).forEach(([type, value]) => {
            if (value || value?.show) {
                switch (type) {
                                case 'delete':
                                    if (mixinFuncs.hasPermission(apiConfig.delete?.baseURL)) isShow = true;
                                    break;
                                case 'edit':
                                    if (mixinFuncs.hasPermission([apiConfig.update?.baseURL, apiConfig.getById?.baseURL]))
                                        isShow = true;
                                    break;
                                default:
                                    // if (mixinFuncs.hasPermission(value?.permissions)) isShow = true;
                                    isShow = true;
                                    break;
                }
                return;
            }
        });
        return isShow;
    };

    const renderActionColumn = (
        action = { edit: false, delete: false, changeStatus: false },
        columnsProps,
        buttonProps,
        titleProps,
    ) => {
        const isRender = checkPermission(action);
        if (!isRender) return;
        return {
            align: 'center',
            title: (
                <Flex gap={8} justify='center' align='center'>
                    <span>{intl.formatMessage(message.tableColumn.action)}</span>
                    {titleProps && (<span>{titleProps}</span>)}
                </Flex>
            ),
            ...columnsProps,
            render: (data) => {
                const buttons = [];
                const actionButtons = mixinFuncs.createActionColumnButtons(action, data);
                actionButtons.forEach((ActionItem, index) => {
                    if (ActionItem({ ...data, ...buttonProps })) {
                        buttons.push(ActionItem);
                    }
                });

                return (
                    <span>
                        {buttons.map((ActionItem, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && <Divider type="vertical" />}
                                <span>
                                    {ActionItem({ ...data, ...buttonProps }) ? (
                                        <ActionItem {...data} {...buttonProps} />
                                    ) : null}
                                </span>
                            </React.Fragment>
                        ))}
                    </span>
                );
            },
        };
    };

    const renderIdColumn = (columnsProps) => ({
        title: 'ID',
        dataIndex: 'id',
        width: '50px',
        align: 'left',
        ...columnsProps,
    });

    const renderStatusColumn = (columnsProps) => {
        return {
            title: intl.formatMessage(message.tableColumn.status.title),
            dataIndex: 'status',
            align: 'center',
            ...columnsProps,
            render: (status) => (
                <Tag color={commonStatusColor[status]}>
                    <div style={{ padding: '0 4px', fontSize: 14 }}>
                        {intl.formatMessage(message.tableColumn.status[status])}
                    </div>
                </Tag>
            ),
        };
    };

    const getItemDetailLink = (dataRow) => {
        return `${pagePath}/${dataRow.id}`;
    };

    const getCreateLink = () => {
        return `${pagePath}/create`;
    };

    const renderActionBar = ({ type, style, onBulkDelete, selectedRows = [] } = {}) => {
        return (
            <ActionBar
                createPermission={apiConfig.create?.baseURL}
                selectedRows={selectedRows}
                onBulkDelete={onBulkDelete}
                objectName={options.objectName}
                createLink={mixinFuncs.getCreateLink()}
                location={location}
                type={type}
                style={style}
            />
        );
    };

    const handleFilterSearchChange = (values) => {
        mixinFuncs.changeFilter(values);
    };

    const renderSearchForm = ({
        fields = [],
        getFormInstance,
        hiddenAction,
        className,
        initialValues,
        onSearch,
        onReset,
        alignSearchField = 'left',
        activeTab,
        hidenClearAction,
        searchLocal,
    }) => {
        return (
            <SearchForm
                activeTab={activeTab}
                getFormInstance={getFormInstance}
                alignSearchField={alignSearchField}
                fields={fields}
                initialValues={initialValues}
                onSearch={(values) => {
                    mixinFuncs.handleFilterSearchChange(values);
                    onSearch?.(values);
                }}
                hiddenAction={hiddenAction}
                hidenClearAction={hidenClearAction}
                className={className}
                onReset={() => {
                    mixinFuncs.changeFilter({});
                    onReset?.();
                }}
                searchLocal={searchLocal}
            />
        );
    };

    const filterLanguage = (dataRow = []) => {
        let renderItem;
        dataRow.filter((item) => {
            if (item.languageId === '1') renderItem = item;
        });
        return renderItem || {};
    };

    const overrideHandler = () => {
        const centralizedHandler = {
            hasPermission,
            mappingData,
            handleGetListError,
            handleFetchList,
            prepareGetListParams,
            getList,
            changeFilter,
            showDeleteItemConfirm,
            handleDeleteItem,
            handleDeleteItemError,
            createActionColumnButtons,
            showChangeStatusConfirm,
            handleChangeStatus,
            handleChangeStatusError,
            renderActionColumn,
            renderIdColumn,
            getItemDetailLink,
            getCreateLink,
            renderStatusColumn,
            changePagination,
            additionalActionColumnButtons,
            renderActionBar,
            onCompletedGetList,
            onDeleteItemCompleted,
            filterLanguage,
            renderSearchForm,
            handleFilterSearchChange,
            prepareGetListPathParams,
            actionColumnButtons,
            setQueryParams,
        };

        override?.(centralizedHandler);

        return centralizedHandler;
    };

    const mixinFuncs = overrideHandler();

    useEffect(() => {
        mixinFuncs.getList();

        let page = parseInt(queryFilter.page);
        // if (tabOptions) {
        //     page = parseInt(currentPageTab);
        // }
        if (page > 0 && page !== pagination.current) {
            setPagination((p) => ({ ...p, current: page }));
        } else if (page < 1) {
            setPagination((p) => ({ ...p, current: 1 }));
        }
    }, [pagePath, currentPageTab, checkKey]);

    useEffect(() => {
        if (localSearch == false)
            mixinFuncs.getList();

        let page = parseInt(queryFilter.page);
        // if (tabOptions) {
        //     page = parseInt(currentPageTab);
        // }
        if (page > 0 && page !== pagination.current) {
            setPagination((p) => ({ ...p, current: page }));
        } else if (page < 1) {
            setPagination((p) => ({ ...p, current: 1 }));
        }
    }, [queryParams]);

    return {
        loading,
        data,
        setData,
        queryFilter,
        actionColumnButtons,
        changeFilter,
        changePagination,
        pagination,
        mixinFuncs,
        getList,
        setLoading,
        pagePath,
        serializeParams,
        queryParams,
        dataSessionKey,
        checkKey,
        setCheckKey,
        setPagination,
    };
};

export default useListBase;
