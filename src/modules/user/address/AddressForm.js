import { Card, Col, Form, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import TextField from '@components/common/form/TextField';
import CropImageField from '@components/common/form/CropImageField';
import { AppConstants } from '@constants';
import useFetch from '@hooks/useFetch';
import apiConfig from '@constants/apiConfig';
import { defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { BaseForm } from '@components/common/form/BaseForm';
import SelectField from '@components/common/form/SelectField';
import AutoCompleteField from '@components/common/form/AutoCompleteField';

const message = defineMessages({
    objectName: 'group permission',
});

const AddressForm = (props) => {
    const translate = useTranslate();
    const { formId, actions, dataDetail, onSubmit, setIsChangedFormValues, groups, branchs, isEditing } = props;
    const { execute: executeUpFile } = useFetch(apiConfig.file.upload);
    const [imageUrl, setImageUrl] = useState(null);
    const [isHasProvince, setIsHasProvince] = useState(isEditing ? true : false);

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
                    setIsChangedFormValues();
                }
            },
            onError: (error) => {
                onError();
            },
        });
    };

    const handleSubmit = (values) => {
        return mixinFuncs.handleSubmit({ ...values, avatar: imageUrl });
    };

    useEffect(() => {
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
                        <TextField label={translate.formatMessage(commonMessage.Name)} name="name" />
                    </Col>
                    <Col span={12}>
                        <TextField label={translate.formatMessage(commonMessage.phone)} name="phone" />
                    </Col>
                    <Col span={12}>
                        <AutoCompleteField
                            label={translate.formatMessage(commonMessage.Province)}
                            name={['provinceInfo', 'id']}
                            apiConfig={apiConfig.nation.autocomplete}
                            mappingOptions={(item) => ({ value: item.id, label: item.name })}
                            initialSearchParams={{ kind: 1 }}
                            searchParams={(text) => ({ name: text, kind: 1 })}
                            required
                        />
                    </Col>
                    <Col span={12}>
                        <AutoCompleteField
                            label={translate.formatMessage(commonMessage.District)}
                            name={['districtInfo', 'id']}
                            apiConfig={apiConfig.nation.autocomplete}
                            mappingOptions={(item) => ({ value: item.id, label: item.name })}
                            initialSearchParams={{ kind: 2 }}
                            searchParams={(text) => ({ name: text, kind: 2 })}
                            required
                        />
                    </Col>
                    <Col span={12}>
                        <AutoCompleteField
                            label={translate.formatMessage(commonMessage.Village)}
                            name={['wardInfo', 'id']}
                            apiConfig={apiConfig.nation.autocomplete}
                            mappingOptions={(item) => ({ value: item.id, label: item.name })}
                            initialSearchParams={{ kind: 3 }}
                            searchParams={(text) => ({ name: text, kind: 3 })}
                            required
                        />
                    </Col>

                    <Col span={12}>
                        <TextField label={translate.formatMessage(commonMessage.address)} name="address" />
                    </Col>
                </Row>
                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default AddressForm;
