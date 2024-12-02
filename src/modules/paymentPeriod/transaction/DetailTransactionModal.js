import { BaseForm } from '@components/common/form/BaseForm';
import { BaseTooltip } from '@components/common/form/BaseTooltip';
import DatePickerField from '@components/common/form/DatePickerField';
import NumericField from '@components/common/form/MoneyField';
import SelectField from '@components/common/form/SelectField';
import TextField from '@components/common/form/TextField';
import { AppConstants, DATE_DISPLAY_FORMAT, DATE_FORMAT_VALUE, DEFAULT_FORMAT, WidthDialogDetail } from '@constants';
import { kindOptions, stateTransactionOptions } from '@constants/masterData';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { convertUtcToLocalTime, decryptValue } from '@utils';
import { getSessionStorageWithExpiry } from '@utils/sessionStorage';
import { Button, Card, Col, Form, Modal, Row } from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { DownloadOutlined } from '@ant-design/icons';
import { isJsonString } from '@store/utils';
import useSettingUnit from '@hooks/useSettingUnit';

const messages = defineMessages({
    objectName: 'Chi tiết giao dịch',
    update: 'Cập nhật',
    create: 'Thêm mới',
    createSuccess: 'Tạo {objectName} thành công',
});
const DetailTransactionModal = ({
    open,
    onCancel,
    transactionGroupData,
    data,
}) => {
    const translate = useTranslate();
    const [form] = Form.useForm();
    const kindValues = translate.formatKeys(kindOptions, ['label']);
    const stateValues = translate.formatKeys(stateTransactionOptions, ['label']);
    const dataValueKey = JSON.parse(getSessionStorageWithExpiry('sessionKey'));
    const { dateUnit } = useSettingUnit();
    const [ arrayDocument, setArrayDocument ] = useState([]);

    const handleOnCancel = () => {
        onCancel();
        // form.resetFields();
    };

    useEffect(() => {
        if (data) {
            let myArray;
            setArrayDocument([]);
            if (data?.document) {
                try {
                    const arrayImage = decryptValue(dataValueKey?.decrytSecretKey, `${data?.document}`);
                    const parsedArray = isJsonString(arrayImage) ? JSON.parse(arrayImage) : arrayImage;
                    myArray = parsedArray?.map((document) => ({ url: document?.url || document, name: document?.name }));
                } catch (error) {
                    myArray = [{ url: data?.document }];
                }
                setArrayDocument(myArray);
            }
            const transactionDate =
                data?.transactionDate &&
                dayjs(convertUtcToLocalTime(data?.transactionDate, DEFAULT_FORMAT, DEFAULT_FORMAT), DEFAULT_FORMAT);
            form.setFieldsValue({
                ...data,
                transactionDate: transactionDate,
                categoryId: data?.category,
                transactionGroupId: data?.transactionGroup?.id,
                note: decryptValue(dataValueKey?.decrytSecretKey, `${data?.note}`),
                document: myArray,
            });
        }
    }, [data]);

    const handleDownload = (index) => {
        const arrayDocument = form.getFieldValue('document');
        const link = document.createElement('a');
        link.href = `${AppConstants.contentRootUrl}${arrayDocument[index].url}`;
        // link.download = `${imageUrl}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const innerHeight = window.innerHeight;

    return (
        <Modal
            centered
            open={open}
            onCancel={handleOnCancel}
            footer={null}
            title={translate.formatMessage(messages.objectName)}
            width={WidthDialogDetail}
            styles={{
                content:{ margin: 50 },
                body: {
                    padding: 10,
                    margin: 0,
                    height:  innerHeight > 1200 ? 'max-content' : '60vh',
                },
            }}
        >
            <BaseForm
                form={form}
                size="100%"
                style={{ width: '100%', height: '100%', overflowX: 'auto' }}
            >
                <Card className="card-form" bordered={false}>
                    <Row gutter={10}>
                        <Col span={12}>
                            <TextField label={translate.formatMessage(commonMessage.name)} name="name" readOnly />
                        </Col>
                        <Col span={12}>
                            <SelectField
                                name="kind"
                                label={translate.formatMessage(commonMessage.kind)}
                                options={kindValues}
                                disabled
                            />
                        </Col>

                        <Col span={12}>
                            <NumericField
                                label={<FormattedMessage defaultMessage={'Tổng tiền'} />}
                                name="money"
                                min={0}
                                addonAfter="₫"
                                defaultValue={0}
                                readOnly
                            />
                        </Col>
                        <Col span={12}>
                            <SelectField
                                name="categoryId"
                                label={translate.formatMessage(commonMessage.category)}
                                // options={categoryData}
                                disabled
                            />
                        </Col>
                        <Col span={12}>
                            <SelectField
                                name="state"
                                label={translate.formatMessage(commonMessage.state)}
                                disabled
                                options={stateValues}
                            />
                        </Col>
                        <Col span={12}>
                            <SelectField
                                name="transactionGroupId"
                                label={translate.formatMessage(commonMessage.groupTransaction)}
                                options={transactionGroupData}
                                disabled
                            />
                        </Col>
                        <Col span={12}>
                            <DatePickerField
                                showTime={true}
                                label={<FormattedMessage defaultMessage="Transaction Date" />}
                                name="transactionDate"
                                format={dateUnit}
                                style={{ width: '100%' }}
                                disabled
                            />
                        </Col>
                        <Col span={24}>
                            <TextField
                                label={translate.formatMessage(commonMessage.note)}
                                name="note"
                                type="textarea"
                                style={{ height: 250 }}
                                readOnly
                            />
                        </Col>
                        <Col span={24}>
                            {
                                arrayDocument?.length > 0 && <Card title={'Document'} size="small" style={{ marginBottom: '18px', marginTop: '16px' }}>
                                    <Form.List name="document">
                                        {(fields, { add, remove }) => (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                }}
                                            >
                                                {fields.map((field, index) => {
                                                    return (
                                                        <Row key={field.key} gutter={16}>
                                                            <Col span={22}>
                                                                <TextField
                                                                    required
                                                                    name={[field.name, 'name']}
                                                                    placeholder={translate.formatMessage(
                                                                        commonMessage.nameUrl,
                                                                    )}
                                                                />
                                                            </Col>

                                                            <Col span={1}>
                                                                {
                                                                    <BaseTooltip title={'Download Document'}>
                                                                        <Button
                                                                            icon={<DownloadOutlined />}
                                                                            type="link"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDownload(index);
                                                                            }}
                                                                            disabled={false}
                                                                        />
                                                                    </BaseTooltip>
                                                                }
                                                            </Col>
                                                        </Row>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </Form.List>
                                </Card>
                            }
                        </Col>
                    </Row>
                </Card>
            </BaseForm>
        </Modal>
    );
};

export default DetailTransactionModal;
