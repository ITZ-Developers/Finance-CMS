import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import { Avatar, Button, Col, Form, Modal, Row, Tag } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import BaseTable from '@components/common/table/BaseTable';

import { UserOutlined } from '@ant-design/icons';
import {
    AppConstants,
    DEFAULT_FORMAT,
    DEFAULT_TABLE_ISPAGED_0,
    DEFAULT_TABLE_ITEM_SIZE,
    TRANSACTION_STATE_APPROVE,
    TRANSACTION_STATE_PAID,
} from '@constants';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import { defineMessages, useIntl } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import AvatarField from '@components/common/form/AvatarField';
import { commonMessage } from '@locales/intl';
import useAuth from '@hooks/useAuth';
import { convertUtcToLocalTime, decryptValue, formatMoney, orderNumber } from '@utils';
import { kindOptions, stateTransactionOptions } from '@constants/masterData';
import { FieldTypes } from '@constants/formConfig';
import useFetch from '@hooks/useFetch';
import { useLocation, useNavigate } from 'react-router-dom';
import { CloseOutlined } from '@ant-design/icons';
import { BaseTooltip } from '@components/common/form/BaseTooltip';
import { showErrorMessage, showSucsessMessage } from '@services/notifyService';
import TextField from '@components/common/form/TextField';
import { BaseForm } from '@components/common/form/BaseForm';
import SelectField from '@components/common/form/SelectField';
import { ClearOutlined, SearchOutlined } from '@ant-design/icons';
import useSettingUnit from '@hooks/useSettingUnit';
import DetailTransactionModal from './DetailTransactionModal';
import useDisclosure from '@hooks/useDisclosure';
import routes from '../routes';
import { EditOutlined } from '@ant-design/icons';

const notificationMessage = defineMessages({
    rejectTitle: 'Bạn muốn từ chối {objectName} này?',
    recalculateTitle: 'Bạn muốn tính lại {objectName} này?',
    approveSuccess: 'Chấp nhận {objectName} thành công',
    approveTitle: 'Bạn muốn chấn nhận {objectName} này?',
    rejectSuccess: 'Từ chối {objectName} thành công!',
    rejectFail: 'Từ chối {objectName} thất bại!',
    ok: 'Đồng ý',
    cancel: 'Hủy',
});

const TransactionListPage = ({ pageOptions }) => {
    const translate = useTranslate();
    const { isAdmin } = useAuth();
    const queryParameters = new URLSearchParams(window.location.search);
    const paymentPeriodId = queryParameters.get('paymentPeriodId');
    const kindValues = translate.formatKeys(kindOptions, ['label']);
    const stateValues = translate.formatKeys(stateTransactionOptions, ['label']);
    const location = useLocation();
    const { pathname: pagePath } = useLocation();
    const search = location.search;
    const [nameFilter, setNameFilter] = useState(null);
    const [dataTransaction, setDataTransaction] = useState([]);
    const intl = useIntl();
    const { execute: removePayoutFromPeriod } = useFetch(apiConfig.transaction.remove);
    const [form] = Form.useForm();
    const [paginationInfo, setPaginationInfo] = useState({ current: 1, pageSize: 50, total: null });
    const handlePaginationChange = (pagination) => {
        setPaginationInfo(pagination);
    };
    const resetPageRef = useRef(null);
    const [openCreateModal, handlersCreateModal] = useDisclosure(false);
    const [dataDetail, setDataDetail] = useState();
    const navigate = useNavigate();
    const checkState = queryParameters.get('checkState');
    const isRenderActionColumn = checkState == TRANSACTION_STATE_APPROVE ? false : true;
    const { data: transactionGroupData } = useFetch(apiConfig.groupTransaction.autocomplete, {
        immediate: true,
        params: { isPaged: DEFAULT_TABLE_ISPAGED_0 },
        mappingData: (data) =>
            data.data.content.map((item) => ({
                value: item.id,
                label: decryptValue(dataSessionKey?.decrytSecretKey, `${item.name}`),
            })),
    });

    const handleResetPage = () => {
        if (resetPageRef.current) {
            resetPageRef.current(); // Gọi hàm reset trang 1 từ BaseTable
        }
    };
    const { moneyUnit, dateUnit, dateTimeUnit, decimalSeparator, groupSeparator } = useSettingUnit();

    const priceValue = (value) => {
        return formatMoney(value ? value : 0, {
            groupSeparator: groupSeparator,
            decimalSeparator: decimalSeparator,
            currentcy: moneyUnit,
            currentDecimal: '0',
        });
    };
    const {
        data,
        mixinFuncs,
        queryFilter,
        loading,
        pagination,
        queryParams,
        serializeParams,
        checkKey,
        setCheckKey,
        dataSessionKey,
    } = useListBase({
        apiConfig: {
            getList: apiConfig.transaction.getList,
            getById: apiConfig.transaction.getById,
            update: apiConfig.transaction.update,
            delete: apiConfig.transaction.delete,
        },
        options: {
            isPaged: DEFAULT_TABLE_ISPAGED_0,
            objectName: translate.formatMessage(pageOptions.objectName),
        },
        isSessionKey: true,
        override: (funcs) => {
            funcs.mappingData = (response) => {
                if (response.result === true) {
                    form.resetFields();
                    const decryptedContent =
                        response?.data?.content?.length > 0
                            ? response?.data?.content.map((item) => {
                                return {
                                    ...item,
                                    name: decryptValue(dataSessionKey?.decrytSecretKey, `${item.name}`),
                                    money: decryptValue(dataSessionKey?.decrytSecretKey, `${item.money}`),
                                    transactionGroupName:
                                          item?.transactionGroup?.name &&
                                          decryptValue(
                                              dataSessionKey?.decrytSecretKey,
                                              `${item?.transactionGroup?.name}`,
                                          ),
                                    category:
                                          item?.category?.name &&
                                          decryptValue(dataSessionKey?.decrytSecretKey, `${item?.category?.name}`),
                                };
                            })
                            : [];
                    setDataTransaction(decryptedContent);
                    return {
                        data: decryptedContent,
                        total: response?.data?.totalElements,
                    };
                }
            };
            const prepareGetListParams = funcs.prepareGetListParams;
            funcs.prepareGetListParams = (params) => {
                return {
                    ...prepareGetListParams(params),
                    paymentPeriodId: paymentPeriodId,
                    sortDate: 3,
                };
            };
            funcs.getCreateLink = (record) => {
                return `${pagePath}/create${search}`;
            };
            funcs.getItemDetailLink = (dataRow) => {
                return `${pagePath}/${dataRow.id}${search}`;
            };
            funcs.changeFilter = (filter) => {
                if (filter.name) {
                    setNameFilter(filter.name);
                    delete filter.name;
                }

                mixinFuncs.setQueryParams(
                    serializeParams({
                        ...filter,
                        paymentPeriodId,
                    }),
                );
            };
            funcs.additionalActionColumnButtons = () => ({
                reject: ({ id, name, status, studentName, state }) => {
                    return (
                        <BaseTooltip title={'Remove transaction'}>
                            <Button
                                type="link"
                                style={{ padding: '0' }}
                                disabled={state != TRANSACTION_STATE_APPROVE}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    showRejectItemConfirm(id);
                                }}
                            >
                                <CloseOutlined style={{ color: state != TRANSACTION_STATE_APPROVE ? 'gray' : 'red' }} />
                            </Button>
                        </BaseTooltip>
                    );
                },
                edit: (dataRow) => {
                    if (!mixinFuncs.hasPermission(apiConfig.transaction.update?.baseURL)) return null;
                    return (
                        <BaseTooltip type="edit" objectName={'Transaction'}>
                            <Button
                                type="link"
                                disabled={dataRow?.state !== TRANSACTION_STATE_APPROVE}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(mixinFuncs.getItemDetailLink(dataRow), {
                                        state: { action: 'edit', prevPath: location.pathname },
                                    });
                                }}
                                style={{ padding: 0 }}
                            >
                                { <EditOutlined />}
                            </Button>
                        </BaseTooltip>
                    );
                },
            });
        },
    });
    const columns = [
        {
            title: '#',
            dataIndex: 'index',
            key: 'id',
            render: (text, record, index) => {
                const size = 50;
                return orderNumber(paginationInfo, index, size);
            },
            width: 50,
        },
        {
            title: 'Date',
            width: 180,
            render(dataRow) {
                return (
                    <div style={{ fontWeight: 'normal' }}>
                        {convertUtcToLocalTime(dataRow?.transactionDate, dateUnit, dateUnit)}
                    </div>
                );
            },
            align: 'start',
        },
        {
            title: translate.formatMessage(commonMessage.name),
            dataIndex: 'name',
        },
        {
            title: translate.formatMessage(commonMessage.money),
            dataIndex: 'money',
            align: 'end',
            width: 200,
            render(totalMoney) {
                return <div>{priceValue(totalMoney)}</div>;
            },
        },
        {
            title: translate.formatMessage(commonMessage.category),
            dataIndex: ['category'],
        },
        {
            title: translate.formatMessage(commonMessage.groupTransaction),
            dataIndex: ['transactionGroupName'],
        },
        {
            title: translate.formatMessage(commonMessage.kind),
            dataIndex: 'kind',
            width: 80,
            align: 'center',
            render(dataRow) {
                const kind = kindValues.find((item) => item.value == dataRow);

                return kind ? (
                    <Tag color={kind.color} style={{ width: '54px', textAlign: 'center' }}>
                        {kind.label}
                    </Tag>
                ) : (
                    <Tag />
                );
            },
        },
        {
            title: translate.formatMessage(commonMessage.state),
            dataIndex: 'state',
            width: 100,
            align: 'center',
            render(dataRow) {
                const kind = stateValues.find((item) => item.value == dataRow);

                return kind ? (
                    <Tag color={kind.color} style={{ width: '94px', textAlign: 'center' }}>
                        {kind.label}
                    </Tag>
                ) : (
                    <Tag />
                );
            },
        },
        isRenderActionColumn && mixinFuncs.renderActionColumn(
            { edit: true, reject: mixinFuncs.hasPermission([apiConfig.transaction.reject?.baseURL]) },
            { width: '120px' },
        ),
    ].filter(Boolean);

    const searchFields = [
        {
            key: 'name',
            placeholder: translate.formatMessage(commonMessage.transaction),
        },
        {
            key: 'kind',
            placeholder: translate.formatMessage(commonMessage.kind),
            type: FieldTypes.SELECT,
            options: kindValues,
            submitOnChanged: true,
            colSpan: 2,
        },
    ];
    const breadcrumbs = [
        {
            breadcrumbName: translate.formatMessage(commonMessage.groupTransaction),
            // path: routes.transactionOfPaymentListPage.path,
        },
        {
            breadcrumbName: 'Transaction',
        },
    ];

    const handleRemovePayoutFromPeriod = (id) => {
        removePayoutFromPeriod({
            data: {
                id,
            },
            onCompleted: (res) => {
                mixinFuncs.getList();
                showSucsessMessage(
                    translate.formatMessage(notificationMessage.rejectSuccess, {
                        objectName: translate.formatMessage(pageOptions.objectName),
                    }),
                );
            },
            onError: (error) => {
                showErrorMessage(translate.formatMessage(notificationMessage.rejectFail), {
                    objectName: translate.formatMessage(pageOptions.objectName),
                });
            },
        });
    };

    const showRejectItemConfirm = (id) => {
        Modal.confirm({
            title: intl.formatMessage(notificationMessage.rejectTitle, {
                objectName: translate.formatMessage(pageOptions.objectName),
            }),
            content: '',
            okText: intl.formatMessage(notificationMessage.ok),
            cancelText: intl.formatMessage(notificationMessage.cancel),
            centered: true,
            onOk: () => {
                handleRemovePayoutFromPeriod(id);
            },
        });
    };

    const handleClearSearch = () => {
        form.resetFields();
        setDataTransaction(data);
        handleResetPage();
    };

    const handleSearchText = (values) => {
        const nameFilter = values.name;
        const kind = values.kind;
        if (nameFilter !== null || kind !== null) {
            const filteredData = data.filter((item) => {
                const matchesName = !nameFilter || item.name.toLowerCase().includes(nameFilter.toLowerCase());
                const matchesKind = !kind || item.kind === kind;

                return matchesName && matchesKind;
            });
            setDataTransaction(filteredData);
            handleResetPage();
        }
    };

    return (
        <PageWrapper routes={pageOptions ? pageOptions.renderBreadcrumbs(commonMessage, translate) : breadcrumbs}>
            <ListPage
                searchForm={
                    <BaseForm form={form} onFinish={handleSearchText}>
                        <Row gutter={8}>
                            <Col span={6}>
                                <TextField name="name" placeholder={'Transaction'} />
                            </Col>
                            <Col span={3}>
                                <SelectField name="kind" options={kindValues} placeholder={'Kind'} />
                            </Col>
                            <Col span={3}>
                                <Button icon={<SearchOutlined />} type="primary" htmlType="submit">
                                    {'Search'}
                                </Button>
                            </Col>
                            <Col span={3}>
                                <Button icon={<ClearOutlined />} onClick={handleClearSearch}>
                                    {'Clear'}
                                </Button>
                            </Col>
                        </Row>
                    </BaseForm>
                }
                baseTable={
                    <BaseTable
                        columns={columns}
                        dataSource={dataTransaction}
                        loading={loading}
                        pageLocal={true}
                        onPaginationChange={handlePaginationChange}
                        onResetPage={(resetToFirstPage) => {
                            resetPageRef.current = resetToFirstPage; // Lưu hàm reset trang
                        }}
                        onRow={(record) => ({
                            onClick: (e) => {
                                e.stopPropagation();
                                setDataDetail(record);
                                handlersCreateModal.open();
                            },
                        })}
                    />
                }
            />
            <DetailTransactionModal
                open={openCreateModal}
                onCancel={() => handlersCreateModal.close()}
                data={dataDetail}
                width={1200}
                transactionGroupData={transactionGroupData}
            />
        </PageWrapper>
    );
};

export default TransactionListPage;
