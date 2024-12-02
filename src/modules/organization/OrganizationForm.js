import { Card, Col, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import TextField from '@components/common/form/TextField';
import { FormattedMessage } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { BaseForm } from '@components/common/form/BaseForm';
import { decryptValue } from '@utils';
import { commonMessage } from '@locales/intl';
import CropImageField from '@components/common/form/CropImageField';
import { AppConstants } from '@constants';
import { showErrorMessage, showSucsessMessage } from '@services/notifyService';
import useFetch from '@hooks/useFetch';
import apiConfig from '@constants/apiConfig';

const OrganizationForm = (props) => {
    const translate = useTranslate();
    const { formId, actions, dataDetail, onSubmit, setIsChangedFormValues, branchs, isEditing, dataSessionKey } = props;
    const [imageUrl, setImageUrl] = useState(null);
    const { execute: executeUpFile } = useFetch(apiConfig.file.upload);

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

    const handleSubmit = (values) => {
        return mixinFuncs.handleSubmit({ ...values, logo: imageUrl });
    };

    useEffect(() => {
        form.setFieldsValue({
            ...dataDetail,
            name: decryptValue(dataSessionKey?.decrytSecretKey, `${dataDetail?.name}`),
            description: decryptValue(dataSessionKey?.decrytSecretKey, `${dataDetail?.description}`),
        });
        setImageUrl(decryptValue(dataSessionKey?.decrytSecretKey, `${dataDetail?.logo}`));
    }, [dataDetail]);

    const uploadFile = (file, onSuccess, onError) => {
        executeUpFile({
            data: {
                type: 'LOGO',
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

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={10}>
                    <Col span={12}>
                        <CropImageField
                            label={translate.formatMessage(commonMessage.logo)}
                            name="logo"
                            imageUrl={imageUrl && `${AppConstants.contentRootUrl}${imageUrl}`}
                            aspect={1 / 1}
                            uploadFile={uploadFile}
                        />
                    </Col>
                    <Col span={24}>
                        <TextField
                            label={<FormattedMessage defaultMessage="Organization" />}
                            name="name"
                            required
                        />
                    </Col>
                </Row>
                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default OrganizationForm;
