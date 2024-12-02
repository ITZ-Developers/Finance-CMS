import { Card, Col, Form, Row, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import TextField from '@components/common/form/TextField';
import CropImageField from '@components/common/form/CropImageField';
import { AppConstants } from '@constants';
import useFetch from '@hooks/useFetch';
import apiConfig from '@constants/apiConfig';
import SelectField from '@components/common/form/SelectField';
import useTranslate from '@hooks/useTranslate';
import { statusOptions } from '@constants/masterData';
import RichTextField from '@components/common/form/RichTextField';
import CheckboxField from '@components/common/form/CheckboxField';
import './NewsForm.scss';
import { FormattedMessage } from 'react-intl';
import { BaseForm } from '@components/common/form/BaseForm';
import AutoCompleteField from '@components/common/form/AutoCompleteField';
const NewsForm = ({ formId, actions, dataDetail, onSubmit, setIsChangedFormValues, categories, isEditing }) => {
    const { execute: executeUpFile } = useFetch(apiConfig.file.upload);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [bannerUrl, setBannerUrl] = useState(null);
    const translate = useTranslate();
    const statusValues = translate.formatKeys(statusOptions, ['label']);

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

    const uploadFile = (file, onSuccess, onError, setImageUrl) => {
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
        return mixinFuncs.handleSubmit({
            ...values,
            avatar: avatarUrl,
            banner: bannerUrl,
            pinTop: Number(values.pinTop),
        });
    };

    useEffect(() => {
        form.setFieldsValue({
            ...dataDetail,
            categoryId: dataDetail?.category?.id,
        });

        setAvatarUrl(dataDetail.avatar);
        setBannerUrl(dataDetail.banner);
    }, [dataDetail]);

    useEffect(() => {
        if (!isEditing) {
            form.setFieldsValue({
                status: statusValues[0].value,
                categoryId: categories?.[0].value,
            });
        }
    }, [isEditing, categories]);

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={10}>
                    <Col span={12}>
                        <CropImageField
                            label={<FormattedMessage defaultMessage="Avatar" />}
                            name="image"
                            imageUrl={avatarUrl && `${AppConstants.contentRootUrl}${avatarUrl}`}
                            aspect={1 / 1}
                            uploadFile={(...args) => uploadFile(...args, setAvatarUrl)}
                        />
                    </Col>
                    <Col span={12}>
                        <CropImageField
                            label={<FormattedMessage defaultMessage="Banner" />}
                            name="banner"
                            imageUrl={bannerUrl && `${AppConstants.contentRootUrl}${bannerUrl}`}
                            aspect={16 / 9}
                            uploadFile={(...args) => uploadFile(...args, setBannerUrl)}
                        />
                    </Col>
                </Row>
                <Row gutter={10}>
                    <Col span={24}>
                        <TextField required label={<FormattedMessage defaultMessage="Title" />} name="title" />
                    </Col>
                    
                </Row>
                <Row gutter={10}>

                    <Col span={12}>
                        <AutoCompleteField
                            required
                            label={<FormattedMessage defaultMessage="Danh mục tin tức" />}
                            name="categoryId"
                            apiConfig={apiConfig.category.autocomplete}
                            mappingOptions={(item) => ({ value: item.id, label: item.name })}
                            initialSearchParams={{ kind: 1 }}
                            searchParams={(text) => ({ fullName: text })}
                        />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            required
                            label={<FormattedMessage defaultMessage="Status" />}
                            name="status"
                            options={statusValues}
                        />
                    </Col>
                    <Col span={24}>
                        <TextField
                            required
                            label={<FormattedMessage defaultMessage="Description" />}
                            name="description"
                            type="textarea"
                        />
                    </Col>
                </Row>
                {/* <Space align="center" style={{ marginBottom: 24 }}>
                    <label htmlFor="pinTop">
                        <FormattedMessage defaultMessage="Pin Top" />
                    </label>
                    <CheckboxField
                        formItemProps={{
                            className: 'pin-top-field',
                        }}
                        name="pinTop"
                    />
                </Space> */}

                <RichTextField
                    label={<FormattedMessage defaultMessage="Content" />}
                    name="content"
                    required
                    style={{ height: 500, marginBottom: 40 }}
                />

                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default NewsForm;
