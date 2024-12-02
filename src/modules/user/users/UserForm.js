import { Card, Col, Form, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import TextField from '@components/common/form/TextField';
import CropImageField from '@components/common/form/CropImageField';
import { AppConstants, DATE_FORMAT_VALUE, DEFAULT_FORMAT } from '@constants';
import useFetch from '@hooks/useFetch';
import apiConfig from '@constants/apiConfig';
import { defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { BaseForm } from '@components/common/form/BaseForm';
import SelectField from '@components/common/form/SelectField';
import DatePickerField from '@components/common/form/DatePickerField';
import dayjs from 'dayjs';
import { formatDateString } from '@utils';

const message = defineMessages({
    objectName: 'group permission',
});

const UserForm = (props) => {
    const translate = useTranslate();
    const { formId, actions, dataDetail, onSubmit, setIsChangedFormValues, groups, branchs, isEditing } = props;
    const { execute: executeUpFile } = useFetch(apiConfig.file.upload);
    const [imageUrl, setImageUrl] = useState(null);

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

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
                    setIsChangedFormValues(true);
                }
            },
            onError: (error) => {
                onError();
            },
        });
    };

    const handleSubmit = (values) => {
        values.birthday = formatDateString(values?.birthday, DATE_FORMAT_VALUE) + ' 00:00:00';
        return mixinFuncs.handleSubmit({ ...values, avatar: imageUrl });
    };

    const validateDate = (_, value) => {
        const date = dayjs(formatDateString(new Date(), DEFAULT_FORMAT), DATE_FORMAT_VALUE);
        if (date && value && value.isAfter(date)) {
            return Promise.reject('Ngày sinh phải nhỏ hơn ngày hiện tại');
        }
        return Promise.resolve();
    };

    useEffect(() => {
        dataDetail.phone=dataDetail?.account?.phone;
        dataDetail.fullName=dataDetail?.account?.fullName;
        dataDetail.email=dataDetail?.account?.email;

        dataDetail.birthday = dataDetail?.birthday && dayjs(dataDetail?.birthday, DATE_FORMAT_VALUE);
        form.setFieldsValue({
            ...dataDetail,
        });
        setImageUrl(dataDetail.avatar);
    }, [dataDetail]);
    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={16}>
                    <Col span={12}>
                        <CropImageField
                            label={translate.formatMessage(commonMessage.avatar)}
                            name="avatar"
                            imageUrl={imageUrl && `${AppConstants.contentRootUrl}${imageUrl}`}
                            aspect={1 / 1}
                            uploadFile={uploadFile}
                        />
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <TextField label={translate.formatMessage(commonMessage.fullName)} required name="fullName" />
                    </Col>
                    <Col span={12}>
                        <DatePickerField
                            disabled={isEditing}
                            name="birthday"
                            placeholder="Ngày sinh"
                            style={{ width: '100%' }}
                            label={translate.formatMessage(commonMessage.birthday)}
                            format={DATE_FORMAT_VALUE}
                            required={isEditing ? false : true}
                            rules={[
                                {
                                    validator: validateDate,
                                },
                            ]}
                        />
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <TextField
                            label={translate.formatMessage(commonMessage.email)}
                            name="email"
                            type="email"
                            required={!isEditing}
                        />
                    </Col>
                    <Col span={12}>
                        <TextField
                            label={translate.formatMessage(commonMessage.phone)}
                            type="number"
                            name="phone"
                            required
                        />
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <TextField
                            label={translate.formatMessage(commonMessage.password)}
                            required={!isEditing}
                            name="password"
                            type="password"
                            rules={[
                                {
                                    validator: async () => {
                                        const isTouched = form.isFieldTouched('password');
                                        if (isTouched) {
                                            const value = form.getFieldValue('password');
                                            if (value.length < 6) {
                                                throw new Error(
                                                    translate.formatMessage(commonMessage.validatePassword),
                                                );
                                            }
                                        }
                                    },
                                },
                            ]}
                        />
                    </Col>
                    <Col span={12}>
                        <TextField
                            label={translate.formatMessage(commonMessage.confirmPassword)}
                            required={!isEditing}
                            name="confirmPassword"
                            type="password"
                            rules={[
                                {
                                    validator: async () => {
                                        const password = form.getFieldValue('password');
                                        const confirmPassword = form.getFieldValue('confirmPassword');
                                        if (password !== confirmPassword) {
                                            throw new Error(translate.formatMessage(commonMessage.passwordNotMatch));
                                        }
                                    },
                                },
                            ]}
                        />
                    </Col>
                </Row>
                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default UserForm;
