import {
    CATEGORY_KIND_EXPENDITURE,
    CATEGORY_KIND_INCOME,
    DEFAULT_FORMAT,
    DEFAULT_FORMAT_ZERO,
    DEFAULT_TABLE_ISPAGED_0,
    TAG_KIND_TRANSACTION,
    TRANSACTION_STATE_APPROVE,
    TRANSACTION_STATE_PAID,
} from '@constants';
import apiConfig from '@constants/apiConfig';
import { kindOptions, stateTransactionOptions } from '@constants/masterData';
import useListBase from '@hooks/useListBase';
import useTranslate from '@hooks/useTranslate';
import {
    convertUtcToLocalTime,
    decryptValue,
    formatMoney,
    formatMoneyValue,
    limitCharacters,
    orderNumber,
    sumMoney,
    validCheckFields,
} from '@utils';
import { getSessionStorageWithExpiry } from '@utils/sessionStorage';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FlexSearch from 'flexsearch';
import { Button, Col, Flex, Form, Modal, Row, Tag, Tooltip } from 'antd';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import useFetch from '@hooks/useFetch';
import useDisclosure from '@hooks/useDisclosure';
import { getCacheAccessToken } from '@services/userService';
import useSettingUnit from '@hooks/useSettingUnit';
import { commonMessage } from '@locales/intl';
import { BaseTooltip } from '@components/common/form/BaseTooltip';
import { showErrorMessage, showSucsessMessage } from '@services/notifyService';
import { ClearOutlined, SearchOutlined, CheckOutlined } from '@ant-design/icons';
import { IconX, IconDownload, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import routes from './routes';
import PageWrapper from '@components/common/layout/PageWrapper';
import DetailTransactionModal from '@modules/transaction/DetailTransactionModal';
import PageNotSessionKey from '@components/common/page/PageNotSessionKey';
import BaseTable from '@components/common/table/BaseTable';
import DatePickerField from '@components/common/form/DatePickerField';
import SelectField from '@components/common/form/SelectField';
import { BaseForm } from '@components/common/form/BaseForm';
import TextField from '@components/common/form/TextField';
import ListPage from '@components/common/layout/ListPage';

dayjs.extend(isBetween);

const notificationMessage = defineMessages({
    approveSuccess: 'Approve {objectName} successfully',
    approveTitle: 'Do you want to approve this {objectName}?',
    ok: 'Ok',
    cancel: 'Cancel',
});

const DebitListPage = ({ pageOptions }) => {
    const queryParameters = new URLSearchParams(window.location.search);
    const translate = useTranslate();
    const kindValues = translate.formatKeys(kindOptions, ['label']);
    const stateValues = translate.formatKeys(stateTransactionOptions, ['label']);
    const location = useLocation();
    const { pathname: pagePath } = useLocation();
    const search = location.search;
    const [nameFilter, setNameFilter] = useState(null);
    const [transactionGroupId, setTransactionGroupId] = useState(null);
    const [kind, setKind] = useState(null);
    const [dataTransaction, setDataTransaction] = useState([]);
    const indexRef = useRef(new FlexSearch.Index());
    const [form] = Form.useForm();
    const intl = useIntl();
    const navigate = useNavigate();
    const [paginationInfo, setPaginationInfo] = useState({ current: 1, pageSize: 50, total: null });
    const handlePaginationChange = (pagination) => {
        setPaginationInfo(pagination);
    };

    const resetPageRef = useRef(null);

    const handleResetPage = () => {
        if (resetPageRef.current) {
            resetPageRef.current();
        }
    };

    const { execute: approveDebit } = useFetch(apiConfig.debit.approve);
    const [openCreateModal, handlersCreateModal] = useDisclosure(false);
    const [openModal, handlersModal] = useDisclosure(false);
    const [dataDetail, setDataDetail] = useState();
    const userAccessToken = getCacheAccessToken();
    const { moneyUnit, dateUnit, dateTimeUnit, decimalSeparator, groupSeparator } = useSettingUnit();
    const [tagData, setTagData] = useState([]);
    const [transactionGroupData, setTransactionGroupData] = useState([]);

    const priceValue = (value) => {
        return formatMoney(value ? value : 0, {
            groupSeparator: groupSeparator,
            decimalSeparator: decimalSeparator,
            currentcy: moneyUnit,
            currentDecimal: '0',
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
                id;
            },
        });
    };

    const handleApproveDebit = (id) => {
        approveDebit({
            data: {
                id,
            },
            onCompleted: (res) => {
                mixinFuncs.getList();
                showSucsessMessage('Approve successfully !');
            },
            onError: (error) => {
                showErrorMessage('Approve Failed!');
            },
        });
    };

    const { data, mixinFuncs, loading, serializeParams, checkKey, setCheckKey, dataSessionKey, setLoading } =
        useListBase({
            apiConfig: {
                getList: apiConfig.debit.getList,
                getById: apiConfig.debit.getById,
                update: apiConfig.debit.update,
                delete: apiConfig.debit.delete,
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
                        const decryptedContent =
                            response?.data?.content?.length > 0
                                ? response?.data?.content.map((item) => {
                                    return {
                                        ...item,
                                        money: decryptValue(dataSessionKey?.decrytSecretKey, `${item.money}`),
                                        name: decryptValue(dataSessionKey?.decrytSecretKey, `${item.name}`),
                                        category:
                                        item?.category?.name &&
                                              decryptValue(dataSessionKey?.decrytSecretKey, `${item?.category?.name}`),
                                        transactionGroupName:
                                              item?.transactionGroup?.name &&
                                              decryptValue(
                                                  dataSessionKey?.decrytSecretKey,
                                                  `${item?.transactionGroup?.name}`,
                                              ),
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
                funcs.prepareGetListParams = (params) => {
                    return {
                        isPaged: DEFAULT_TABLE_ISPAGED_0,
                        ignorePaymentPeriod: 1,
                        sortDate: 2,
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
                    if (filter.transactionGroupId) {
                        setTransactionGroupId(filter.transactionGroupId);
                        delete filter.transactionGroupId;
                    }
                    if (filter.kind) {
                        setKind(filter.kind);
                        delete filter.kind;
                    }

                    mixinFuncs.setQueryParams(
                        serializeParams({
                            ...filter,
                        }),
                    );
                };
                funcs.additionalActionColumnButtons = () => ({
                    approve: ({ id, name, status, studentName, state }) => (
                        <BaseTooltip title={translate.formatMessage(commonMessage.approve)}>
                            <Button
                                type="link"
                                style={{ padding: '0' }}
                                disabled={state == TRANSACTION_STATE_PAID || state == TRANSACTION_STATE_APPROVE}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    showApproveItemConfirm(id);
                                }}
                            >
                                <CheckOutlined
                                    style={{
                                        color:
                                            state == TRANSACTION_STATE_PAID || state == TRANSACTION_STATE_APPROVE
                                                ? 'gray'
                                                : 'green',
                                    }}
                                />
                            </Button>
                        </BaseTooltip>
                    ),
                    delete: ({ state, id }) => {
                        if (!mixinFuncs.hasPermission(apiConfig.transaction.delete?.baseURL)) return null;
                        return (
                            <BaseTooltip type="delete" objectName={'Transaction'}>
                                <Button
                                    type="link"
                                    disabled={state == TRANSACTION_STATE_PAID}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        mixinFuncs.showDeleteItemConfirm(id);
                                    }}
                                    style={{ padding: 0 }}
                                >
                                    <DeleteOutlined
                                        style={state == TRANSACTION_STATE_PAID ? { color: 'gray' } : { color: 'red' }}
                                    />
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
                                    disabled={dataRow?.state !== TRANSACTION_STATE_PAID}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(mixinFuncs.getItemDetailLink(dataRow), {
                                            state: { action: 'edit', prevPath: location.pathname },
                                        });
                                    }}
                                    style={{ padding: 0 }}
                                >

                                    <EditOutlined
                                        style={{
                                            color:
                                                dataRow.state !== TRANSACTION_STATE_PAID
                                                    ? 'gray'
                                                    : 'green',
                                        }}
                                    />
                                </Button>
                            </BaseTooltip>
                        );
                    },
                });
            },
        });
    const { execute: executeTag } = useFetch(apiConfig.tag.autocomplete, {
        immediate: false,
        params: { isPaged: DEFAULT_TABLE_ISPAGED_0, kind: TAG_KIND_TRANSACTION },
        // mappingData: (data) =>
        //     data.data.content.map((item) => ({
        //         value: item.id,
        //         label: decryptValue(dataSessionKey?.decrytSecretKey, `${item.name}`),
        //         color: decryptValue(dataSessionKey?.decrytSecretKey, `${item.colorCode}`),
        //     })),
    });
    
    const { execute: executeGroup } = useFetch(apiConfig.groupTransaction.autocomplete, {
        immediate: false,
        params: { isPaged: DEFAULT_TABLE_ISPAGED_0 },
    });
    useEffect(() => {
        if (checkKey) {
            executeTag({
                onCompleted: (res) => {
                    const data = res.data.content.map((item) => ({
                        value: item.id,
                        label: decryptValue(dataSessionKey?.decrytSecretKey, `${item?.name}`),
                        color: decryptValue(dataSessionKey?.decrytSecretKey, `${item?.colorCode}`),
                    }));
                    setTagData(data);
                },
            });
            executeGroup({
                onCompleted: (res) => {
                    const data = res.data.content.map((item) => ({
                        value: item.id,
                        label: decryptValue(dataSessionKey?.decrytSecretKey, `${item?.name}`),
                    }));
                    setTransactionGroupData(data);
                },
            });
        }
    }, [ checkKey ]);
    useEffect(() => {
        const fromDateParam = queryParameters.get('fromDate');
        const endDateParam = queryParameters.get('endDate');
        const transactionGroupId = queryParameters.get('transactionGroupId');
        const kind = queryParameters.get('kind');
        const state = queryParameters.get('state');
        const fromDate = fromDateParam && dayjs(fromDateParam, 'ddd, DD MMM YYYY HH:mm:ss [GMT]');
        const endDate = endDateParam && dayjs(endDateParam, 'ddd, DD MMM YYYY HH:mm:ss [GMT]');
        const fieldsToSet = {
            name: queryParameters.get('name'),
            transactionGroupId: transactionGroupId && Number(transactionGroupId),
            kind: kind && Number(kind),
            state: state && Number(state),
            fromDate: fromDate,
            endDate: endDate,
        };
        const validFields = validCheckFields(fieldsToSet);
        if (validFields && data) {
            form.setFieldsValue(validFields);
            handleSearchText(validFields);
        }
    }, [data]);
    const handleSearchText = (values) => {
        mixinFuncs.setQueryParams(
            serializeParams({
                ...values,
            }),
        );
        const nameFilter = values.name;
        const transactionGroupId = values.transactionGroupId;
        const state = values.state;
        const kind = values.kind;
        const tag = values.tag;
        const fromDate =
            values.fromDate &&
            dayjs(values.fromDate, DEFAULT_FORMAT_ZERO).set('hour', 0).set('minute', 0).set('second', 0);
        const endDate =
            values.endDate &&
            dayjs(values.endDate, DEFAULT_FORMAT_ZERO).set('hour', 23).set('minute', 59).set('second', 59);
        if (nameFilter !== null || transactionGroupId !== null || kind !== null || state !== null) {
            const filteredData = data.filter((item) => {
                const matchesName = !nameFilter || item.name.toLowerCase().includes(nameFilter.toLowerCase());
                const matchesKind = !kind || item.kind === kind;
                const matchesTag = !tag || item?.tag?.id === tag;
                const matchesTransactionGroupId =
                    !transactionGroupId || item?.transactionGroup?.id === transactionGroupId;
                const matchesState = !state || item?.state === state;

                let matchesDateRange = true;
                if (values.fromDate && values.endDate) {
                    matchesDateRange =
                        dayjs(item?.transactionDate, DEFAULT_FORMAT).isAfter(fromDate) &&
                        dayjs(item?.transactionDate, DEFAULT_FORMAT).isBefore(endDate);
                } else if (values.fromDate) {
                    console.log(fromDate);
                    matchesDateRange = dayjs(item?.transactionDate, DEFAULT_FORMAT).isAfter(fromDate);
                } else if (values.endDate) {
                    console.log(endDate);
                    matchesDateRange = dayjs(item?.transactionDate, DEFAULT_FORMAT).isBefore(endDate);
                }

                return matchesName && matchesKind && matchesTransactionGroupId && matchesState && matchesDateRange && matchesTag;
            });
            setDataTransaction(filteredData);
            handleResetPage();
        }
        setLoading(false);
    };

    const columns = [
        {
            title: '#',
            dataIndex: 'index',
            key: 'id',
            align: 'center',
            render: (text, record, index) => {
                const size = 50;
                const name = decryptValue(dataSessionKey?.decrytSecretKey, `${record?.tag?.name}`);
                const color = decryptValue(dataSessionKey?.decrytSecretKey, `${record?.tag?.colorCode}`);
                return (
                    <Flex align='center' gap={4}>
                        <Tooltip title={name} placement='bottom' style={{ cursor: 'pointer' }}>
                            <div style={{ width: '16px', height: '28px', backgroundColor: `${color}` }}/>
                        </Tooltip>
                        <span>{orderNumber(paginationInfo, index, size)}</span>
                    </Flex>
                );
            },
            width: 60,
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
            render(dataRow) {
                return (
                    <Flex gap={8} align="start">
                        <span>{dataRow.name}</span>
                    </Flex>
                );
            },
        },
        {
            title: translate.formatMessage(commonMessage.money),
            dataIndex: 'money',
            align: 'end',
            render(totalMoney) {
                return <div>{priceValue(totalMoney)}</div>;
            },
            width: 200,
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
            title: translate.formatMessage(commonMessage.state),
            dataIndex: ['transaction','state'],
            width: 100,
            align: 'center',
            render(dataRow) {
                const kind = stateValues.find((item) => item.value == dataRow);

                return kind ? (
                    <Tag color={kind.color} style={{ width: '74px', textAlign: 'center' }}>
                        {kind.label}
                    </Tag>
                ) : (
                    <Tag />
                );
            },
        },
        mixinFuncs.renderActionColumn({ approve: true, edit: true, delete: true }, { width: '160px' }),
    ];

    const breadcrumbs = [
        {
            breadcrumbName: translate.formatMessage(commonMessage.debit),
        },
    ];

    const handleClearSearch = () => {
        form.resetFields();
        setDataTransaction(data);
        handleResetPage();
    };

    const renderCustomOption = (value, label, option) => {
        return {
            value: value,
            label: (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ marginRight: 8 }}>{limitCharacters(label, 18)}</span>
                    <div style={{ width: '32px', height: '16px', backgroundColor: `${option.color}` }} color={option.color}></div>
                </div>
            ),
            labelText: label,
        };
    };

    return (
        <PageWrapper routes={pageOptions ? pageOptions.renderBreadcrumbs(commonMessage, translate) : breadcrumbs}>
            {checkKey ? (
                <ListPage
                    title={
                        <Flex gap={8} style={{ fontSize: 18, fontWeight: 500 }}>
                            <span>Total:</span>
                            <span style={{ color: 'red' }}>
                                {dataTransaction
                                    ? formatMoneyValue(
                                        sumMoney(dataTransaction, CATEGORY_KIND_EXPENDITURE),
                                        moneyUnit,
                                        groupSeparator,
                                        decimalSeparator,
                                    )
                                    : formatMoneyValue(0, moneyUnit, groupSeparator, decimalSeparator)}
                            </span>
                        </Flex>
                    }
                    searchForm={
                        <BaseForm form={form} onFinish={handleSearchText} size="full">
                            <Row gutter={8}>
                                <Col span={3}>
                                    <TextField name="name" placeholder={'Transaction'} />
                                </Col>
                                <Col span={3}>
                                    <SelectField
                                        name="transactionGroupId"
                                        placeholder={translate.formatMessage(commonMessage.groupTransaction)}
                                        options={transactionGroupData}
                                    />
                                </Col>
                                <Col span={2}>
                                    <SelectField name="kind" options={kindValues} placeholder={'Kind'} />
                                </Col>
                                <Col span={2}>
                                    <SelectField name="state" options={stateValues} placeholder={'State'} />
                                </Col>
                                <Col span={3}>
                                    <DatePickerField
                                        name="fromDate"
                                        placeholder="From Date"
                                        format={dateUnit}
                                        style={{ width: '100%' }}
                                    />
                                </Col>
                                <Col span={3}>
                                    <DatePickerField
                                        name="endDate"
                                        placeholder="End Date"
                                        format={dateUnit}
                                        style={{ width: '100%' }}
                                    />
                                </Col>
                                <Col span={4}>
                                    <SelectField
                                        name="tag"
                                        placeholder={translate.formatMessage(commonMessage.tag)}
                                        options={tagData}
                                        renderCustomOption={renderCustomOption}
                                    />
                                </Col>
                                <Col span={2}>
                                    <Button icon={<SearchOutlined />} type="primary" htmlType="submit">
                                        {'Search'}
                                    </Button>
                                </Col>
                                <Col span={2}>
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
                            rowKey={(record) => record.id}
                            pageLocal={true}
                            onPaginationChange={handlePaginationChange}
                            onRow={(record) => ({
                                onClick: (e) => {
                                    e.stopPropagation();
                                    setDataDetail(record);
                                    handlersCreateModal.open();
                                },
                            })}
                            onResetPage={(resetToFirstPage) => {
                                resetPageRef.current = resetToFirstPage;
                            }}
                        />
                    }
                />
            ) : (
                <PageNotSessionKey setCheckKey={setCheckKey} />
            )}

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

export default DebitListPage;
