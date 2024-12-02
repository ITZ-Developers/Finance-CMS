import { Card, Col, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import TextField from '@components/common/form/TextField';
import {
    DATE_FORMAT_DISPLAY,
    DATE_FORMAT_VALUE,
    DEFAULT_FORMAT,
    DEFAULT_FORMAT_ZERO,
    DEFAULT_TABLE_ISPAGED_0,
    SERVICE_PERIOD_KIND_FIX_DAY,
    SERVICE_PERIOD_KIND_MONTH,
    SERVICE_PERIOD_KIND_YEAR,
    TAG_KIND_SERVICE,
} from '@constants';
import useFetch from '@hooks/useFetch';
import apiConfig from '@constants/apiConfig';
import { defineMessages, FormattedMessage } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { BaseForm } from '@components/common/form/BaseForm';
import SelectField from '@components/common/form/SelectField';
import { kindOptions, kindPeriodOptions, statusOptions } from '@constants/masterData';
import NumericField from '@components/common/form/MoneyField';
import DatePickerField from '@components/common/form/DatePickerField';
import { convertUtcToLocalTime, decryptValue, formatDateLocalToUtc, formatDateString, limitCharacters } from '@utils';
import dayjs from 'dayjs';
import { getSessionStorageWithExpiry } from '@utils/sessionStorage';
import CheckboxField from '@components/common/form/CheckboxField';
import styles from './index.module.scss';
import useSettingUnit from '@hooks/useSettingUnit';

const message = defineMessages({
    objectName: 'Service',
});

const ServiceForm = (props) => {
    const translate = useTranslate();
    const kindValues = translate.formatKeys(kindPeriodOptions, ['label']);
    const { formId, actions, dataDetail, onSubmit, setIsChangedFormValues, branchs, isEditing, dataSessionKey } = props;
    const statusValues = translate.formatKeys(statusOptions, ['label']);
    const [periodKind, setPeriodKind] = useState(dataDetail?.periodKind);
    const [kind, setKind] = useState(dataDetail?.kind);
    const [startDate, setStartDate] = useState(dataDetail?.startDate);
    const [ lastPaidDate, setLastPaidDate ] = useState(dataDetail?.lastPaidDate);
    const dataValueKey = JSON.parse(getSessionStorageWithExpiry('sessionKey'));
    const kindCategoryValues = translate.formatKeys(kindOptions, ['label']);
    const [categoryData, setCategoryData] = useState([{ value: null, label: null }]);
    const { dateUnit } = useSettingUnit();
    const { execute: executeCategory } = useFetch(apiConfig.category.autocomplete, {
        immediate: false,
        params: { isPaged: DEFAULT_TABLE_ISPAGED_0, kind: dataDetail?.category?.kind },
        mappingData: (data) =>
            data.data.content.map((item) => ({
                value: item.id,
                label: decryptValue(dataSessionKey?.decrytSecretKey, `${item.name}`),
            })),
    });
    const { execute: executeTags, data: tagData } = useFetch(apiConfig.tag.autocomplete, {
        immediate: true,
        params: { kind: TAG_KIND_SERVICE, isPaged: 0 },
        mappingData: (data) =>
            data.data.content.map((item) => ({
                value: item.id,
                label: decryptValue(dataValueKey?.decrytSecretKey, `${item.name}`),
                color: decryptValue(dataValueKey?.decrytSecretKey, `${item.colorCode}`),             
            })),
    });

    const { data: groupServiceData } = useFetch(apiConfig.groupService.autocomplete, {
        immediate: true,
        params: { isPaged: DEFAULT_TABLE_ISPAGED_0 },
        mappingData: (data) =>
            data.data.content.map((item) => ({
                value: item.id,
                label: decryptValue(dataSessionKey?.decrytSecretKey, `${item.name}`),
            })),
    });

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

    const handleSubmit = (values) => {
        values.startDate = values.startDate && dayjs(values.startDate).format(DEFAULT_FORMAT_ZERO);
        values.expirationDate = values.expirationDate && dayjs(values.expirationDate).format(DEFAULT_FORMAT_ZERO);
        values.lastPaidDate = values.lastPaidDate && dayjs(values.lastPaidDate).format(DEFAULT_FORMAT_ZERO);
        return mixinFuncs.handleSubmit({
            ...values,
            expirationDate: periodKind == SERVICE_PERIOD_KIND_FIX_DAY ? values.expirationDate : null,
        });
    };
    useEffect(() => {
        if (!isEditing) {
            form.setFieldsValue({
                status: statusValues[0].value,
            });
        }
    }, [isEditing]);

    useEffect(() => {
        let newDate;
        if (!isEditing) {
            newDate = checkDate(startDate, periodKind);
            form.setFieldValue('expirationDate', newDate);
        } else {
            const expirationDate = form.getFieldValue('expirationDate');
            newDate = checkDate(startDate, periodKind, dataDetail?.periodKind);
            form.setFieldValue('expirationDate', newDate);
        }
    }, [startDate, periodKind]);

    useEffect(() => {
        if (dataDetail) {
            dataDetail.startDate =
                dataDetail.startDate &&
                dayjs(dataDetail.startDate, DEFAULT_FORMAT_ZERO);
            dataDetail.expirationDate = dataDetail.expirationDate
                ? dataDetail.expirationDate &&
                dayjs(
                    dataDetail.expirationDate,
                    DEFAULT_FORMAT_ZERO,
                )
                : checkDate(dataDetail?.startDate, dataDetail?.periodKind);
            dataDetail.lastPaidDate = dataDetail.lastPaidDate
                ? dataDetail.lastPaidDate &&
                dayjs(
                    dataDetail.lastPaidDate,
                    DEFAULT_FORMAT_ZERO,
                )
                : checkDate(dataDetail?.startDate, dataDetail?.periodKind);
            form.setFieldsValue({
                ...dataDetail,
                categoryId: dataDetail?.categoryId,
                name: decryptValue(dataValueKey?.decrytSecretKey, `${dataDetail?.name}`),
                money: decryptValue(dataValueKey?.decrytSecretKey, `${dataDetail?.money}`),
                description: decryptValue(dataValueKey?.decrytSecretKey, `${dataDetail?.description}`),
                serviceGroupId: dataDetail?.serviceGroup?.id,
                kind: dataDetail?.kind,
                tagId: dataDetail?.tag?.id,
            });
        }
    }, [dataDetail]);
    const validateDueDate = (_, value) => {
        const { startDate } = form.getFieldValue();
        if (startDate && value && value.isBefore(startDate)) {
            return Promise.reject('Ngày tới hạn phải lớn hơn ngày bắt đầu');
        }
        return Promise.resolve();
    };

    const validateLastPaidDate = (_, value) => {
        const { startDate, expirationDate, periodKind } = form.getFieldValue();
        if(periodKind == SERVICE_PERIOD_KIND_FIX_DAY){
            if (startDate && value && value.isBefore(startDate)) {
                return Promise.reject('Ngày thanh toán cuối cùng phải lớn hơn ngày bắt đầu');
            } else if (expirationDate && value && value.isAfter(expirationDate)) {
                return Promise.reject('Ngày thanh toán cuối cùng phải nhỏ hơn ngày hết hạn');
            }
        } else {
            if (startDate && value && value.isBefore(startDate)) {
                return Promise.reject('Ngày thanh toán cuối cùng phải lớn hơn ngày bắt đầu');
            }
        }
        return Promise.resolve();
    };

    useEffect(() => {
        executeCategory({
            params: { kind: dataDetail?.kind || kind, isPaged: DEFAULT_TABLE_ISPAGED_0 },
            onCompleted: (res) => {
                const array = res?.data?.totalElements != 0 ? res.data.content.map((item) => ({
                    value: item.id,
                    label: decryptValue(dataValueKey?.decrytSecretKey, `${item.name}`),
                })) : [{ value: null, label: null }];
                setCategoryData(array);
            },
            onError: () => {
                const array = [];
                setCategoryData(array);
            },
        });
    }, [kind, dataDetail]);

    const validateStartDate = (_, value) => {
        const date = dayjs(formatDateString(new Date(), DEFAULT_FORMAT), DATE_FORMAT_VALUE);
        if (date && value && value.isBefore(date)) {
            return Promise.reject('Ngày bắt đầu phải lớn hơn hoặc bằng ngày hiện tại');
        }
        return Promise.resolve();
    };

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={10}>
                    <Col span={12}>
                        <TextField required label={translate.formatMessage(commonMessage.name)} name="name" />
                    </Col>
                    <Col span={12}>
                        <NumericField
                            label={<FormattedMessage defaultMessage={'Tổng tiền'} />}
                            name="money"
                            min={0}
                            // max={withdrawMoney}
                            addonAfter="₫"
                            defaultValue={0}
                            required
                        />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            name="kind"
                            label={translate.formatMessage(commonMessage.kind)}
                            required
                            options={kindCategoryValues}
                            onChange={(data) => {
                                setKind(data);
                                // form.setFieldValue('categoryId', null);
                            }}
                            disabled={isEditing}
                        />
                    </Col>
                    {/* <Col span={6} className={styles.customCheckbox}>
                        <CheckboxField
                            optionLabel={<FormattedMessage defaultMessage="Ignore transaction"/>}
                            name="ignoreTransaction"
                            // disabled={state != VERSION_STATE_INIT && state != VERSION_STATE_APPROVE}
                        />
                    </Col> */}
                    <Col span={12}>
                        <SelectField
                            name="periodKind"
                            label={'Remind'}
                            required
                            options={kindValues}
                            onChange={(data) => {
                                setPeriodKind(data);
                            }}
                        />
                    </Col>

                    <Col span={12}>
                        <DatePickerField
                            label={<FormattedMessage defaultMessage="Ngày bắt đầu" />}
                            name="startDate"
                            placeholder="Ngày bắt đầu"
                            format={dateUnit}
                            style={{ width: '100%' }}
                            required
                            onChange={(record) => {
                                setStartDate(record);
                            }}
                        />
                    </Col>
                    {/* <Col span={12}>
                        <SelectField
                            name="categoryId"
                            label={translate.formatMessage(commonMessage.category)}
                            options={categoryData}
                            disabled={!kind && !dataDetail?.kind}
                        />
                    </Col> */}
                    <Col span={12}>
                        <DatePickerField
                            label={<FormattedMessage defaultMessage="Ngày tới hạn" />}
                            name="expirationDate"
                            placeholder="Ngày tới hạn"
                            format={dateUnit}
                            style={{ width: '100%' }}
                            required={periodKind == SERVICE_PERIOD_KIND_FIX_DAY}
                            rules={[
                                {
                                    validator: validateDueDate,
                                },
                            ]}
                            disabled={
                                periodKind
                                    ? periodKind != SERVICE_PERIOD_KIND_FIX_DAY
                                    : dataDetail?.periodKind != SERVICE_PERIOD_KIND_FIX_DAY
                            }
                        />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            label={<FormattedMessage defaultMessage="Group Service" />}
                            name="serviceGroupId"
                            options={groupServiceData}
                            required
                        />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            name="tagId"
                            label={<FormattedMessage defaultMessage={'Tag'} />}
                            options={tagData}
                            disabled={dataDetail?.tag?.id == TAG_KIND_SERVICE }
                            renderCustomOption={renderCustomOption}
                        />
                    </Col>
                    {/* <Col span={12}>
                        <DatePickerField
                            label={<FormattedMessage defaultMessage="Last Paid Date" />}
                            name="lastPaidDate"
                            placeholder="Last Paid Date"
                            format={dateUnit}
                            style={{ width: '100%' }}
                            onChange={(record) => {
                                setLastPaidDate(record);
                            }}
                            rules={[
                                {
                                    validator: validateLastPaidDate,
                                },
                            ]}
                        />
                    </Col> */}
                    <Col span={24}>
                        <TextField
                            label={translate.formatMessage(commonMessage.description)}
                            name="description"
                            type="textarea"
                        />
                    </Col>
                </Row>
                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

const renderCustomOption = (value, label, option) => {
    return {
        value: value,
        label: (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ marginRight: 8 }}>{limitCharacters(label, 35)}</span>
                <div style={{ width: '32px', height: '16px', backgroundColor: `${option.color}` }} color={option.color}></div>
            </div>
        ),
        labelText: label,
    };
};

const checkDate = (startDate, kind, dataPeriodKind = null) => {
    let newDate;
    const now = dayjs(formatDateString(new Date(), DEFAULT_FORMAT), DATE_FORMAT_VALUE);
    const periodKind = kind ? kind : dataPeriodKind;
    if (periodKind == SERVICE_PERIOD_KIND_MONTH){
        if (startDate && startDate.isBefore(now)) {
            const startDay = dayjs(startDate).date();
            const currentDay = now.date();
            const differenceMonth = startDay == currentDay ? now.diff(startDate, 'month', true) + 2 : now.diff(startDate, 'month', true) + 1;
            newDate = dayjs(startDate, DEFAULT_FORMAT_ZERO).add(differenceMonth, 'month');
        } else {
            newDate = dayjs(startDate, DEFAULT_FORMAT_ZERO).add(1, 'month');
        }
    }
    else if (periodKind == SERVICE_PERIOD_KIND_YEAR){
        const startYear = dayjs(startDate).year(); // Tháng của startDate (giá trị từ 0 đến 11)
        const currentYear = now.year();
        const startDay = dayjs(startDate).date(); // Tháng của startDate (giá trị từ 0 đến 11)
        const currentDay = now.date();
        const startMonth = dayjs(startDate).month(); // Tháng của startDate (giá trị từ 0 đến 11)
        const currentMonth = now.month();
        const differenceMonth =
            startYear >= currentYear
                ? 1
                : startMonth > currentMonth
                    ? Math.abs(currentYear - startYear)
                    : startMonth == currentMonth
                        ? startDay >= currentDay ? Math.abs(currentYear - startYear) : Math.abs(currentYear - startYear) + 1
                        : Math.abs(currentYear - startYear) + 1;
        newDate = dayjs(startDate, DEFAULT_FORMAT_ZERO).add(differenceMonth, 'year');
    }
    else newDate = null;
    return newDate;
};

export default ServiceForm;
