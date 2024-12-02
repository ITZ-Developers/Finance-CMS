import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import { Button, Col, Flex, Form, Modal, Row, Tag, Tooltip } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import BaseTable from '@components/common/table/BaseTable';
import { CATEGORY_KIND_EXPENDITURE, CATEGORY_KIND_INCOME, DATE_FORMAT_DISPLAY, DATE_FORMAT_VALUE, DEFAULT_FORMAT, DEFAULT_FORMAT_ZERO, DEFAULT_TABLE_ISPAGED_0, TAG_KIND_TRANSACTION, TRANSACTION_STATE_APPROVE, TRANSACTION_STATE_CREATED, TRANSACTION_STATE_PAID, TRANSACTION_STATE_REJECT } from '@constants';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { convertUtcToLocalTime, decryptValue, formatMoney, formatMoneyValue, limitCharacters, orderNumber, sumMoney, validCheckFields } from '@utils';
import { kindOptions, stateTransactionOptions } from '@constants/masterData';
import { useLocation, useNavigate } from 'react-router-dom';
import routes from '@routes';
import PageNotSessionKey from '@components/common/page/PageNotSessionKey';
import FlexSearch from 'flexsearch';
import { BaseForm } from '@components/common/form/BaseForm';
import SelectField from '@components/common/form/SelectField';
import TextField from '@components/common/form/TextField';
import useFetch from '@hooks/useFetch';
import { ClearOutlined, SearchOutlined, CheckOutlined } from '@ant-design/icons';
import {  IconX, IconDownload } from '@tabler/icons-react';
import { BaseTooltip } from '@components/common/form/BaseTooltip';
import { showErrorMessage, showSucsessMessage } from '@services/notifyService';
import { defineMessages, useIntl } from 'react-intl';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import DetailTransactionModal from './DetailTransactionModal';
import useDisclosure from '@hooks/useDisclosure';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import DatePickerField from '@components/common/form/DatePickerField';
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react';
import axios from 'axios';
import { getCacheAccessToken } from '@services/userService';
import styles from './index.module.scss';
import useSettingUnit from '@hooks/useSettingUnit';
import { FormattedMessage } from 'react-intl';

dayjs.extend(isBetween);

const notificationMessage = defineMessages({
    rejectSuccess: 'Huỷ {objectName} thành công',
    rejectTitle: 'Bạn muốn huỷ {objectName} này?',
    approveSuccess: 'Chấp nhận {objectName} thành công',
    approveTitle: 'Bạn muốn chấn nhận {objectName} này?',
    ok: 'Đồng ý',
    cancel: 'Hủy',
});

const TransactionListPage = ({ pageOptions }) => {
    const queryParameters = new URLSearchParams(window.location.search);
    const translate = useTranslate();
    const kindValues = translate.formatKeys(kindOptions, ['label']);
    const stateValues = translate.formatKeys(stateTransactionOptions, ['label']);
    const location = useLocation();
    const { pathname: pagePath } = useLocation();
    const search = location.search;
    const [dataTransaction, setDataTransaction] = useState([]);
    const [tagData, setTagData] = useState([]);
    const [transactionGroupData, setTransactionGroupData] = useState([]);
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
            resetPageRef.current(); // Gọi hàm reset trang 1 từ BaseTable
        }
    };
    const { execute: rejectTransaction, loading: loadingReject } = useFetch(apiConfig.transaction.reject);
    const { execute: approveTransaction, loading: loadingApprove } = useFetch(apiConfig.transaction.approve);
    const [openCreateModal, handlersCreateModal] = useDisclosure(false);
    const [openModal, handlersModal] = useDisclosure(false);
    const [dataDetail, setDataDetail] = useState();
    const userAccessToken = getCacheAccessToken();
    const { moneyUnit, dateUnit, dateTimeUnit, decimalSeparator, groupSeparator } = useSettingUnit();
    const [loadingExport, setLoadingExport] = useState(false);

    const priceValue = (value) => {
        return formatMoney(value ? value : 0, {
            groupSeparator: groupSeparator,
            decimalSeparator: decimalSeparator,
            currentcy: moneyUnit,
            currentDecimal: '0',
        });
    };

    const { loading: loadingTag, execute: executeTag } = useFetch(apiConfig.tag.autocomplete, {
        immediate: false,
        params: { isPaged: DEFAULT_TABLE_ISPAGED_0, kind: TAG_KIND_TRANSACTION },
        // mappingData: (data) =>
        //     data.data.content.map((item) => ({
        //         value: item.id,
        //         label: decryptValue(dataSessionKey?.decrytSecretKey, `${item?.name}`),
        //         color: decryptValue(dataSessionKey?.decrytSecretKey, `${item?.colorCode}`),
        //     })),
    });    
    const { loading: loadingGroup, execute: executeGroup } = useFetch(apiConfig.groupTransaction.autocomplete, {
        immediate: false,
        params: { isPaged: DEFAULT_TABLE_ISPAGED_0 },
    });
    const { data, mixinFuncs, loading, serializeParams, checkKey, setCheckKey, dataSessionKey, setLoading } =
        useListBase({
            apiConfig: {
                getList: apiConfig.transaction.getList,
                getById: apiConfig.transaction.getById,
                update: apiConfig.transaction.update,
                delete: apiConfig.transaction.delete,
            },
            localSearch: true,
            options: {
                isPaged: DEFAULT_TABLE_ISPAGED_0,
                // pageSize: 300,
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
                                        category: item?.category?.name && decryptValue(dataSessionKey?.decrytSecretKey, `${item?.category?.name}`),
                                        transactionGroupName: item?.transactionGroup?.name && decryptValue(dataSessionKey?.decrytSecretKey, `${item?.transactionGroup?.name}`),
                                        
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
                        delete filter.name;
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
                                <CheckOutlined style={{ color: state == TRANSACTION_STATE_PAID || state == TRANSACTION_STATE_APPROVE ? 'gray' : 'green' }}/>
                            </Button>
                        </BaseTooltip>
                    ),
                    reject: ({ id, state }) => {
                        if (!mixinFuncs.hasPermission(apiConfig.transaction.reject?.baseURL)) return null;

                        return (
                            <BaseTooltip title={translate.formatMessage(commonMessage.reject)}>
                                <Button
                                    type="link"
                                    style={{ padding: 0, display: 'table-cell', verticalAlign: 'middle' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        showRejectItemConfirm(id);
                                    }}
                                    disabled={state == TRANSACTION_STATE_PAID || state == TRANSACTION_STATE_REJECT}
                                >
                                    <IconX color={state == TRANSACTION_STATE_PAID || state == TRANSACTION_STATE_REJECT ? 'gray' : 'red'} size={16} />
                                </Button>
                            </BaseTooltip>
                        );
                    },
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
                                    <DeleteOutlined style={state == TRANSACTION_STATE_PAID ? { color: 'gray' } : { color: 'red' } }/>
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
                                    // disabled={dataRow?.state !== TRANSACTION_STATE_CREATED}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(mixinFuncs.getItemDetailLink(dataRow), {
                                            state: { action: 'edit', prevPath: location.pathname },
                                        });
                                    }}
                                    style={{ padding: 0 }}
                                >
                                    {dataRow.state == TRANSACTION_STATE_PAID ? <EyeOutlined /> : <EditOutlined />}
                                </Button>
                            </BaseTooltip>
                        );
                    },
                });
            },
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
        const fromDate = values.fromDate && dayjs(values.fromDate,DEFAULT_FORMAT_ZERO).set('hour', 0).set('minute', 0).set('second', 0);
        const endDate = values.endDate && dayjs(values.endDate,DEFAULT_FORMAT_ZERO).set('hour', 23).set('minute', 59).set('second', 59);
        if (nameFilter !== null || transactionGroupId !== null || kind !== null || state !== null || tag !== null) {
            const filteredData = data.filter((item) => {
                const matchesName = !nameFilter || item.name.toLowerCase().includes(nameFilter.toLowerCase());
                const matchesKind = !kind || item.kind === kind;
                const matchesTransactionGroupId = !transactionGroupId || item?.transactionGroup?.id === transactionGroupId;
                const matchesState = !state || item?.state === state;
                const matchesTag = !tag || item?.tag?.id === tag;

                let matchesDateRange = true;
                if (values.fromDate && values.endDate) {
                    matchesDateRange = (dayjs(item?.transactionDate, DEFAULT_FORMAT).isAfter(fromDate)) && (dayjs(item?.transactionDate, DEFAULT_FORMAT).isBefore(endDate));
                } else if  (values.fromDate) {
                    matchesDateRange = (dayjs(item?.transactionDate, DEFAULT_FORMAT).isAfter(fromDate));
                } else if  (values.endDate) {
                    matchesDateRange = (dayjs(item?.transactionDate, DEFAULT_FORMAT).isBefore(endDate));
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
                        <span>
                            {dataRow.kind == CATEGORY_KIND_INCOME ? (
                                <IconArrowUp size={20} style={{ color: 'green' }} />
                            ) : (
                                <IconArrowDown size={20} style={{ color: 'red' }} />
                            )}
                        </span>
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
                // const money = decryptValue(dataSessionKey?.decrytSecretKey, `${totalMoney}`);
                return <div>{priceValue(totalMoney)}</div>;
            },
            width: 200,
        },
        {
            title: translate.formatMessage(commonMessage.category),
            dataIndex: ['category'],
            width: 120,
        },
        {
            title: translate.formatMessage(commonMessage.groupTransaction),
            dataIndex: ['transactionGroupName'],
        },
        {
            title: translate.formatMessage(commonMessage.state),
            dataIndex: 'state',
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
        mixinFuncs.renderActionColumn({ approve: true, reject: true, edit: true, delete: true }, { width: '160px' }),
    ];

    const breadcrumbs = [
        {
            breadcrumbName: translate.formatMessage(commonMessage.groupTransaction),
            path: routes.groupTransactionListPage.path,
        },
        {
            breadcrumbName: 'Transaction',
        },
    ];

    const handleClearSearch = () => {
        form.resetFields();
        setDataTransaction(data);
        handleResetPage();
    };

    const dataSource = Array.from({ length: 1000 }).map((_, index) => ({
        key: index,
        name: `Item ${index}`,
        age: 20 + (index % 10),
        address: `Address ${index}`,
    }));

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
                handleRejectTransaction(id);
            },
        });
    };

    const handleRejectTransaction = (id) => {
        rejectTransaction({
            data: {
                id,
            },
            onCompleted: (res) => {
                mixinFuncs.getList();
                showSucsessMessage('Reject successfully !');
            },
            onError: (error) => {
                showErrorMessage('Reject Failed !');
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
                handleApproveTransaction(id);
            },
        });
    };

    const handleApproveTransaction = (id) => {
        approveTransaction({
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

    const exportToExcel = (value, nameExcel = 'demo', nameLog) => {
        const dataCustom = dataTransaction.map(item => item.id);
        setLoadingExport(true);
        handlersModal.close();
        axios({
            url: apiConfig.transaction.exportToExcel.baseURL,
            method: 'POST',
            responseType: 'blob',
            // withCredentials: true,
            headers: {
                Authorization: `Bearer ${userAccessToken}`, // Sử dụng token từ state
            },
            data: {
                transactionIds: dataCustom,
            },
        })
            .then((response) => {
                setLoadingExport(false);
                // const fileName="uy_nhiem_chi";
                const dateCurrent = dayjs(new Date()).format('DD.MM.YYYY_HHmmss');

                const excelBlob = new Blob([response.data], {
                    type: response.headers['content-type'],
                });

                const link = document.createElement('a');

                link.href = URL.createObjectURL(excelBlob);
                link.download = `Transaction.${dateCurrent}.xlsx`;
                link.click();
                showSucsessMessage('Download file successfully !!');
            })
            .catch((error) => {
                setLoadingExport(false);
            });
    };

    const renderCustomOption = (value, label, option) => {
        return {
            value: value,
            label: (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ marginRight: 8 }} className={styles.label}>{limitCharacters(label, 20)}</span>
                    <div style={{ width: '32px', height: '16px', backgroundColor: `${option.color}` }} color={option.color}></div>
                </div>
            ),
            labelText: label,
        };
    };

    return (
        <PageWrapper routes={pageOptions ? pageOptions.renderBreadcrumbs(commonMessage, translate) : breadcrumbs}>
            <>
                {checkKey ? (
                    <ListPage
                        title={
                            <Flex gap={8} style={{ fontSize: 18, fontWeight: 500 }}>
                                <span>Tổng thu:</span>
                                <span style={{ color: 'green' }}>
                                    {dataTransaction
                                        ? formatMoneyValue(sumMoney(dataTransaction, CATEGORY_KIND_INCOME), moneyUnit, groupSeparator, decimalSeparator )
                                        : formatMoneyValue(0, moneyUnit, groupSeparator, decimalSeparator)}
                                </span>
                                {' - '}
                                <span>Tổng chi:</span>
                                <span style={{ color: 'red' }}>
                                    {dataTransaction
                                        ? formatMoneyValue(sumMoney(dataTransaction, CATEGORY_KIND_EXPENDITURE), moneyUnit, groupSeparator, decimalSeparator )
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
                                    <Col>
                                        <Button icon={<SearchOutlined />} type="primary" htmlType="submit">
                                            {'Search'}
                                        </Button>
                                    </Col>
                                    <Col span={1}>
                                        <Button icon={<ClearOutlined />} onClick={handleClearSearch}>
                                            {'Clear'}
                                        </Button>
                                    </Col>
                                </Row>
                            </BaseForm>
                        }
                        actionBar={
                            <Flex>
                                <Button
                                    style={{ marginRight: '-5px' }}
                                    type="dashed"
                                    icon={<IconDownload size={12} />}
                                    disabled={dataTransaction?.length == 0}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlersModal.open();
                                    }}
                                    loading={loadingExport}
                                >
                                    Export
                                </Button>
                                <div>{mixinFuncs.renderActionBar()}</div>
                            </Flex>
                        }
                        baseTable={
                            <BaseTable
                                // onChange={mixinFuncs.changePagination}
                                columns={columns}
                                dataSource={dataTransaction}
                                loading={loading || loadingTag || loadingGroup}
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
                                    resetPageRef.current = resetToFirstPage; // Lưu hàm reset trang
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
                    // profile={value?.studentInfo?.account}
                    width={1200}
                    transactionGroupData={transactionGroupData}
                />
                <Modal
                    // centered
                    open={openModal}
                    onCancel={() => handlersModal.close()}
                    // footer={null}
                    title={'Export file excel transaction'}
                    width={400}
                    styles={{
                        // body: { padding: 10, margin: 0, height: '70vh' },
                        footer: { marginTop: 0 },
                    }}
                    onOk={() => exportToExcel()}
                >
                    <Row gutter={10}>
                        <Col span={24}>
                            {/* <SelectField
                                // name="kind"
                                label={translate.formatMessage(commonMessage.kind)}
                                required
                                options={kindValues}
                                onChange={(data) => {
                                    setKind(data);
                                }}
                                defaultValue={CATEGORY_KIND_INCOME}
                            /> */}
                        </Col>
                    </Row>
                </Modal>
            </>
        </PageWrapper>
    );
};

export default TransactionListPage;
