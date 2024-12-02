import TextField from '@components/common/form/TextField';
import { Card, Col, Form, Modal, Row, Button } from 'antd';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { BaseForm } from '@components/common/form/BaseForm';
import useNotification from '@hooks/useNotification';
import { defineMessages } from 'react-intl';
import { useIntl } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import CropImageField from '@components/common/form/CropImageField';
import { AppConstants } from '@constants';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';
import SelectField from '@components/common/form/SelectField';
import { actionOptions } from '@constants/masterData';
import { showErrorMessage } from '@services/notifyService';

const messages = defineMessages({
    objectName: 'slider',
    update: 'Cập nhật',
    create: 'Thêm mới',
    updateSuccess: 'Cập nhật {objectName} thành công',
    createSuccess: 'Thêm mới {objectName} thành công',
});
const SliderModal = ({
    open,
    onCancel,
    title,
    data,
    reload,
    executeUpdate,
    executeLoading,
    sliderData,
    parentData,
    isEditing,
    ...props
}) => {
    const [form] = Form.useForm();
    const [isChangeValues, setIsChangeValues] = useState(false);
    const notification = useNotification();
    const intl = useIntl();
    const translate = useTranslate();
    const [imageUrl, setImageUrl] = useState(null);
    const [valueSelect, setValueSelect] = useState(1);
    const { execute: executeUpFile } = useFetch(apiConfig.file.upload);
    const actionValues = translate.formatKeys(actionOptions, ['label']);
    const updateSetting = (values) => {
        values.imageUrl = imageUrl;
        if (isEditing) {
            sliderData.splice(data?.index, 1, values);
        } else {
            sliderData.push(values);
        }

        executeUpdate({
            data: {
                id: parentData?.id,
                isSystem: 0,
                status: parentData?.status,
                valueData: JSON.stringify(sliderData),
            },
            onCompleted: async (response) => {
                if (response.result === true) {
                    onCancel();
                    notification({
                        message: intl.formatMessage(isEditing ? messages.updateSuccess : messages.createSuccess, {
                            objectName: translate.formatMessage(messages.objectName),
                        }),
                    });
                    executeLoading();
                    setIsChangeValues(false);
                    reload();
                    form.resetFields();
                    setImageUrl(null);
                }
            },
            onError: (err) => { },
        });
    };

    const handleFormChange = () => {
        setIsChangeValues(true);
    };

    useEffect(() => {
        if (isEditing) {
            form.setFieldsValue({
                ...data,
            });
            setValueSelect(data?.action);
            setImageUrl(data?.imageUrl);
        } else {
            const nullData = Object.keys(data).reduce((acc, key) => {
                acc[key] = null;
                return acc;
            }, {});
            nullData.action = 1;
            setValueSelect(1);
            form.setFieldsValue({ ...nullData });
            setImageUrl(null);
        }
    }, [data, isEditing]);
    const uploadFile = (file, onSuccess, onError) => {
        executeUpFile({
            data: {
                type: 'AVATAR',
                file: file,
            },
            onCompleted: (response) => {
                if (response.result === true) {
                    onSuccess();
                    setImageUrl(response.data.filePath);
                    setIsChangeValues(true);
                }
            },
            onError: (error) => {
                if (error.code == 'ERROR-FILE-FORMAT-INVALID') {
                    showErrorMessage('File upload không hợp lệ !');
                }
            },
        });
    };
    const handleOnCancel = () => {
        if (!isEditing) {
            const nullData = Object.keys(data).reduce((acc, key) => {
                acc[key] = null;
                return acc;
            }, {});
            form.setFieldsValue({ ...nullData });
            setImageUrl(null);
        }
        onCancel();
    };
    const handleOnSelect = (value) => {
        setValueSelect(value);
    };
    return (
        <Modal
            centered
            open={open}
            onCancel={handleOnCancel}
            footer={null}
            title={
                (isEditing ? intl.formatMessage(messages.update) : intl.formatMessage(messages.create)) +
                ' ' +
                intl.formatMessage(messages.objectName)
            }
            {...props}
        >
            <Card className="card-form" bordered={false}>
                <BaseForm form={form} onFinish={updateSetting} size="100%" onValuesChange={handleFormChange}>
                    <Col span={12}>
                        <CropImageField
                            label={<FormattedMessage defaultMessage="Hình nền" />}
                            name="imageUrl"
                            imageUrl={imageUrl && `${AppConstants.contentRootUrl}${imageUrl}`}
                            aspect={16 / 9}
                            uploadFile={uploadFile}
                        />
                    </Col>
                    <Row gutter={16}>
                        <Col span={24}>
                            <TextField label={<FormattedMessage defaultMessage="Tiêu đề" />} name="title" required />
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        {valueSelect == 2 && (
                            <Col span={24}>
                                <TextField label={<FormattedMessage defaultMessage="Đường dẫn" />} name="targetUrl" />
                            </Col>
                        )}
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <TextField
                                required
                                label={<FormattedMessage defaultMessage="Mô tả ngắn" />}
                                name="shortDescription"
                                type="textarea"
                            />
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <SelectField
                                defaultValue={actionValues[0]}
                                name="action"
                                label={<FormattedMessage defaultMessage="Nút hành động" />}
                                allowClear={false}
                                onSelect={handleOnSelect}
                                options={actionValues}
                            />
                        </Col>
                    </Row>
                    <div style={{ float: 'right' }}>
                        <Button key="submit" type="primary" htmlType="submit" disabled={!isChangeValues}>
                            {isEditing ? intl.formatMessage(messages.update) : intl.formatMessage(messages.create)}
                        </Button>
                    </div>
                </BaseForm>
            </Card>
        </Modal>
    );
};

export default SliderModal;
