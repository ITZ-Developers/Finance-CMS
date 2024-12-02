import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import { Button, Col, Form, Modal, Row, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import BaseTable from '@components/common/table/BaseTable';
import {
    DATE_FORMAT_DISPLAY,
    DEFAULT_FORMAT,
    DEFAULT_TABLE_ISPAGED_0,
    PAYMENT_PERIOD_STATE_PAID,
} from '@constants';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import useAuth from '@hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import { convertUtcToLocalTime, decryptValue, formatMoney, orderNumber, validCheckFields } from '@utils';
import { kindPeriodOptions, statePaymentPeriodOptions } from '@constants/masterData';
import { getSessionStorageWithExpiry } from '@utils/sessionStorage';
import PageNotSessionKey from '@components/common/page/PageNotSessionKey';
import { BaseTooltip } from '@components/common/form/BaseTooltip';
import routes from '@routes';
import { CalculatorOutlined, CheckOutlined } from '@ant-design/icons';
import useFetch from '@hooks/useFetch';
import useNotification from '@hooks/useNotification';
import { defineMessages, useIntl } from 'react-intl';
import { BaseForm } from '@components/common/form/BaseForm';
import TextField from '@components/common/form/TextField';
import { ClearOutlined, SearchOutlined } from '@ant-design/icons';
import useSettingUnit from '@hooks/useSettingUnit';

const notificationMessage = defineMessages({
    rejectSuccess: 'Huỷ {objectName} thành công',
    rejectTitle: 'Bạn muốn huỷ {objectName} này?',
    approveSuccess: 'Chấp nhận {objectName} thành công',
    approveTitle: 'Bạn muốn chấn nhận {objectName} này?',
    ok: 'Đồng ý',
    cancel: 'Hủy',
});

const PaymentPeriodListPage = ({ pageOptions }) => {
    const intl = useIntl();
    const translate = useTranslate();
    const { isAdmin } = useAuth();
    const location = useLocation();
    const { pathname: pagePath } = useLocation();
    const search = location.search;
    const kindValues = translate.formatKeys(kindPeriodOptions, ['label']);
    const dataValueKey = JSON.parse(getSessionStorageWithExpiry('sessionKey'));
    const navigate = useNavigate();
    const [nameFilter, setNameFilter] = useState(null);
    const [dataService, setDataService] = useState([]);
    const stateValues = translate.formatKeys(statePaymentPeriodOptions, ['label']);
    const notification = useNotification();
    const { execute: executeRecalculate } = useFetch(apiConfig.paymentPeriod.recalculate, {
        immediate: false,
    });
    const { execute: executeApprove } = useFetch(apiConfig.paymentPeriod.approve, {
        immediate: false,
    });
    const [form] = Form.useForm();
    const [paginationInfo, setPaginationInfo] = useState({ current: 1, pageSize: 50, total: null });
    const handlePaginationChange = (pagination) => {
        setPaginationInfo(pagination);
    };
    const resetPageRef = useRef(null);

    const handleResetPage = () => {
        if (resetPageRef.current) {
            resetPageRef.current(); // Gọi hàm reset trang 1 từ BaseTable
        }
    };

    const handleApprove = (id, state) => {
        executeApprove({
            data: {
                id,
            },
            onCompleted: (res) => {
                mixinFuncs.getList();
                notification({ type: 'success', message: 'Approve success !!' });
            },
            onError: (error) => {
                notification({ type: 'error', message: 'Approve failed !!' });
            },
        });
    };

    const handleRecalculate = (id) => {
        executeRecalculate({
            data: {
                id: id,
            },
            onCompleted: (res) => {
                notification({ type: 'success', message: 'Recalculate success !!' });
            },
            onError: (error) => {
                console.log(error);
                notification({ type: 'error', message: 'Recalculate failed !!' });
            },
        });
    };

    const showApproveItemConfirm = (id) => {
        Modal.confirm({
            title: intl.formatMessage(notificationMessage.approveTitle, {
                objectName: translate.formatMessage(pageOptions.objectName),
            }),
            content: '',
            okText: intl.formatMessage(notificationMessage.ok),
            cancelText: intl.formatMessage(notificationMessage.cancel),
            centered: true,
            onOk: () => {
                handleApprove(id);
            },
        });
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

    const { data, mixinFuncs, queryFilter, loading, serializeParams, checkKey, setCheckKey } = useListBase({
        apiConfig: {
            getList: apiConfig.paymentPeriod.getList,
            getById: apiConfig.paymentPeriod.getById,
            update: apiConfig.paymentPeriod.update,
            delete: apiConfig.paymentPeriod.delete,
        },
        localSearch: true,
        options: {
            isPaged: DEFAULT_TABLE_ISPAGED_0,
            objectName: translate.formatMessage(pageOptions.objectName),
        },
        isSessionKey: true,
        override: (funcs) => {
            funcs.mappingData = (response) => {
                if (response.result === true) {
                    form.resetFields();
                    const decryptedContent = response?.data?.content?.length > 0
                        ? response.data.content.map((item) => {
                            return {
                                ...item,
                                name: decryptValue(dataValueKey?.decrytSecretKey, `${item.name}`),
                            };
                        }) : [];
                    setDataService(decryptedContent);
                    return {
                        data: decryptedContent,
                        total: response.data.totalElements,
                    };
                } else return {};
            };
            funcs.getCreateLink = (record) => {
                return `${pagePath}/create${search}`;
            };
            funcs.getItemDetailLink = (dataRow) => {
                return `${pagePath}/${dataRow.id}${search}`;
            };
            const prepareGetListParams = funcs.prepareGetListParams;
            funcs.prepareGetListParams = (params) => {
                return {
                    sortDate: 2,
                    isPaged: DEFAULT_TABLE_ISPAGED_0,
                };
            };
            funcs.changeFilter = (filter) => {
                if (filter.name) {
                    setNameFilter(filter.name);
                    delete filter.name;
                }

                mixinFuncs.setQueryParams(
                    serializeParams({
                        ...filter,
                    }),
                );
            };
            funcs.additionalActionColumnButtons = () => ({
                recalculate: ({ id, name, status, studentName, state }) => (
                    <BaseTooltip title={translate.formatMessage(commonMessage.recalculate)}>
                        <Button
                            type="link"
                            style={{ padding: '0' }}
                            disabled={state == PAYMENT_PERIOD_STATE_PAID}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRecalculate(id);
                            }}
                        >
                            <CalculatorOutlined />
                        </Button>
                    </BaseTooltip>
                ),
                approve: ({ id, name, status, studentName, state }) => (
                    <BaseTooltip title={translate.formatMessage(commonMessage.approve)}>
                        <Button
                            type="link"
                            style={{ padding: '0' }}
                            disabled={state == PAYMENT_PERIOD_STATE_PAID}
                            onClick={(e) => {
                                e.stopPropagation();
                                showApproveItemConfirm(id);
                            }}
                        >
                            <CheckOutlined style={{ color: state == PAYMENT_PERIOD_STATE_PAID ? 'gray' : 'green' }}/>
                        </Button>
                    </BaseTooltip>
                ),
            });
        },
    });
    const columns = [
        {
            title: '#',
            dataIndex: 'index',
            key: 'id',
            render: (text, record, index) => {
                return orderNumber(paginationInfo, index);
            },
            width: 50,
        },
        {
            title: translate.formatMessage(commonMessage.name),
            dataIndex: 'name',
        },
        {
            title: 'Start Date',
            width: 180,
            render(dataRow) {
                return (
                    <div style={{ fontWeight: 'normal' }}>
                        {convertUtcToLocalTime(dataRow?.startDate, dateTimeUnit, dateTimeUnit)}
                    </div>
                );
            },
            align: 'end',
        },
        {
            title: 'End Date',
            width: 180,
            render(dataRow) {
                return (
                    <div style={{ fontWeight: 'normal' }}>
                        {convertUtcToLocalTime(dataRow?.endDate, dateTimeUnit, dateTimeUnit)}
                    </div>
                );
            },
            align: 'end',
        },
        {
            title: translate.formatMessage(commonMessage.state),
            dataIndex: 'state',
            width: 100,
            align: 'center',
            render(dataRow) {
                const kind = stateValues.find((item) => item.value == dataRow);

                return kind ? (
                    <Tag color={kind.color} style={{ width: '90px', textAlign: 'center' }}>
                        {kind.label}
                    </Tag>
                ) : (
                    <Tag />
                );
            },
        },
        {
            title: 'Total Income',
            width: 180,
            dataIndex: 'totalIncome',
            render(dataRow) {
                const money = decryptValue(dataValueKey?.decrytSecretKey, `${dataRow}`);
                return (
                    <div style={{ fontWeight: 'normal' }}>
                        {priceValue(money)}
                    </div>
                );
            },
            align: 'end',
        },
        {
            title: 'Total Expenditure',
            width: 180,
            dataIndex: 'totalExpenditure',
            render(dataRow) {
                const money = decryptValue(dataValueKey?.decrytSecretKey, `${dataRow}`);
                return (
                    <div style={{ fontWeight: 'normal' }}>
                        {priceValue(money)}
                    </div>
                );
            },
            align: 'end',
        },
        mixinFuncs.renderActionColumn(
            {
                approve: mixinFuncs.hasPermission([apiConfig.paymentPeriod.approve?.baseURL]),
                recalculate: mixinFuncs.hasPermission([apiConfig.paymentPeriod.recalculate?.baseURL]),
                paytion: mixinFuncs.hasPermission([apiConfig.paymentPeriod.approve?.baseURL]),
                // edit: true,
                // delete: true,
            },
            { width: '120px' },
        ),
    ];

    const handleClearSearch = () => {
        form.resetFields();
        setDataService(data);
        handleResetPage();
    };

    const handleSearchText = (values) => {
        mixinFuncs.setQueryParams(
            serializeParams({
                ...values,
            }),
        );
        const nameFilter = values.name;
        if (nameFilter != null) {
            const filteredData = data.filter((item) => {
                const matchesName = !nameFilter || item.name.toLowerCase().includes(nameFilter.toLowerCase());
                return matchesName;
            });
            setDataService(filteredData);
            handleResetPage();
        }
    };

    return (
        <PageWrapper routes={pageOptions.renderBreadcrumbs(commonMessage, translate)}>
            {checkKey ? (
                <ListPage
                    searchForm={
                        <BaseForm form={form} onFinish={handleSearchText}>
                            <Row gutter={8}>
                                <Col span={6}>
                                    <TextField name="name" placeholder={'Payment Period'} />
                                </Col>
                                <Col span={3}>
                                    <Button icon={<SearchOutlined />} type="primary" htmlType="submit">
                                        {'Search'}
                                    </Button>
                                </Col>
                                <Col span={3}>
                                    <Button
                                        icon={<ClearOutlined />}
                                        onClick={handleClearSearch}
                                    >
                                        {'Clear'}
                                    </Button>
                                </Col>
                            </Row>
                        </BaseForm>
                    }
                    // actionBar={mixinFuncs.renderActionBar()}
                    baseTable={
                        <BaseTable
                            onChange={mixinFuncs.changePagination}
                            columns={columns}
                            dataSource={dataService}
                            loading={loading}
                            onRow={(record, rowIndex) => ({
                                onClick: (e) => {
                                    e.stopPropagation();
                                    navigate(routes.transactionOfPaymentListPage.path+ `?paymentPeriodId=${record?.id}&checkState=${record?.state}`);
                                },
                            })}
                            pageLocal={true}
                            onPaginationChange={handlePaginationChange}
                            onResetPage={(resetToFirstPage) => {
                                resetPageRef.current = resetToFirstPage; // Lưu hàm reset trang
                            }}
                        />
                    }
                />
            ) : (
                <PageNotSessionKey setCheckKey={setCheckKey}/>
            )}
        </PageWrapper>
    );
};

export default PaymentPeriodListPage;
