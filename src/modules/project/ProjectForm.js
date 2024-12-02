import { Card, Col, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import TextField from '@components/common/form/TextField';
import { FormattedMessage } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { BaseForm } from '@components/common/form/BaseForm';
import { decryptValue, limitCharacters } from '@utils';
import { commonMessage } from '@locales/intl';
import CropImageField from '@components/common/form/CropImageField';
import { AppConstants, DEFAULT_TABLE_ISPAGED_0, TAG_KIND_PROJECT } from '@constants';
import { showErrorMessage, showSucsessMessage } from '@services/notifyService';
import useFetch from '@hooks/useFetch';
import apiConfig from '@constants/apiConfig';
import SelectField from '@components/common/form/SelectField';
import { getSessionStorageWithExpiry } from '@utils/sessionStorage';

const ProjectForm = (props) => {
    const translate = useTranslate();
    const { formId, actions, dataDetail, onSubmit, setIsChangedFormValues, branchs, isEditing, dataSessionKey } = props;
    const [imageUrl, setImageUrl] = useState(null);
    const { execute: executeUpFile } = useFetch(apiConfig.file.upload);
    const dataValueKey = JSON.parse(getSessionStorageWithExpiry('sessionKey'));

    const { data: organizationData } = useFetch(apiConfig.organization.autocomplete, {
        immediate: true,
        params: { isPaged: DEFAULT_TABLE_ISPAGED_0 },
        mappingData: (data) =>
            data.data.content.map((item) => ({
                value: item.id,
                label: decryptValue(dataSessionKey?.decrytSecretKey, `${item.name}`),
            })),
    });

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

    const handleSubmit = (values) => {
        return mixinFuncs.handleSubmit({ ...values, logo: imageUrl });
    };
    const { execute: executeTags, data: tagData } = useFetch(apiConfig.tag.autocomplete, {
        immediate: true,
        params: { kind: TAG_KIND_PROJECT, isPaged: 0 },
        mappingData: (data) =>
            data.data.content.map((item) => ({
                value: item.id,
                label: decryptValue(dataValueKey?.decrytSecretKey, `${item.name}`),
                color: decryptValue(dataValueKey?.decrytSecretKey, `${item.colorCode}`),               
            })),
    });

    useEffect(() => {
        form.setFieldsValue({
            ...dataDetail,
            name: decryptValue(dataSessionKey?.decrytSecretKey, `${dataDetail?.name}`),
            description: decryptValue(dataSessionKey?.decrytSecretKey, `${dataDetail?.description}`),
            organizationId: dataDetail?.organization?.id,
            note: decryptValue(dataSessionKey?.decrytSecretKey, `${dataDetail?.note}`),
            tagId: dataDetail?.tag?.id,
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
                    <Col span={24}>
                        <CropImageField
                            label={translate.formatMessage(commonMessage.logo)}
                            name="logo"
                            imageUrl={imageUrl && `${AppConstants.contentRootUrl}${imageUrl}`}
                            aspect={1 / 1}
                            uploadFile={uploadFile}
                        />
                    </Col>
                    <Col span={12}>
                        <TextField
                            label={<FormattedMessage defaultMessage="Project" />}
                            name="name"
                            required
                        />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            label={<FormattedMessage defaultMessage="Organization" />}
                            name="organizationId"
                            options={organizationData}
                        />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            name="tagId"
                            label={<FormattedMessage defaultMessage={'Tag'} />}
                            options={tagData}
                            disabled={dataDetail?.tag?.id == TAG_KIND_PROJECT }
                            renderCustomOption={renderCustomOption}
                        />
                    </Col>
                    <Col span={24}>
                        <TextField
                            label={translate.formatMessage(commonMessage.note)}
                            name="note"
                            type="textarea"
                            style={{ height: '60vh' }}
                        />
                    </Col>
                </Row>
                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

const renderCustomOption = (value, label, option) => {
    return {
        value: value,
        label: (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ marginRight: 8 }}>{limitCharacters(label, 30)}</span>
                <div style={{ width: '32px', height: '16px', backgroundColor: `${option.color}` }} color={option.color}></div>
            </div>
        ),
        labelText: label,
    };
};

export default ProjectForm;
