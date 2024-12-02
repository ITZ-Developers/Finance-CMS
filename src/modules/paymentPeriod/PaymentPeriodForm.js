import { Card, Col, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import TextField from '@components/common/form/TextField';
import {
    DATE_FORMAT_DISPLAY,
    DEFAULT_FORMAT,
    DEFAULT_FORMAT_ZERO,
    SERVICE_PERIOD_KIND_FIX_DAY,
    SERVICE_PERIOD_KIND_MONTH,
    SERVICE_PERIOD_KIND_YEAR,
} from '@constants';
import { defineMessages, FormattedMessage } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { BaseForm } from '@components/common/form/BaseForm';
import { kindPeriodOptions, statusOptions } from '@constants/masterData';
import DatePickerField from '@components/common/form/DatePickerField';
import { convertUtcToLocalTime, decryptValue, formatDateString } from '@utils';
import dayjs from 'dayjs';
import { getSessionStorageWithExpiry } from '@utils/sessionStorage';

const message = defineMessages({
    objectName: 'Service',
});

const PaymentPeriodForm = (props) => {
    const translate = useTranslate();
    const kindValues = translate.formatKeys(kindPeriodOptions, ['label']);
    const { formId, actions, dataDetail, onSubmit, setIsChangedFormValues, branchs, isEditing, dataSessionKey } = props;
    const statusValues = translate.formatKeys(statusOptions, ['label']);
    const [periodKind, setPeriodKind] = useState(dataDetail?.periodKind);
    const [kind, setKind] = useState(dataDetail?.category?.kind);
    const [startDate, setStartDate] = useState(dataDetail?.startDate);
    const dataValueKey = JSON.parse(getSessionStorageWithExpiry('sessionKey'));

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

    const handleSubmit = (values) => {
        values.startDate = values.startDate && dayjs(values?.startDate).format(DEFAULT_FORMAT_ZERO);
        values.endDate = values.endDate && dayjs(values?.endDate).format(DEFAULT_FORMAT_ZERO);
        return mixinFuncs.handleSubmit({ ...values });
    };
    // useEffect(() => {
    //     if (!isEditing) {
    //         form.setFieldsValue({
    //             status: statusValues[0].value,
    //         });
    //     }
    // }, [isEditing]);

    // useEffect(() => {
    //     let newDate;
    //     if (!isEditing) {
    //         newDate = checkDate(startDate, periodKind);      
    //         form.setFieldValue('endDate', newDate);
    //     } else {
    //         const endDate = form.getFieldValue('endDate');
    //         newDate = checkDate(startDate, periodKind, dataDetail?.periodKind);         
    //         form.setFieldValue('endDate', newDate);
    //     }
    // }, [startDate]);

    useEffect(() => {
        dataDetail.startDate =
            dataDetail.startDate &&
            dayjs(convertUtcToLocalTime(dataDetail.startDate, DEFAULT_FORMAT, DEFAULT_FORMAT), DEFAULT_FORMAT_ZERO);
        dataDetail.endDate = dataDetail.endDate
            ? dataDetail.endDate &&
              dayjs(
                  convertUtcToLocalTime(dataDetail.endDate, DEFAULT_FORMAT, DEFAULT_FORMAT),
                  DEFAULT_FORMAT_ZERO,
              )
            : checkDate(dataDetail?.startDate, dataDetail?.periodKind);
        form.setFieldsValue({
            ...dataDetail,
            name: decryptValue(dataValueKey?.decrytSecretKey, `${dataDetail?.name}`),
        });
    }, [dataDetail]);
    const validateDueDate = (_, value) => {
        const { startDate } = form.getFieldValue();
        if (startDate && value && value.isBefore(startDate)) {
            return Promise.reject('Ngày tới hạn phải lớn hơn ngày bắt đầu');
        }
        return Promise.resolve();
    };

    const validateStartDate = (_, value) => {
        const date = dayjs(formatDateString(new Date(), DEFAULT_FORMAT), DEFAULT_FORMAT_ZERO);
        if (date && value && value.isBefore(date)) {
            return Promise.reject('Ngày bắt đầu phải lớn hơn hoặc bằng ngày hiện tại');
        }
        return Promise.resolve();
    };

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={10}>
                    <Col span={24}>
                        <TextField required label={translate.formatMessage(commonMessage.name)} name="name" />
                    </Col>
                    <Col span={12}>
                        <DatePickerField
                            label={<FormattedMessage defaultMessage="Ngày bắt đầu" />}
                            name="startDate"
                            placeholder="Ngày bắt đầu"
                            format={DATE_FORMAT_DISPLAY}
                            style={{ width: '100%' }}
                            required
                            onChange={(record) => {
                                setStartDate(record);
                            }}
                        />
                    </Col>
                    <Col span={12}>
                        <DatePickerField
                            label={<FormattedMessage defaultMessage="Ngày kết thúc" />}
                            name="endDate"
                            placeholder="Ngày tới hạn"
                            format={DATE_FORMAT_DISPLAY}
                            style={{ width: '100%' }}
                            required={periodKind == SERVICE_PERIOD_KIND_FIX_DAY}
                            rules={[
                                {
                                    validator: validateDueDate,
                                },
                            ]}
                            // disabled={periodKind ? periodKind != SERVICE_PERIOD_KIND_FIX_DAY : dataDetail?.periodKind != SERVICE_PERIOD_KIND_FIX_DAY}
                        />
                    </Col>
                </Row>
                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

const checkDate = (startDate, kind, dataPeriodKind = null) => {
    let newDate;
    const periodKind = kind ? kind : dataPeriodKind;
    if (periodKind == SERVICE_PERIOD_KIND_MONTH)
        newDate = startDate && dayjs(startDate, DEFAULT_FORMAT_ZERO).add(1, 'month');
    else if (periodKind == SERVICE_PERIOD_KIND_YEAR)
        newDate = startDate && dayjs(startDate, DEFAULT_FORMAT_ZERO).add(1, 'year');
    else newDate = null;
    return newDate;
};

export default PaymentPeriodForm;
