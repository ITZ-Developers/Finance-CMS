import { Card, Col, Row } from 'antd';
import React, { useEffect } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import TextField from '@components/common/form/TextField';
import apiConfig from '@constants/apiConfig';
import { defineMessages, FormattedMessage } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { BaseForm } from '@components/common/form/BaseForm';
import { decryptValue } from '@utils';
import SelectField from '@components/common/form/SelectField';
import useFetch from '@hooks/useFetch';
import { DEFAULT_TABLE_ISPAGED_0 } from '@constants';

const message = defineMessages({
    objectName: 'service',
});

const NotificationGroupForm = (props) => {
    const translate = useTranslate();
    const { formId, actions, dataDetail, onSubmit, setIsChangedFormValues, branchs, isEditing, dataSessionKey } = props;
    const { data: serviceData } = useFetch(apiConfig.service.autocomplete, {
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
        return mixinFuncs.handleSubmit({ ...values });
    };

    useEffect(() => {
        form.setFieldsValue({
            ...dataDetail,
            serviceId: dataDetail?.service?.id,
            name: decryptValue(dataSessionKey?.decrytSecretKey, `${dataDetail?.name}`),
            description: decryptValue(dataSessionKey?.decrytSecretKey, `${dataDetail?.description}`),
        });
    }, [dataDetail]);
    const { data: notificationGroupData } = useFetch(apiConfig.notificationGroup.autocomplete, {
        immediate: true,
        params: { isPaged: DEFAULT_TABLE_ISPAGED_0 },
        mappingData: (data) =>
            data.data.content.map((item) => ({
                value: item.id,
                label: decryptValue(dataSessionKey?.decrytSecretKey, `${item.name}`),
            })),
    });

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={10}>
                    <Col span={24}>
                        <SelectField
                            label={<FormattedMessage defaultMessage="Notification Group" />}
                            name="notificationGroupId"
                            options={notificationGroupData}
                        />
                    </Col>
                </Row>
                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};


export default NotificationGroupForm;
