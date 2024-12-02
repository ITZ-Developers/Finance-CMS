import { Card, Col, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import apiConfig from '@constants/apiConfig';
import { defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { BaseForm } from '@components/common/form/BaseForm';
import SelectField from '@components/common/form/SelectField';
import useFetch from '@hooks/useFetch';
import { DEFAULT_TABLE_ISPAGED_0 } from '@constants';
import AutoCompleteField from '@components/common/form/AutoCompleteField';

const message = defineMessages({
    objectName: 'service',
});

const UserNotificationForm = (props) => {
    const translate = useTranslate();
    const { formId, actions, dataDetail, onSubmit, setIsChangedFormValues, branchs, isEditing } = props;
    const [department, setDepartment] = useState();

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
        });
    }, [dataDetail]);
    // const { execute: executeAccount, data: accountData } = useFetch(apiConfig.account.getList, {
    //     immediate: false,
    //     mappingData: (data) =>
    //         data.data.content.map((item) => ({
    //             value: item.id,
    //             label: item.fullName,
    //         })),
    // });

    // useEffect(() => {
    //     executeAccount({
    //         params: { departmentId: department, isPaged: DEFAULT_TABLE_ISPAGED_0 },
    //     });
    // }, [department]);
    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={10}>
                    {/* <Col span={12}>
                        <SelectField name="accountId" label={'Account'} options={accountData} disabled={!department}/>
                    </Col> */}
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

export default UserNotificationForm;
