import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import { Button, Col, Flex, Form, Modal, Row, Tag, Tooltip } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import BaseTable from '@components/common/table/BaseTable';
import {
    DATE_FORMAT_DISPLAY,
    DATE_FORMAT_VALUE,
    DEFAULT_FORMAT,
    DEFAULT_FORMAT_ZERO,
    DEFAULT_TABLE_ISPAGED_0,
    SERVICE_PERIOD_KIND_FIX_DAY,
    SERVICE_PERIOD_KIND_MONTH,
    SERVICE_PERIOD_KIND_YEAR,
    SORT_DATE,
    TAG_KIND_SERVICE,
} from '@constants';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import useAuth from '@hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import { convertUtcToLocalTime, decryptValue, formatDateLocalToUtc, formatDateString, formatMoney, limitCharacters, orderNumber, validCheckFields } from '@utils';
import { kindOptions, kindPeriodOptions } from '@constants/masterData';
import { getSessionStorageWithExpiry } from '@utils/sessionStorage';
import PageNotSessionKey from '@components/common/page/PageNotSessionKey';
import { BaseTooltip } from '@components/common/form/BaseTooltip';
import routes from '@routes';
import { CalendarOutlined } from '@ant-design/icons';
import { BaseForm } from '@components/common/form/BaseForm';
import SelectField from '@components/common/form/SelectField';
import useFetch from '@hooks/useFetch';
import TextField from '@components/common/form/TextField';
import { ClearOutlined, SearchOutlined, NotificationOutlined, WalletOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import DatePickerField from '@components/common/form/DatePickerField';
import ServiceDetailModal from './ServiceDetailModal';
import useDisclosure from '@hooks/useDisclosure';
import styles from './index.module.scss';
import useSettingUnit from '@hooks/useSettingUnit';
import { showErrorMessage, showSucsessMessage } from '@services/notifyService';
import { FormattedMessage } from 'react-intl';

dayjs.extend(isBetween);

const ServiceListPage = ({ pageOptions }) => {
    const translate = useTranslate();
    const location = useLocation();
    const { pathname: pagePath } = useLocation();
    const search = location.search;
    const periodValues = translate.formatKeys(kindPeriodOptions, ['label']);
    const dataValueKey = JSON.parse(getSessionStorageWithExpiry('sessionKey'));
    const navigate = useNavigate();
    const [dataService, setDataService] = useState([]);
    const [tagData, setTagData] = useState([]);
    const [groupServiceData, setGroupServiceData] = useState([]);
    const [form] = Form.useForm();
    const [formModalPay] = Form.useForm();
    const kindValues = translate.formatKeys(kindOptions, ['label']);
    const queryParameters = new URLSearchParams(window.location.search);
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

    const [openCreateModal, handlersCreateModal] = useDisclosure(false);
    const [dataModal, setDataModal] = useState();
    const [openedPayModal, handlerPayModal] = useDisclosure(false);

    const [periodKind, setPeriodKind] = useState(null);
    const [expirationDate, setExpirationDate] = useState(null);
    const [id, setId] = useState();
    const [lastPaidDate, setLastPaidDate] = useState();


    const { moneyUnit, dateUnit, dateTimeUnit, decimalSeparator, groupSeparator } = useSettingUnit();

    const priceValue = (value) => {
        return formatMoney(value ? value : 0, {
            groupSeparator: groupSeparator,
            decimalSeparator: decimalSeparator,
            currentcy: moneyUnit,
            currentDecimal: '0',
        });
    };

    const { execute: executeTag } = useFetch(apiConfig.tag.autocomplete, {
        immediate: false,
        params: { isPaged: DEFAULT_TABLE_ISPAGED_0, kind: TAG_KIND_SERVICE },
        // mappingData: (data) =>
        //     data.data.content.map((item) => ({
        //         value: item.id,
        //         label: decryptValue(dataValueKey?.decrytSecretKey, `${item.name}`),
        //         color: decryptValue(dataValueKey?.decrytSecretKey, `${item.colorCode}`),
        //     })),
    });

    const { execute: executeGroup } = useFetch(apiConfig.groupService.autocomplete, {
        immediate: false,
        params: { isPaged: DEFAULT_TABLE_ISPAGED_0 },
    });

    const { data, mixinFuncs, queryFilter, loading, serializeParams, checkKey, setLoading, setCheckKey, dataSessionKey } = useListBase({
        apiConfig: {
            getList: apiConfig.service.getList,
            getById: apiConfig.service.getById,
            update: apiConfig.service.update,
            delete: apiConfig.service.delete,
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
                    const decryptedContent =
                        response?.data?.content?.length > 0
                            ? response.data.content.map((item) => {
                                return {
                                    ...item,
                                    name: decryptValue(dataValueKey?.decrytSecretKey, `${item.name}`),
                                };
                            })
                            : [];
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
            const prepareGetListParams = funcs.prepareGetListParams;
            funcs.prepareGetListParams = (params) => {
                return {
                    // ...prepareGetListParams(params),
                    isPaged: DEFAULT_TABLE_ISPAGED_0,
                    sortDate: SORT_DATE,
                };
            };
            funcs.additionalActionColumnButtons = () => ({
                serviceSchedule: ({ id, name, status, studentName, state }) => (
                    <BaseTooltip title={translate.formatMessage(commonMessage.serviceSchedule)}>
                        <Button
                            type="link"
                            style={{ padding: '0' }}
                            disabled={status === -1}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                    routes.serviceScheduleListPage.path +
                                        `?serviceId=${id}`,
                                );
                            }}
                        >
                            <CalendarOutlined />
                        </Button>
                    </BaseTooltip>
                ),
                listNotification: ({ id, name, status, studentName, state }) => (
                    <BaseTooltip title={translate.formatMessage(commonMessage.notificationGroup)}>
                        <Button
                            type="link"
                            style={{ padding: '0' }}
                            disabled={status === -1}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                    routes.notificationGroupServiceListPage.path +
                                        `?serviceId=${id}`,
                                );
                            }}
                        >
                            <NotificationOutlined />
                        </Button>
                    </BaseTooltip>
                ),
                pay: ({ id, name, status, studentName, state, periodKind, startDate, expirationDate, lastPaidDate }) => (
                    <BaseTooltip title={translate.formatMessage(commonMessage.pay)}>
                        <Button
                            type="link"
                            style={{ padding: '0' }}
                            disabled={status === -1}
                            onClick={(e) => {
                                e.stopPropagation();
                                setId(id);
                                setPeriodKind(periodKind);
                                setExpirationDate(expirationDate);
                                setLastPaidDate(lastPaidDate);
                                formModalPay.setFieldValue('lastPaidDate', dayjs(expirationDate, DEFAULT_FORMAT));
                                handlerPayModal.open();
                            }}
                        >
                            <WalletOutlined />
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
            align: 'center',
            render: (text, record, index) => {
                const size = 50;
                const name = decryptValue(dataValueKey?.decrytSecretKey, `${record?.tag?.name}`);
                const color = decryptValue(dataValueKey?.decrytSecretKey, `${record?.tag?.colorCode}`);
                return (
                    <Flex align='center' gap={4}>
                        {record?.tag?.colorCode && <Tooltip title={name} placement='bottom' style={{ cursor: 'pointer' }}>
                            <div style={{ width: '16px', height: '28px', backgroundColor: `${color}` }}/>
                        </Tooltip>}
                        <span>{orderNumber(paginationInfo, index, size)}</span>
                    </Flex>
                );
            },
            width: 60,
        },
        {
            title: translate.formatMessage(commonMessage.name),
            dataIndex: 'name',
        },
        {
            title: 'Start Date',
            width: 180,
            render(dataRow) {
                const startDate =
                    dayjs(dataRow.startDate,dateUnit).format(dateUnit);
                return (
                    <div style={{ fontWeight: 'normal' }}>
                        {startDate}
                    </div>
                );
            },
        },
        {
            title: 'Due Date',
            width: 180,
            render(dataRow) {
                const expirationDate =
                    dayjs(dataRow.expirationDate,dateUnit).format(dateUnit);

                const date = dayjs(expirationDate).format(dateUnit);
                return (
                    <div style={{ fontWeight: 'normal' }}>
                        {expirationDate}
                    </div>
                );
            },
        },
        {
            title: 'Estimation',
            width: 120,
            // dataIndex: 'daysToExpiration',
            align: 'center',
            render: (dataRow) => {
                if (dataRow?.expirationDate) {
                    const date1 = dayjs().startOf('day');
                    const date2 = dayjs(dataRow?.expirationDate, DATE_FORMAT_VALUE).startOf('day');
                    const text = date2.diff(date1, 'day') > 1 ? 'days' : 'day';
                    return <span>{date2.diff(date1, 'day')} {text}</span>;
                } else return <></>;
            },
        },
        {
            title: translate.formatMessage(commonMessage.money),
            dataIndex: 'money',
            align: 'end',
            render(totalMoney) {
                const price = decryptValue(dataValueKey?.decrytSecretKey, `${totalMoney}`);
                return <div>{priceValue(price)}</div>;
            },
            width: 200,
        },
        {
            title: translate.formatMessage(commonMessage.groupService),
            dataIndex: ['serviceGroup', 'name'],
            render: (name) => {
                return <span>{decryptValue(dataValueKey?.decrytSecretKey, `${name}`)}</span>;
            },
        },
        {
            title: 'Remind',
            dataIndex: 'periodKind',
            width: 150,
            align: 'center',
            render(dataRow) {
                const kind = dataRow != null ? periodValues.find((item) => item.value == dataRow) : null;
                return dataRow ? (
                    <Tag color={kind.color} style={{ textAlign: 'center' }}>
                        {kind.label}
                    </Tag>
                ) : (
                    <Tag />
                );
            },
        },

        mixinFuncs.renderActionColumn(
            {
                pay: mixinFuncs.hasPermission([apiConfig.service.getList.baseURL]),
                serviceSchedule: mixinFuncs.hasPermission([apiConfig.serviceSchedule.getList.baseURL]),
                listNotification: mixinFuncs.hasPermission([apiConfig.serviceNotification.getList.baseURL]),
                edit: true,
                delete: true,
            },
            { width: '200px' },
        ),
    ];
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
                    setGroupServiceData(data);
                },
            });
        }
    }, [ checkKey ]);
    useEffect(() => {
        const fromDateParam = queryParameters.get('fromDate');
        const endDateParam = queryParameters.get('endDate');
        const serviceGroupId = queryParameters.get('serviceGroupId');
        const kind = queryParameters.get('kind');
        const periodKind = queryParameters.get('periodKind');
        const fromDate = fromDateParam && dayjs(fromDateParam, "ddd, DD MMM YYYY HH:mm:ss [GMT]");
        const endDate = endDateParam && dayjs(endDateParam, "ddd, DD MMM YYYY HH:mm:ss [GMT]");
        const fieldsToSet = {
            name: queryParameters.get('name'),
            serviceGroupId: serviceGroupId && Number(serviceGroupId),
            kind: kind && Number(kind),
            periodKind: periodKind && Number(periodKind),
            fromDate: fromDate,
            endDate: endDate,
        };
        const validFields = validCheckFields(fieldsToSet);
        if (validFields && data) {
            form.setFieldsValue(validFields);
            handleSearchText(validFields);
        }
    }, [ data ]);

    const handleSearchText = (values) => {
        const nameFilter = values.name;
        const serviceGroupId = values.serviceGroupId;
        const kind = values.kind;
        const periodKind = values.periodKind;
        const tag = values.tag;
        const fromDate = values.fromDate && dayjs(values.fromDate,DEFAULT_FORMAT_ZERO).set('hour', 0).set('minute', 0).set('second', 0);
        const endDate = values.endDate && dayjs(values.endDate,DEFAULT_FORMAT_ZERO).set('hour', 23).set('minute', 59).set('second', 59);
        mixinFuncs.setQueryParams(
            serializeParams({
                ...values,
                ...(fromDate && { fromDate: fromDate }),
                ...(endDate && { endDate: endDate }),
            }),
        );
        if ( nameFilter !== null || serviceGroupId !== null || periodKind !== null || kind !== null ) {
            const filteredData = data.filter((item) => {
                const matchesName = !nameFilter || item.name.toLowerCase().includes(nameFilter.toLowerCase());
                const matchesKind = !kind || item.kind === kind;
                const matchesServiceGroupId = !serviceGroupId || item.serviceGroup.id === serviceGroupId;
                const matchesPeriodKind = !periodKind || item.periodKind === periodKind;
                const matchesTag = !tag || item?.tag?.id === tag;
                let matchesDateRange = true;
                if (values.fromDate && values.endDate) {
                    matchesDateRange = (dayjs(item?.startDate, DEFAULT_FORMAT).isAfter(fromDate)) && (dayjs(item?.startDate, DEFAULT_FORMAT).isBefore(endDate));
                } else if  (values.fromDate) {
                    matchesDateRange = (dayjs(item.startDate, DEFAULT_FORMAT).isAfter(fromDate));
                } else if  (values.endDate) {
                    matchesDateRange = (dayjs(item.startDate, DEFAULT_FORMAT).isBefore(endDate));
                }

                return matchesName && matchesKind && matchesServiceGroupId && matchesPeriodKind && matchesDateRange && matchesTag;
            });
            setDataService(filteredData);
            handleResetPage();
        }
        setLoading(false);
    };

    const handleClearSearch = () => {
        form.resetFields();
        setDataService(data);
        handleResetPage();
    };

    const rowClassNameDefault = (record) => {
        let className = '';
        let lastItem;
        if (record.daysToExpiration <= 7) {
            return className += ` ${styles.rowWeek}`;
        } else if (record.daysToExpiration <= 14) {
            return className += ` ${styles.rowHalfMonth}`;
        } if (record.daysToExpiration <= 30) {
            return className += ` ${styles.rowMonth}`;
        }
        return className;
    };

    const validateLastPaidDate = (_, value) => {
        const formatDateValue = dayjs(convertUtcToLocalTime( lastPaidDate? lastPaidDate : expirationDate, DEFAULT_FORMAT, DEFAULT_FORMAT), DEFAULT_FORMAT_ZERO);
        if (formatDateValue && value && value.isBefore(formatDateValue)) {
            return Promise.reject(`The last paid must be after the due date`);
        }
        return Promise.resolve();
    };

    const { execute: executeResolvePay } = useFetch(apiConfig.service.resolve);


    const handleResolve = (values) => {
        executeResolvePay({
            data: {
                id: id,
                expirationDate: dayjs(values.lastPaidDate).format(DEFAULT_FORMAT_ZERO),
            },
            onCompleted: (res) => {
                showSucsessMessage(res.message);
                formModalPay.resetFields();
                setExpirationDate(null);
                setLastPaidDate(null);
                handlerPayModal.close();
            },
            onError: (err) => {
                showErrorMessage(err.message);
            },
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
        <>
            <PageWrapper routes={pageOptions.renderBreadcrumbs(commonMessage, translate)}>
                {checkKey ? (
                    <>
                        <ListPage
                            searchForm={
                                <BaseForm form={form} onFinish={handleSearchText} size="full">
                                    <Row gutter={8} justify={'start'}>
                                        <Col span={3}>
                                            <TextField name="name" placeholder={'Service'} />
                                        </Col>
                                        <Col span={3}>
                                            <SelectField
                                                options={groupServiceData}
                                                name="serviceGroupId"
                                                placeholder={'Group Service'}
                                            />
                                        </Col>
                                        <Col span={2}>
                                            <SelectField name="kind" options={kindValues} placeholder={'Kind'} />
                                        </Col>
                                        <Col span={3}>
                                            <SelectField
                                                name="periodKind"
                                                options={periodValues}
                                                placeholder={'Period Kind'}
                                            />
                                        </Col>
                                        <Col span={3}>
                                            <DatePickerField
                                                name="fromDate"
                                                placeholder="From Date"
                                                format={dateUnit}
                                                style={{ width: '100%' }}
                                                onChange={(value) => {
                                                    console.log(value);
                                                }}
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
                            actionBar={mixinFuncs.renderActionBar()}
                            baseTable={
                                <div className="tableService">
                                    <BaseTable
                                        style={{ cursor: 'pointer' }}
                                        columns={columns}
                                        dataSource={dataService}
                                        loading={loading}
                                        rowKey={(record) => record.id}
                                        pageLocal={true}
                                        onPaginationChange={handlePaginationChange}
                                        onResetPage={(resetToFirstPage) => {
                                            resetPageRef.current = resetToFirstPage; // Lưu hàm reset trang
                                        }}
                                        onRow={(record) => ({
                                            onClick: (e) => {
                                                e.stopPropagation();
                                                setDataModal(record);
                                                handlersCreateModal.open();
                                            },
                                        })}
                                        rowClassName={rowClassNameDefault}
                                        className={styles.baseTable}
                                    />
                                </div>
                            }
                        />
                        <ServiceDetailModal
                            open={openCreateModal}
                            onCancel={() => handlersCreateModal.close()}
                            data={dataModal}
                            width={800}
                            dataSessionKey={dataValueKey}
                            setDataModal={setDataModal}
                            dataValueKey={dataValueKey}
                        />
                    </>
                ) : (
                    <PageNotSessionKey setCheckKey={setCheckKey} />
                )}
            </PageWrapper>
            <Modal
                title="Select Last Paid Date"
                open={openedPayModal}
                onCancel={() => {
                    handlerPayModal.close();
                    setExpirationDate(null);
                    setLastPaidDate(null);
                }}
                footer={null}
            >
                <BaseForm
                    form={formModalPay}
                    onFinish={(values) => {
                        handleResolve(values);
                    }}
                >
                    <div className="card-form" style={{ width: '60%' }}>
                        <Row gutter={10}>
                            <Col span={24}>
                                <DatePickerField
                                    name="lastPaidDate"
                                    placeholder="Last Paid Date"
                                    format={dateUnit}
                                    style={{ width: '100%' }}
                                    rules={[
                                        {
                                            validator: validateLastPaidDate,
                                        },
                                    ]}
                                    picker={
                                        periodKind === SERVICE_PERIOD_KIND_MONTH
                                            ? 'month'
                                            : periodKind === SERVICE_PERIOD_KIND_YEAR
                                                ? 'year'
                                                : null
                                    }
                                />
                            </Col>
                        </Row>
                        <Row justify={'end'}>
                            <Button key="submit" htmlType="submit" type="primary" style={{ marginLeft: 5 }}>
                                {'Ok'}
                            </Button>
                        </Row>
                    </div>
                </BaseForm>
            </Modal>
        </>
    );
};

const checkDate = (startDate, kind, dataPeriodKind = null) => {
    let newDate;
    const now = dayjs(formatDateString(new Date(), DEFAULT_FORMAT), DATE_FORMAT_VALUE);
    const startDateValue = dayjs(convertUtcToLocalTime(startDate, DEFAULT_FORMAT, DEFAULT_FORMAT), DEFAULT_FORMAT_ZERO);
    const periodKind = kind ? kind : dataPeriodKind;
    // if (startDate && startDateValue.isBefore(now))
    //     return startDate;
    // else return 0;
    if (periodKind == SERVICE_PERIOD_KIND_MONTH){
        if (startDate && startDateValue.isBefore(now)) {
            const startDay = dayjs(startDateValue).date();
            const currentDay = now.date();
            const differenceMonth = startDay == currentDay ? now.diff(startDateValue, 'month', true) + 2 : now.diff(startDateValue, 'month', true) + 1;
            newDate = dayjs(startDate, DEFAULT_FORMAT_ZERO).add(differenceMonth, 'month');
        } else {
            newDate = dayjs(startDate, DEFAULT_FORMAT_ZERO).add(1, 'month');
        }
    }
    else if (periodKind == SERVICE_PERIOD_KIND_YEAR){
        const startYear = dayjs(startDateValue).year();
        const currentYear = now.year();
        const startDay = dayjs(startDateValue).date();
        const currentDay = now.date();
        const startMonth = dayjs(startDateValue).month();
        const currentMonth = now.month();
        const differenceMonth =
            startYear >= currentYear
                ? 1
                : startMonth > currentMonth
                    ? Math.abs(currentYear - startYear)
                    : startMonth == currentMonth
                        ? startDay >= currentDay ? Math.abs(currentYear - startYear) : Math.abs(currentYear - startYear) + 1
                        : Math.abs(currentYear - startYear) + 1;
        // const differenceMonth = now.diff(startDate, 'year') + 1;
        newDate = dayjs(startDate, DEFAULT_FORMAT_ZERO).add(differenceMonth, 'year');
    }
    else newDate = null;
    return newDate;
};

export default ServiceListPage;
