import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import { Avatar, Button, Col, Flex, Form, Modal, Row, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import BaseTable from '@components/common/table/BaseTable';

import { UserOutlined } from '@ant-design/icons';
import { AppConstants, DEFAULT_FORMAT, DEFAULT_TABLE_ISPAGED_0, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import { defineMessages, FormattedMessage } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import AvatarField from '@components/common/form/AvatarField';
import { commonMessage } from '@locales/intl';
import useAuth from '@hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { convertUtcToLocalTime, decryptValue, orderNumber, priceValue, sortArray } from '@utils';
import { kindOptions, kindPeriodOptions } from '@constants/masterData';
import { getSessionStorageWithExpiry } from '@utils/sessionStorage';
import PageNotSessionKey from '@components/common/page/PageNotSessionKey';
import { FieldTypes } from '@constants/formConfig';
import { render } from '@testing-library/react';
import { BaseForm } from '@components/common/form/BaseForm';
import useDisclosure from '@hooks/useDisclosure';
import NumericField from '@components/common/form/MoneyField';
import useFetch from '@hooks/useFetch';
import { showErrorMessage, showSucsessMessage } from '@services/notifyService';
import { BaseTooltip } from '@components/common/form/BaseTooltip';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { values } from 'lodash';

const ServiceScheduleListPage = ({ pageOptions }) => {
    const translate = useTranslate();
    const { isAdmin } = useAuth();
    const location = useLocation();
    const { pathname: pagePath } = useLocation();
    const search = location.search;
    const kindValues = translate.formatKeys(kindPeriodOptions, ['label']);
    const dataValueKey = JSON.parse(getSessionStorageWithExpiry('sessionKey'));
    const [checkKey, setCheckKey] = useState(false);
    const [openedModal, handlerModal] = useDisclosure(false);
    const [form] = Form.useForm();
    const queryParameters = new URLSearchParams(window.location.search);
    const serviceId = queryParameters.get('serviceId');
    const [idScheduleEdit, setIdScheduleEdit] = useState(null);
    const [disabledSave, setDisabledSave] = useState(true);
    const [dataSchedule, setDataSchedule] = useState([]);
    const { execute: executeServiceSchedule } = useFetch(apiConfig.serviceSchedule.update, {
        immediate: false,
    });

    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: {
            getList: apiConfig.serviceSchedule.getList,
            getById: apiConfig.serviceSchedule.getById,
            update: apiConfig.serviceSchedule.update,
            delete: apiConfig.serviceSchedule.delete,
        },
        options: {
            // pageSize: DEFAULT_TABLE_ITEM_SIZE,
            isPaged: DEFAULT_TABLE_ISPAGED_0,
            objectName: translate.formatMessage(pageOptions.objectName),
        },
        override: (funcs) => {
            funcs.mappingData = (response) => {
                if (response.result === true && response?.data?.totalElements > 0) {
                    setDataSchedule(sortArray(response.data.content, 'numberOfDueDays'));
                    return {
                        data: response.data.content,
                        total: response.data.totalElements,
                    };
                } else return {};
            };
            funcs.additionalActionColumnButtons = () => ({
                edit: ({ id, numberOfDueDays }) => (
                    <BaseTooltip title={`Edit service schedule`}>
                        <Button
                            type="link"
                            style={{ padding: '0' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIdScheduleEdit(id);
                                form.setFieldValue('numberOfDueDays', numberOfDueDays);
                                window.scrollTo(0, 0);
                            }}
                        >
                            <EditOutlined />
                        </Button>
                    </BaseTooltip>
                ),
                delete: ({ id, numberOfDueDays }) => (
                    <BaseTooltip title={`Delete service schedule`}>
                        <Button
                            type="link"
                            style={{ padding: '0', color: 'red' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                removeItem(numberOfDueDays);
                            }}
                        >
                            <DeleteOutlined />
                        </Button>
                    </BaseTooltip>
                ),
            });
        },
    });
    const columns = [
        {
            dataIndex: 'numberOfDueDays',
            render: (dataRow) => {
                const value = dataRow == 1 ? `${dataRow} day` : `${dataRow} days`;
                return (
                    <span>
                        Reminder <strong>{value}</strong> in advance
                    </span>
                );
            },
        },
        mixinFuncs.renderActionColumn({ edit: true, delete: true }, { width: '120px' }),
    ];

    const searchFields = [
        {
            key: 'serviceGroupId',
            placeholder: translate.formatMessage(commonMessage.groupService),
            type: FieldTypes.AUTOCOMPLETE,
            apiConfig: apiConfig.groupService.autocomplete,
            mappingOptions: (item) => ({
                value: item.id,
                label: item.name,
            }),
            searchParams: (text) => ({ name: text }),
            submitOnChanged: true,
        },
    ];

    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === 'sessionKey') {
                const dataValueKey = JSON.parse(getSessionStorageWithExpiry('sessionKey'));
                if (dataValueKey?.decrytSecretKey) setCheckKey(true);
                else setCheckKey(false);
            } else {
                setCheckKey(false);
            }
        };
        if (dataValueKey?.decrytSecretKey) {
            setCheckKey(true);
        } else {
            window.addEventListener('sessionStorageChange', handleStorageChange);
            return () => {
                window.removeEventListener('sessionStorageChange', handleStorageChange);
            };
        }
    }, []);

    const handleFinish = (values) => {
        const matchedItem = dataSchedule.find((item) => item.numberOfDueDays == values?.numberOfDueDays);
        if (!idScheduleEdit) {
            if (matchedItem) showErrorMessage('Number Of Due Days already exists!');
            else {
                const newItem = { numberOfDueDays: values?.numberOfDueDays, serviceId: serviceId };
                setDataSchedule((prevDataSchedule) => {
                    const updatedDataSchedule = [...prevDataSchedule, newItem];
                    return sortArray(updatedDataSchedule, 'numberOfDueDays');
                });
                form.resetFields();
                showSucsessMessage('Add service schedule successfully!!');
            }
        } else {
            if (matchedItem) {
                showErrorMessage('Number Of Due Days already exists!');
            } else {
                updateItem(idScheduleEdit, form.getFieldValue('numberOfDueDays'));
                showSucsessMessage('Update service schedule successfully!!');
            }
        }
    };

    const onValuesChange = (changedValues, allValues) => {
        setDisabledSave(false);
    };

    const updateItem = (idEdit, updatedNumberOfDueDays) => {
        setDataSchedule((prevDataSchedule) => {
            const updatedDataSchedule = prevDataSchedule.map((item) =>
                item.id === idEdit ? { ...item, numberOfDueDays: updatedNumberOfDueDays } : item,
            );
            return sortArray(updatedDataSchedule, 'numberOfDueDays');
        });
        setIdScheduleEdit(null);
        form.resetFields();
    };

    const removeItem = (numberOfDueDays) => {
        setDataSchedule((prevDataSchedule) => {
            const updatedDataSchedule = prevDataSchedule.filter((item) => item.numberOfDueDays !== numberOfDueDays);
            return sortArray(updatedDataSchedule, 'numberOfDueDays');
        });
        showSucsessMessage('Delete service schedule successfully!!');
    };

    const handleSort = () => {
        if (dataSchedule?.length > 0) {
            const dataCustom = dataSchedule.map((item) => item.numberOfDueDays);
            const arrayItem = { numberOfDueDaysList: dataCustom, serviceId: serviceId };
            executeServiceSchedule({
                data: arrayItem,
                onCompleted: (res) => {
                    showSucsessMessage('Update service schedule ordering success!!');
                    // mixinFuncs.getList();
                },
                onError: (res) => {
                    showErrorMessage('Update service schedule ordering failed!!');
                },
            });
        }
    };

    return (
        <PageWrapper routes={pageOptions.renderBreadcrumbs(commonMessage, translate)}>
            {checkKey ? (
                <>
                    <ListPage
                        baseTable={
                            <>
                                <BaseForm
                                    form={form}
                                    onFinish={(values) => {
                                        handleFinish(values);
                                    }}
                                    onValuesChange={onValuesChange}
                                    size="100%"
                                >
                                    <div style={{ marginTop: '-20px' }}>
                                        <Row gutter={6}>
                                            <Col span={6}>
                                                <NumericField
                                                    name="numberOfDueDays"
                                                    min={0}
                                                    placeholder={'Number Of Due Days'}
                                                    required
                                                />
                                            </Col>
                                            <Col span={6}>
                                                <Button
                                                    key="submit"
                                                    htmlType="submit"
                                                    type="primary"
                                                    style={{ marginLeft: 5 }}
                                                    disabled={disabledSave}
                                                >
                                                    {idScheduleEdit ? 'Update' : 'Create'}
                                                </Button>
                                            </Col>
                                        </Row>
                                    </div>
                                </BaseForm>
                                <BaseTable
                                    // onChange={mixinFuncs.changePagination}
                                    columns={columns}
                                    dataSource={dataSchedule}
                                    loading={loading}
                                    rowKey={(record) => record.id}
                                    // pagination={pagination}
                                />
                                <Row justify={'end'}>
                                    <Button
                                        key="submit"
                                        htmlType="submit"
                                        type="primary"
                                        style={{ marginRight: 5, marginTop: 20 }}
                                        onClick={handleSort}
                                    >
                                        {'Update'}
                                    </Button>
                                </Row>
                            </>
                        }
                    />
                </>
            ) : (
                <PageNotSessionKey setCheckKey={setCheckKey}/>
            )}
        </PageWrapper>
    );
};

export default ServiceScheduleListPage;
