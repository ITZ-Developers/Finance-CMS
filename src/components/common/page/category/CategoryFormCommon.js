import { Avatar, Card, Col, Form, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import TextField from '@components/common/form/TextField';
import CropImageField from '@components/common/form/CropImageField';
import { AppConstants } from '@constants';
import useFetch from '@hooks/useFetch';
import apiConfig from '@constants/apiConfig';
import SelectField from '@components/common/form/SelectField';
import useTranslate from '@hooks/useTranslate';
import { kindOptions, statusOptions } from '@constants/masterData';
import { FormattedMessage } from 'react-intl';
import { BaseForm } from '@components/common/form/BaseForm';
import { commonMessage } from '@locales/intl';
import { decryptValue } from '@utils';
import { showErrorMessage } from '@services/notifyService';

const CategoryFormCommon = (props) => {
    const { formId, actions, dataDetail, onSubmit, setIsChangedFormValues, dataSessionKey, isEditing } = props;
    const { execute: executeUpFile } = useFetch(apiConfig.file.upload);
    const [imageUrl, setImageUrl] = useState(null);
    const translate = useTranslate();
    const kindValues = translate.formatKeys(kindOptions, ['label']);

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
                if (error.code == 'ERROR-FILE-FORMAT-INVALID') {
                    showErrorMessage('File upload không hợp lệ !');
                }
            },
        });
    };

    const handleSubmit = (values) => {
        return mixinFuncs.handleSubmit({ ...values, avatar: imageUrl });
    };

    useEffect(() => {
        form.setFieldsValue({
            ...dataDetail,
            name: decryptValue(dataSessionKey?.decrytSecretKey, `${dataDetail?.name}`),
            description: decryptValue(dataSessionKey?.decrytSecretKey, `${dataDetail?.description}`),
        });
        setImageUrl(decryptValue(dataSessionKey?.decrytSecretKey, `${dataDetail?.avatar}`));
    }, [dataDetail]);

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={10}>
                    <Col span={12}>
                        <TextField required label={translate.formatMessage(commonMessage.name)} name="name" />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            name="kind"
                            label={translate.formatMessage(commonMessage.kind)}
                            options={kindValues}
                            required
                            disabled={isEditing}
                        />
                    </Col>
                    <Col span={24}>
                        <TextField
                            label={<FormattedMessage defaultMessage="Description" />}
                            name="description"
                            type="textarea"
                            required
                        />
                    </Col>
                </Row>

                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default CategoryFormCommon;
