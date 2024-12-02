import { BaseForm } from '@components/common/form/BaseForm';
import SelectField from '@components/common/form/SelectField';
import TextField from '@components/common/form/TextField';
import { DATE_FORMAT_DISPLAY, DATE_FORMAT_VALUE, DEFAULT_FORMAT, DEFAULT_FORMAT_ZERO, DEFAULT_TABLE_ISPAGED_0, KEY_KIND_SERVER, SERVICE_PERIOD_KIND_MONTH, SERVICE_PERIOD_KIND_YEAR, WidthDialogDetail } from '@constants';
import apiConfig from '@constants/apiConfig';
import { kindKeyOptions, kindOptions } from '@constants/masterData';
import useFetch from '@hooks/useFetch';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { isJsonString } from '@store/utils';
import { convertUtcToLocalTime, copyToClipboard, decryptValue, formatDateString } from '@utils';
import { Card, Col, Form, Input, Modal, Row, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { CopyOutlined } from '@ant-design/icons';
import NumericField from '@components/common/form/MoneyField';
import DatePickerField from '@components/common/form/DatePickerField';
import dayjs from 'dayjs';
import useSettingUnit from '@hooks/useSettingUnit';

const messages = defineMessages({
    objectName: 'Chi tiết Service',
    update: 'Cập nhật',
    create: 'Thêm mới',
    createSuccess: 'Tạo {objectName} thành công',
});

const ServiceDetailModal = ({ open, onCancel, dataSessionKey, data, setDataModal, dataValueKey }) => {
    const translate = useTranslate();
    const [form] = Form.useForm();
    const [kind, setKind] = useState(data?.kind);
    const [dataInfo, setDataInfo] = useState({});
    const [modalHeight, setModalHeight] = useState(700);
    const kindValues = translate.formatKeys(kindKeyOptions, ['label']);
    const kindCategoryValues = translate.formatKeys(kindOptions, ['label']);
    const { moneyUnit, dateUnit, dateTimeUnit, decimalSeparator, groupSeparator } = useSettingUnit();

    const { data: groupServiceData } = useFetch(apiConfig.groupService.autocomplete, {
        immediate: true,
        params: { isPaged: DEFAULT_TABLE_ISPAGED_0 },
        mappingData: (data) =>
            data.data.content.map((item) => ({
                value: item.id,
                label: decryptValue(dataSessionKey?.decrytSecretKey, `${item.name}`),
            })),
    });

    const handleOnCancel = () => {
        form.resetFields();
        setDataModal({});
        onCancel();
    };

    useEffect(() => {
        if (data) {
            const startDate =
                data?.startDate &&
                dayjs(convertUtcToLocalTime(data?.startDate, DEFAULT_FORMAT, DEFAULT_FORMAT), DEFAULT_FORMAT_ZERO);
            const expirationDate = data?.expirationDate ?
                dayjs(
                    convertUtcToLocalTime(data.expirationDate, DEFAULT_FORMAT, DEFAULT_FORMAT),
                    DEFAULT_FORMAT_ZERO,
                ) : checkDate(data?.startDate, data?.periodKind);
            form.setFieldsValue({
                ...data,
                description: decryptValue(dataValueKey?.decrytSecretKey, `${data?.description}`),
                money: decryptValue(dataValueKey?.decrytSecretKey, `${data?.money}`),
                startDate: startDate,
                expirationDate: expirationDate,
            });
        }

    }, [data]);

    return (
        <Modal
            centered
            open={open}
            onCancel={handleOnCancel}
            footer={null}
            title={translate.formatMessage(messages.objectName)}
            width={WidthDialogDetail}
            styles={{
                body: {
                    padding: 10,
                    margin: 0,
                    height: 'max-content',
                },
                content: {
                    padding: 15,
                    margin: 50,
                },
            }}
        >
            <BaseForm form={form} size="100%" style={{ width: '100%', height: '100%', overflowX: 'hidden' }}>
                <Card className="card-form" bordered={false}>
                    <Row gutter={10}>
                        <Col span={12}>
                            <TextField required label={translate.formatMessage(commonMessage.name)} name="name" readOnly/>
                        </Col>
                        <Col span={12}>
                            <NumericField
                                label={<FormattedMessage defaultMessage={'Tổng tiền'} />}
                                name="money"
                                min={0}
                                // max={withdrawMoney}
                                addonAfter={moneyUnit}
                                defaultValue={0}
                                required
                                disabled
                            />
                        </Col>
                        <Col span={12}>
                            <SelectField
                                name="periodKind"
                                label={'Remind'}
                                required
                                options={kindValues}
                                disabled
                            />
                        </Col>

                        <Col span={12}>
                            <SelectField
                                name="kind"
                                label={translate.formatMessage(commonMessage.kind)}
                                required
                                options={kindCategoryValues}
                                disabled
                            />
                        </Col>
                        <Col span={12}>
                            <DatePickerField
                                label={<FormattedMessage defaultMessage="Ngày bắt đầu" />}
                                name="startDate"
                                placeholder="Ngày bắt đầu"
                                format={dateUnit}
                                style={{ width: '100%' }}
                                disabled
                            />
                        </Col>
                        {/* <Col span={12}>
                            <SelectField
                                name="categoryId"
                                label={translate.formatMessage(commonMessage.category)}
                                options={categoryData}
                                disabled
                            />
                        </Col> */}
                        <Col span={12}>
                            <DatePickerField
                                label={<FormattedMessage defaultMessage="Ngày tới hạn" />}
                                name="expirationDate"
                                placeholder="Ngày tới hạn"
                                format={dateUnit}
                                style={{ width: '100%' }}
                                disabled
                            />
                        </Col>
                        <Col span={12}>
                            <SelectField
                                label={<FormattedMessage defaultMessage="Group Service" />}
                                name={['serviceGroup','id']}
                                options={groupServiceData}
                                disabled
                            />
                        </Col>
                        <Col span={24}>
                            <TextField
                                label={translate.formatMessage(commonMessage.description)}
                                name="description"
                                type="textarea"
                                readOnly
                                style={{ height: 250 }}
                            />
                        </Col>
                    </Row>
                </Card>
            </BaseForm>
        </Modal>
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
            console.log(differenceMonth, startDay, currentDay);
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


export default ServiceDetailModal;
