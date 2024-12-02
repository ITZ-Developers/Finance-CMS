import React, { useEffect, useState } from 'react';
import useQueryParams from './useQueryParams';
import useFetch from './useFetch';
import { useParams, useLocation } from 'react-router-dom';
import { Button, Col, Modal, Row } from 'antd';
import { SaveOutlined, StopOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { showErrorMessage } from '@services/notifyService';
import { defineMessages, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import useNotification from './useNotification';
import { getSessionStorageWithExpiry } from '@utils/sessionStorage';

const message = defineMessages({
    createSuccess: 'Create {objectName} success',
    updateSuccess: 'Update {objectName} success',
    yes: 'Yes',
    cancel: 'Cancel',
    create: 'Create',
    update: 'Update',
    title: '{action, select, true {Edit} other {New}} {objectName}',
});

const closeFormMessage = defineMessages({
    closeSuccess: 'Close {objectName} successfully',
    closeTitle: 'Bạn có muốn đóng trang này?',
    ok: 'Có',
    cancel: 'Không',
});

const useSaveBase = ({
    apiConfig = {
        getById: null,
        create: null,
        update: null,
    },
    options = {
        objectName: '',
        getListUrl: '',
    },
    override,
}) => {
    const navigate = useNavigate();
    const params = useParams();
    const location = useLocation();
    const { params: queryParams, setQueryParams } = useQueryParams();
    const [detail, setDetail] = useState({});
    const [detailId, setDetailId] = useState(params.id);
    const [isSubmitting, setSubmit] = useState(false);
    const [isChanged, setChange] = useState(false);
    const [isEditing, setEditing] = useState(params.id === 'create' ? false : true);
    const { execute: executeGet, loading } = useFetch(apiConfig.getById, {
        immediate: false,
    });
    const { execute: executeCreate, loading: loadingCreate } = useFetch(apiConfig.create, { immediate: false });
    const { execute: executeUpdate, loading: loadingUpdate } = useFetch(apiConfig.update, { immediate: false });
    const intl = useIntl();
    const title = intl.formatMessage(message.title, {
        action: isEditing,
        objectName: options.objectName,
    });
    const notification = useNotification();
    const dataSessionKey = JSON.parse(getSessionStorageWithExpiry('sessionKey'));


    const mappingData = (response) => {
        if (response.result === true) return response.data;
    };

    const handleGetDetailError = (error) => {
        // console.log({ error });
    };

    const handleFetchDetail = (params) => {
        if (dataSessionKey) {
            executeGet({
                ...params,
                pathParams: { id: detailId },
                onCompleted: (response) => {
                    setDetail(mixinFuncs.mappingData(response));
                },
                onError: mixinFuncs.handleGetDetailError,
            });
        } else onBack();
    };

    const getDetail = () => {
        mixinFuncs.handleFetchDetail(detailId);
    };

    const getFormId = () => {
        return `form-${location.pathname}`;
    };

    const onBack = (isSuccess = true) => {
        const doBack = () => {
            if (location?.state?.prevPath === options.getListUrl) {
                navigate(
                    location?.state?.prevPath + location.search,
                    isSuccess && {
                        state: { listData: location.state.listData },
                    },
                );
            } else {
                navigate(options.getListUrl);
            }
        };
        doBack();
    };

    const showWarningConfirmModal = ({ onOk, title = null, ...rest } = {}) => {
        confirm({
            title: title,
            centered: true,
            width: 475,
            okType: 'danger',
            className: 'custom-confirm-modal warning',
            icon: <ExclamationCircleOutlined />,
            onOk: onOk,
            ...rest,
        });
    };

    const prepareCreateData = (data) => {
        return data;
    };

    const prepareUpdateData = (data) => {
        return {
            ...data,
            id: detail.id,
        };
    };

    const onSave = (values, callback) => {
        setSubmit(true);
        if (isEditing) {
            executeUpdate({
                data: mixinFuncs.prepareUpdateData(values),
                onCompleted: mixinFuncs.onSaveCompleted,
                onError: (err) => mixinFuncs.onSaveError(err, callback),
            });
        } else {
            executeCreate({
                data: mixinFuncs.prepareCreateData(values),
                onCompleted: mixinFuncs.onSaveCompleted,
                onError: (err) => mixinFuncs.onSaveError(err, callback),
            });
        }
    };

    const onSaveCompleted = (responseData) => {
        setSubmit(false);
        if (responseData?.data?.errors?.length) {
            mixinFuncs.onSaveError();
        } else {
            if (isEditing) {
                mixinFuncs.onUpdateCompleted(responseData);
            } else {
                mixinFuncs.onInsertCompleted(responseData);
            }
        }
    };

    const getActionName = () => {
        return isEditing ? 'Update' : 'Create';
    };

    const onUpdateCompleted = (responseData) => {
        if (responseData.result === true) {
            notification({
                message: intl.formatMessage(message.updateSuccess, {
                    objectName: options.objectName,
                }),
            });
            mixinFuncs.onBack(false);
        }
    };

    const onInsertCompleted = (responseData) => {
        if (responseData.result === true) {
            notification({
                message: intl.formatMessage(message.createSuccess, {
                    objectName: options.objectName,
                }),
            });
            mixinFuncs.onBack(false);
        }
    };

    const handleShowErrorMessage = (err, showErrorMessage) => {
        if (err && err.message) showErrorMessage(err.message);
        else showErrorMessage(`${getActionName()} failed. Please try again!`);
    };

    const onSaveError = (err, handleError) => {
        mixinFuncs.handleShowErrorMessage(err, showErrorMessage);
        setSubmit(false);
        handleError(err);
    };

    const setIsChangedFormValues = (flag) => {
        if (flag !== isChanged) {
            setChange(flag);
        }
    };

    const showCloseFormConfirm = (customDisabledSubmitValue, hiddenSubmit) => {
        const disabledSubmit = customDisabledSubmitValue !== undefined ? customDisabledSubmitValue : !isChanged;

        if (!disabledSubmit) {
            Modal.confirm({
                title: intl.formatMessage(closeFormMessage.closeTitle, { objectName: options.objectName }),
                content: '',
                okText: intl.formatMessage(closeFormMessage.ok),
                cancelText: intl.formatMessage(closeFormMessage.cancel),
                centered: true,
                onOk: () => {
                    onBack();
                },
            });
        } else {
            onBack();
        }
    };

    const renderActions = (customDisabledSubmitValue) => {
        const disabledSubmit = customDisabledSubmitValue !== undefined ? customDisabledSubmitValue : !isChanged;
        return (
            <Row justify="end" gutter={12}>
                <Col>
                    <Button
                        danger
                        key="cancel"
                        onClick={(e) => {
                            e.stopPropagation();
                            mixinFuncs.showCloseFormConfirm();
                        }}
                        icon={<StopOutlined />}
                    >
                        {intl.formatMessage(message.cancel)}
                    </Button>
                </Col>
                <Col>
                    <Button
                        key="submit"
                        htmlType="submit"
                        type="primary"
                        form={mixinFuncs.getFormId()}
                        loading={isSubmitting}
                        disabled={disabledSubmit}
                        icon={<SaveOutlined />}
                    >
                        {isEditing ? intl.formatMessage(message.update) : intl.formatMessage(message.create)}
                    </Button>
                </Col>
            </Row>
        );
    };

    const overrideHandler = () => {
        const centralizedHandler = {
            getDetail,
            handleFetchDetail,
            mappingData,
            handleGetDetailError,
            getFormId,
            renderActions,
            prepareCreateData,
            prepareUpdateData,
            onSaveCompleted,
            onUpdateCompleted,
            onInsertCompleted,
            onSaveError,
            onSave,
            executeGet,
            executeCreate,
            executeUpdate,
            setDetail,
            setEditing,
            handleShowErrorMessage,
            getActionName,
            onBack,
            showCloseFormConfirm,
            setSubmit,
        };

        override?.(centralizedHandler);

        return centralizedHandler;
    };

    const mixinFuncs = overrideHandler();

    useEffect(() => {
        if (params.id) {
            if (params.id === 'create') {
                if (dataSessionKey)
                    setEditing(false);
                else onBack();
            } else mixinFuncs.getDetail();
        }
    }, []);

    return {
        detail,
        mixinFuncs,
        loading,
        onSave,
        setIsChangedFormValues,
        isEditing,
        title,
        setEditing,
        dataSessionKey,
    };
};

export default useSaveBase;
