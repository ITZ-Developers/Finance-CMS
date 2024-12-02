import { Card, Col, Row } from 'antd';
import React, { useEffect } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import TextField from '@components/common/form/TextField';
import { defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { BaseForm } from '@components/common/form/BaseForm';
import { decryptValue } from '@utils';
import AutoCompleteField from '@components/common/form/AutoCompleteField';
import apiConfig from '@constants/apiConfig';

const message = defineMessages({
    objectName: 'key group transaction',
});

const UserTransactionForm = (props) => {
    const translate = useTranslate();
    const { formId, actions, dataDetail, onSubmit, setIsChangedFormValues, branchs, isEditing, dataSessionKey } = props;

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
            name: decryptValue(dataSessionKey?.decrytSecretKey, `${dataDetail?.name}`),
            description: decryptValue(dataSessionKey?.decrytSecretKey, `${dataDetail?.description}`),
        });
    }, [dataDetail]);
    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false} style={{ width: '60%' }}>
                <Row gutter={10}>
                    <Col span={24}>
                        <AutoCompleteField
                            required
                            name="accountId"
                            label={'Account'}
                            apiConfig={apiConfig.account.getList}
                            mappingOptions={(item) => ({ value: item.id, label: item.fullName })}
                            searchParams={(text) => ({ fullName: text })}
                            // onChange={(data) => {
                            //     setDepartment(data);
                            // }}
                        />
                    </Col>
                </Row>
                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default UserTransactionForm;
