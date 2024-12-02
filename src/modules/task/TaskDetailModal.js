import { BaseForm } from '@components/common/form/BaseForm';
import SelectField from '@components/common/form/SelectField';
import TextField from '@components/common/form/TextField';
import { AppConstants, DATE_FORMAT_DISPLAY, DATE_FORMAT_VALUE, DEFAULT_FORMAT, DEFAULT_FORMAT_ZERO, DEFAULT_TABLE_ISPAGED_0, KEY_KIND_SERVER, SERVICE_PERIOD_KIND_MONTH, SERVICE_PERIOD_KIND_YEAR, WidthDialogDetail } from '@constants';
import apiConfig from '@constants/apiConfig';
import { kindKeyOptions, kindOptions } from '@constants/masterData';
import useFetch from '@hooks/useFetch';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { isJsonString } from '@store/utils';
import { convertUtcToLocalTime, copyToClipboard, decryptValue, formatDateString } from '@utils';
import { Button, Card, Col, Form, Input, Modal, Row, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { CopyOutlined } from '@ant-design/icons';
import NumericField from '@components/common/form/MoneyField';
import DatePickerField from '@components/common/form/DatePickerField';
import dayjs from 'dayjs';
import useNotification from '@hooks/useNotification';
import { BaseTooltip } from '@components/common/form/BaseTooltip';
import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import RichTextField from '@components/common/form/RichTextField';
import styles from './modal.module.scss';


const messages = defineMessages({
    objectName: 'Chi tiết Task',
    update: 'Cập nhật',
    create: 'Thêm mới',
    createSuccess: 'Tạo {objectName} thành công',
});

const TaskDetailModal = ({ open, onCancel, dataSessionKey, data, setDataModal, dataValueKey }) => {
    const translate = useTranslate();
    const [form] = Form.useForm();

    const [checkButton, setCheckButton] = useState([]);
    const [urlNumber, setUrlNumber] = useState(0);
    const [arrayDocument, setArrayDocument] = useState([]);
    const [imageUrl, setImageUrl] = useState(null);
    const [fileListArray, setFileListArray] = useState([]);
    const notification = useNotification();
    const innerHeight = window.innerHeight;

    const { data: projectData, execute: executeProject } = useFetch(apiConfig.project.autocomplete, {
        immediate: false,
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
        if (open) {
            executeProject();
        }

    }, [ open ]);

    useEffect(() => {
        if (data) {
            let myArray = [];
            setArrayDocument([]);
            if (data?.document) {
                try {
                    const arrayImage = decryptValue(dataSessionKey?.decrytSecretKey, `${data?.document}`);
                    const parsedArray = isJsonString(arrayImage) ? JSON.parse(arrayImage) : arrayImage;
                    myArray = parsedArray?.map((document) => ({ url: document?.url || document, name: document?.name }));
                } catch (error) {
                    myArray = [{ url: data?.document }];
                }
                setArrayDocument(myArray);
                const arrayLength = myArray?.length;
                setUrlNumber(arrayLength);
                const newCheckButton = Array(arrayLength).fill(false);
                setCheckButton(newCheckButton);
            }
            form.setFieldsValue({
                ...data,
                note: decryptValue(dataValueKey?.decrytSecretKey, `${data?.note}`),
                projectId: data?.project?.id,
                document: myArray,
            });
        }

    }, [data]);

    const handleDownload = (index) => {
        const link = document.createElement('a');
        link.href = `${AppConstants.contentRootUrl}${arrayDocument[index].url}`;
        link.download = `${imageUrl}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // const imageUrl = 'https://media-cdn-v2.laodong.vn/storage/newsportal/2023/8/26/1233821/Giai-Nhat--Dem-Sai-G.jpg'; // Thay bằng URL ảnh thực tế
        // window.open(imageUrl, '_blank');
    };

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
                    margin: 0,
                    height: innerHeight > 1200 ? 'max-content' : '72vh',
                },
                content: {
                    padding: 15,
                    margin: 50,
                },
            }}
        >
            <BaseForm form={form} size="100%" style={{ width: '100%', height: '100%', overflowX: 'hidden' }}>
                <div style={{ padding: 24 }}>
                    <Row gutter={10}>
                        <Col span={12}>
                            <TextField
                                required
                                label={translate.formatMessage(commonMessage.name)}
                                name="name"
                                readOnly
                            />
                        </Col>
                        <Col span={12}>
                            <SelectField
                                label={<FormattedMessage defaultMessage="Project" />}
                                name="projectId"
                                options={projectData}
                                disabled
                            />
                        </Col>
                        <Col span={24}>
                            <TextField
                                label={translate.formatMessage(commonMessage.description)}
                                name="note"
                                type="textarea"
                                readOnly
                                style={{
                                    height: '60vh',
                                    textarea: {
                                        border: 'none',
                                    },
                                }}
                                classNameArea={styles.customTextarea}
                                autoSize={{
                                    minRows: 8,
                                }}
                            />
                            {/* <div>Description</div>
                            <div style={{ margin: '12px 0 0 8px', textAlign: 'justify' }}>{decryptValue(dataValueKey?.decrytSecretKey, `${data?.note}`)}</div> */}
                            {/* <RichTextField
                                readOnly={true}
                                theme="bubble"
                                name="note"
                                // defaultValue={decryptValue(dataValueKey?.decrytSecretKey, `${data?.note}`)}
                                form={form}
                                label={'Description'}
                            /> */}
                        </Col>
                        <Col span={24}>
                            {arrayDocument?.document && (
                                <Card
                                    title={'Document'}
                                    size="small"
                                    style={{ marginBottom: '18px', marginTop: '16px' }}
                                >
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
                            )}
                        </Col>
                    </Row>
                </div>
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
                    : (startDay <= currentDay && startMonth <= currentMonth)
                        ? Math.abs(currentYear - startYear) + 1
                        : Math.abs(currentYear - startYear);
        newDate = dayjs(startDate, DEFAULT_FORMAT_ZERO).add(differenceMonth, 'year');
    }
    else newDate = null;
    return newDate;
};


export default TaskDetailModal;
