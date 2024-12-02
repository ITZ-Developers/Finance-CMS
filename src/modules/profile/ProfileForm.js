import TextField from '@components/common/form/TextField';
import { Card, Form } from 'antd';
import React, { useEffect, useState } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import CropImageField from '@components/common/form/CropImageField';
import useFetch from '@hooks/useFetch';
import apiConfig from '@constants/apiConfig';
import { AppConstants } from '@constants';
import { defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { showErrorMessage } from '@services/notifyService';

const message = defineMessages({
    objectName: 'group permission',
});

const ProfileForm = (props) => {
    const translate = useTranslate();
    const { formId, dataDetail, onSubmit, setIsChangedFormValues, actions } = props;
    const [imageUrl, setImageUrl] = useState(null);
    const { execute: executeUpFile } = useFetch(apiConfig.file.upload);

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
                }
                console.log(response);
            },
            onError: (error) => {
                if (error.code == 'ERROR-FILE-FORMAT-INVALID') {
                    showErrorMessage('File upload ảnh không hợp lệ!');
                }
                console.log(error);
            },
        });
    };

    useEffect(() => {
        form.setFieldsValue({
            ...dataDetail,
            city: dataDetail.info?.city,
            country: dataDetail.info?.country,
            jobTitle: dataDetail.info?.jobTitle,
            department: dataDetail.info?.department,
            employeeId: dataDetail.info?.employeeId,
            postalCode: dataDetail.info?.postalCode,
        });
        setImageUrl(dataDetail.avatarPath);
    }, [dataDetail]);

    const handleFinish = (values) => {
        mixinFuncs.handleSubmit({
            fullName: values.fullName,
            oldPassword: values.oldPassword,
            password: values.password,
            avatarPath: imageUrl,
        });
    };

    const checkUserName = (_, value) => {
        if (value) {
            const usernameRegex = /^[a-zA-Z0-9_]{2,20}$/;
            if (!usernameRegex.test(value)) {
                return Promise.reject('Username invalid !');
            }
        }
        return Promise.resolve();
    };
    const checkPassword = (_, value) => {
        if (value) {
            const passwordRegex = /^[A-Za-z\d!@#$%^&*()_+\-=]{6,}$/;
            if (!passwordRegex.test(value)) {
                return Promise.reject('Password invalid 1!');
            }
        }
        return Promise.resolve();
    };
    const checkFullName = (_, value) => {
        if (value) {
            const lowerCaseValue = value.toLowerCase().trim();
            const fullNameRegex = /^[a-zàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ\s]+(?: [a-zàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]+)*$/u;
            
    
            if (!fullNameRegex.test(lowerCaseValue)) {
                return Promise.reject('FullName không hợp lệ, vui lòng nhập lại');
            }
        }
        return Promise.resolve();
    };
    console.log(AppConstants.contentRootUrl,imageUrl);
    return (
        <Card className="card-form" bordered={false} style={{ minHeight: 'calc(100vh - 190px)' }}>
            <Form
                style={{ width: '50%' }}
                labelCol={{ span: 8 }}
                id={formId}
                onFinish={handleFinish}
                form={form}
                layout="horizontal"
                onValuesChange={onValuesChange}
            >
                <CropImageField
                    label={translate.formatMessage(commonMessage.avatar)}
                    name="avatarPath"
                    imageUrl={imageUrl && `${AppConstants.contentRootUrl}${imageUrl}`}
                    aspect={1 / 1}
                    uploadFile={uploadFile}
                />
                <TextField
                    readOnly
                    label={translate.formatMessage(commonMessage.username)}
                    name="username"
                    rules={[
                        {
                            validator: checkUserName,
                        },
                    ]}
                />
                <TextField
                    label={translate.formatMessage(commonMessage.fullName)}
                    name="fullName"
                    rules={[
                        {
                            validator: checkFullName,
                        },
                    ]}
                />
                <TextField
                    type="password"
                    label={translate.formatMessage(commonMessage.currentPassword)}
                    required
                    name="oldPassword"
                />
                <TextField
                    type="password"
                    label={translate.formatMessage(commonMessage.newPassword)}
                    name="password"
                    rules={[
                        {
                            validator: checkPassword,
                        },
                    ]}
                />
                {/* <TextField
                    type="password"
                    label={translate.formatMessage(commonMessage.confirmPassword)}
                    rules={[
                        {
                            validator: async () => {
                                const password = form.getFieldValue('newPassword');
                                const confirmPassword = form.getFieldValue('confirmPassword');
                                if (password !== confirmPassword) {
                                    throw new Error(translate.formatMessage(commonMessage.passwordNotMatch));
                                }
                            },
                        },
                    ]}
                /> */}

                <div className="footer-card-form">{actions}</div>
            </Form>
        </Card>
    );
};

export default ProfileForm;
