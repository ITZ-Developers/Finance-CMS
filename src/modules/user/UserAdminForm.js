import { Card, Col, Form, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import TextField from '@components/common/form/TextField';
import CropImageField from '@components/common/form/CropImageField';
import { AppConstants, DATE_FORMAT_DISPLAY, DATE_FORMAT_VALUE, DEFAULT_FORMAT, DEFAULT_FORMAT_ZERO, STATUS_ACTIVE } from '@constants';
import useFetch from '@hooks/useFetch';
import apiConfig from '@constants/apiConfig';
import { defineMessages, FormattedMessage } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { BaseForm } from '@components/common/form/BaseForm';
import SelectField from '@components/common/form/SelectField';
import AutoCompleteField from '@components/common/form/AutoCompleteField';
import FileUploadField from '@components/common/form/FileUploadField';
import DatePickerField from '@components/common/form/DatePickerField';
import { formatDateLocalToUtc, formatDateString } from '@utils';
import dayjs from 'dayjs';
import { showErrorMessage, showSucsessMessage } from '@services/notifyService';
import { statusUserOptions } from '@constants/masterData';
import useSettingUnit from '@hooks/useSettingUnit';

const message = defineMessages({
    objectName: 'group permission',
});

const UserAdminForm = (props) => {
    const translate = useTranslate();
    const { formId, actions, dataDetail, onSubmit, setIsChangedFormValues, groups, branchs, isEditing } = props;
    const { execute: executeUpFile } = useFetch(apiConfig.file.upload);
    const [imageUrl, setImageUrl] = useState(null);
    const statusValue = translate.formatKeys(statusUserOptions, ['label']);
    const { dateUnit } = useSettingUnit();

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
                    showSucsessMessage('Upload file thành công !');
                }
            },
            onError: (error) => {
                if (error.code == 'ERROR-FILE-FORMAT-INVALID') {
                    showErrorMessage('File upload không hợp lệ !');
                }
            },
        });
    };

    const handleSubmit = (values) => {
        values.birthDate = values.birthDate && formatDateLocalToUtc(values.birthDate);
        return mixinFuncs.handleSubmit({ ...values, avatarPath: imageUrl });
    };

    useEffect(() => {
        if (!isEditing){
            form.setFieldsValue({
                status: STATUS_ACTIVE,
            });
        }
    }, [isEditing]);

    useEffect(() => {
        dataDetail.birthDate = dataDetail?.birthDate && dayjs(dataDetail?.birthDate, DATE_FORMAT_VALUE);
        form.setFieldsValue({
            ...dataDetail,
            departmentId: dataDetail?.department?.id,
        });
        setImageUrl(dataDetail.avatarPath);
    }, [dataDetail]);

    const checkUserName = (_, value) => {
        if (value) {
            const usernameRegex = /^[a-z0-9_]{2,20}$/;
            if (!usernameRegex.test(value)) {
                return Promise.reject('Username invalid !');
            }
        } else return Promise.reject('Username invalid !');
        return Promise.resolve();
    };
    const checkPassword = (_, value) => {
        if (value) {
            const passwordRegex = /^[A-Za-z\d!@#$%^&*()+\-=]{6,}$/;
            if (!passwordRegex.test(value)) {
                return Promise.reject('Password invalid !');
            }
        } else return Promise.reject('Password invalid !');
        return Promise.resolve();
    };
    const checkPhone = (_, value) => {
        const phoneRegex = /^0[35789][0-9]{8}$/; // Regex để kiểm tra số điện thoại có 10 chữ số
        if (!phoneRegex.test(value)) {
            return Promise.reject('Phone invalid !');
        }
        return Promise.resolve();
    };
    const validateDate = (_, value) => {
        const date = dayjs(formatDateString(new Date(), DEFAULT_FORMAT), DATE_FORMAT_VALUE);
        if (date && value && value.isAfter(date)) {
            return Promise.reject('Ngày sinh phải nhỏ hơn ngày hiện tại');
        }
        return Promise.resolve();
    };
    const checkEmail = (_, value) => {
        const emailRegex =
            /^[a-z0-9.]+@[a-z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(value)) {
            return Promise.reject('Email invalid !');
        }
        return Promise.resolve();
    };
    const checkFullName = (_, value) => {
        if (value) {
            const lowerCaseValue = value && value.toLowerCase().trim();
            const fullNameRegex =
                /^[a-zàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ\s]+(?: [a-zàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]+)*$/u;

            if (!fullNameRegex.test(lowerCaseValue)) {
                return Promise.reject('FullName invalid !');
            }
        } else return Promise.reject('FullName invalid !');

        return Promise.resolve();
    };
    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={16}>
                    <Col span={12}>
                        <CropImageField
                            label={translate.formatMessage(commonMessage.avatar)}
                            name="avatarPath"
                            imageUrl={imageUrl && `${AppConstants.contentRootUrl}${imageUrl}`}
                            aspect={1 / 1}
                            uploadFile={uploadFile}
                        />
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <TextField
                            label={translate.formatMessage(commonMessage.fullName)}
                            name="fullName"
                            rules={[
                                {
                                    required: true,
                                    validator: checkFullName,
                                },
                            ]}
                        />
                    </Col>
                    <Col span={12}>
                        <TextField
                            label={translate.formatMessage(commonMessage.password)}
                            // required={!isEditing}
                            name="password"
                            type="password"
                            rules={[
                                {
                                    required: true,
                                    validator: checkPassword,
                                },
                            ]}
                        />
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <TextField
                            label={translate.formatMessage(commonMessage.username)}
                            name="username"
                            rules={[
                                {
                                    required: true,
                                    validator: checkUserName,
                                },
                            ]}
                            disabled={isEditing}
                        />
                    </Col>
                    <Col span={12}>
                        <DatePickerField
                            name="birthDate"
                            label="Ngày sinh"
                            placeholder="Ngày sinh"
                            format={dateUnit}
                            style={{ width: '100%' }}
                            rules={[
                                {
                                    validator: validateDate,
                                },
                            ]}
                        />
                    </Col>
                    <Col span={12}>
                        <TextField label={translate.formatMessage(commonMessage.address)} name="address" />
                    </Col>
                    <Col span={12}>
                        <TextField
                            label={translate.formatMessage(commonMessage.email)}
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    validator: checkEmail,
                                },
                            ]}
                        />
                    </Col>
                    <Col span={12}>
                        <TextField
                            label={translate.formatMessage(commonMessage.phone)}
                            name="phone"
                            rules={[
                                {
                                    required: true,
                                    validator: checkPhone,
                                },
                            ]}
                        />
                    </Col>
                    <Col span={12}>
                        <AutoCompleteField
                            required
                            label={<FormattedMessage defaultMessage="Department" />}
                            name="departmentId"
                            apiConfig={apiConfig.department.autocomplete}
                            mappingOptions={(item) => ({ value: item.id, label: item.name })}
                            // initialSearchParams={{ kind: 1 }}
                            searchParams={(text) => ({ name: text })}
                        />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            disabled={isEditing}
                            required
                            name={['group', 'id']}
                            label="Group"
                            allowClear={false}
                            options={groups}
                        />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            required
                            name={['status']}
                            label="Status"
                            allowClear={false}
                            options={statusValue}
                        />
                    </Col>
                </Row>
                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default UserAdminForm;
