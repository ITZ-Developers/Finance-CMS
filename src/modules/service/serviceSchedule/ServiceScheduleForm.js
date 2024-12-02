import { Card, Col, Form, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import TextField from '@components/common/form/TextField';
import CropImageField from '@components/common/form/CropImageField';
import {
    AppConstants,
    DATE_FORMAT_DISPLAY,
    DEFAULT_FORMAT,
    DEFAULT_FORMAT_ZERO,
    SERVICE_PERIOD_KIND_FIX_DAY,
    SERVICE_PERIOD_KIND_MONTH,
    SERVICE_PERIOD_KIND_YEAR,
} from '@constants';
import useFetch from '@hooks/useFetch';
import apiConfig from '@constants/apiConfig';
import { defineMessages, FormattedMessage } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { BaseForm } from '@components/common/form/BaseForm';
import SelectField from '@components/common/form/SelectField';
import { kindPeriodOptions, statusOptions } from '@constants/masterData';
import NumericField from '@components/common/form/MoneyField';
import DatePickerField from '@components/common/form/DatePickerField';
import { convertUtcToLocalTime, decryptValue } from '@utils';
import dayjs from 'dayjs';
import moment from 'moment';
import { getSessionStorageWithExpiry } from '@utils/sessionStorage';
import AutoCompleteField from '@components/common/form/AutoCompleteField';

const message = defineMessages({
    objectName: 'Service Schedule',
});

const ServiceScheduleForm = (props) => {
    const translate = useTranslate();
    const kindValues = translate.formatKeys(kindPeriodOptions, ['label']);
    const { formId, actions, dataDetail, onSubmit, setIsChangedFormValues, branchs, isEditing } = props;
    const statusValues = translate.formatKeys(statusOptions, ['label']);
    const [kind, setKind] = useState(dataDetail?.periodKind);
    const [isStartDate, setStartDate] = useState(false);
    const dataValueKey = JSON.parse(getSessionStorageWithExpiry('sessionKey'));
    const queryParameters = new URLSearchParams(window.location.search);
    const serviceName = queryParameters.get('serviceName');
    const { execute: executeServiceSchedule, data: serviceScheduleData } = useFetch(apiConfig.serviceSchedule.autocomplete, {
        immediate: true,
        mappingData: (data) =>
            data.data.content.map((item, index) => ({
                id: item.id,
                numberOfDueDays: item.numberOfDueDays,
                index: index,
            })),
    });

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

    const handleSubmit = (values) => {
        const numberOfDueDays = values.numberOfDueDays;

        // Tìm phần tử đầu tiên có numberOfDueDays lớn hơn giá trị từ form
        const matchedItem = serviceScheduleData.find((item) => item.numberOfDueDays > numberOfDueDays);

        if (matchedItem) {
            values.ordering = matchedItem.index;
        } else values.ordering = serviceScheduleData?.length;

        return mixinFuncs.handleSubmit({ ...values });
    };
    useEffect(() => {
        if (!isEditing) {
            form.setFieldsValue({
                serviceId: serviceName,
            });
        }
    }, [isEditing]);

    useEffect(() => {
        const startDate = form.getFieldValue('startDate');
        let newDate;
        if (!isEditing) {
            newDate = checkDate(startDate, kind);      
            form.setFieldValue('expirationDate', newDate);
        } else {
            const expirationDate = form.getFieldValue('expirationDate');
            newDate = expirationDate ? expirationDate : checkDate(startDate, kind);         
            form.setFieldValue('expirationDate', newDate);
        }
    }, [onValuesChange]);

    useEffect(() => {
        form.setFieldsValue({
            ...dataDetail,
        });
    }, [dataDetail]);
    const validateDueDate = (_, value) => {
        const { startDate } = form.getFieldValue();
        if (startDate && value && value.isBefore(startDate)) {
            return Promise.reject('Ngày tới hạn phải lớn hơn ngày bắt đầu');
        }
        return Promise.resolve();
    };
    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={10}>
                    <Col span={12}>
                        <NumericField
                            label={<FormattedMessage defaultMessage={'Number Of DueDays'} />}
                            name="numberOfDueDays"
                            min={0}
                            // max={withdrawMoney}
                            defaultValue={0}
                        />
                    </Col>
                    <Col span={12}>
                        <TextField
                            label={<FormattedMessage defaultMessage="Service" />}
                            name="serviceId"
                            disabled
                        />
                    </Col>
                </Row>
                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

const checkDate = (startDate, kind) => {
    let newDate;
    if (kind == SERVICE_PERIOD_KIND_MONTH)
        newDate = startDate && dayjs(startDate, DEFAULT_FORMAT_ZERO).add(1, 'month');
    else if (kind == SERVICE_PERIOD_KIND_YEAR)
        newDate = startDate && dayjs(startDate, DEFAULT_FORMAT_ZERO).add(1, 'year');
    else newDate = null;
    return newDate;
};

export default ServiceScheduleForm;
