import { Card, Col, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import TextField from '@components/common/form/TextField';
import { defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { BaseForm } from '@components/common/form/BaseForm';
import SelectField from '@components/common/form/SelectField';
import { formSize, statusOptions } from '@constants/masterData';
import timezone from '@constants/timezone.json';

const message = defineMessages({
    objectName: 'setting',
});

const SettingForm = (props) => {
    const translate = useTranslate();
    const { formId, actions, dataDetail, onSubmit, setIsChangedFormValues, isEditing, size = 'small' } = props;
    const statusValues = translate.formatKeys(statusOptions, ['label']);
    const [otherData, setOther] = useState({});

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

    const handleSubmit = (values) => {
        if (dataDetail.groupName == 'Timezone') {
            return mixinFuncs.handleSubmit({ ...values, settingValue: JSON.stringify(otherData) });
        }
        return mixinFuncs.handleSubmit({ ...values });
    };
    const onSelectTimezone = (value, item) => {
        setOther({ name: value, offset: item.offset });
    };
    useEffect(() => {
        form.setFieldsValue({
            ...dataDetail,
            timezone: dataDetail.groupName == 'Timezone' ? JSON.parse(dataDetail.settingValue).name : '',
        });
        localStorage.setItem('activeSettingTab', dataDetail?.groupName);
    }, [dataDetail]);
    useEffect(() => {
        if (!isEditing) {
            form.setFieldsValue({
                status: statusValues[0].value,
            });
        }
    }, [isEditing]);
    return (
        <BaseForm
            id={formId}
            onFinish={handleSubmit}
            form={form}
            onValuesChange={onValuesChange}
            style={{ width: formSize[size] ?? size }}
        >
            <Card className="card-form" bordered={false}>
                <Row>
                    <Col span={24}>
                        {dataDetail.groupName == 'Timezone' ? (
                            <SelectField
                                onSelect={onSelectTimezone}
                                name="timezone"
                                label={translate.formatMessage(commonMessage.settingValue)}
                                options={timezone}
                            />
                        ) : (
                            <TextField
                                label={translate.formatMessage(commonMessage.settingValue)}
                                required
                                name="settingValue"
                            />
                        )}
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <TextField
                            label={translate.formatMessage(commonMessage.description)}
                            type="textarea"
                            name="description"
                        />
                    </Col>
                </Row>

                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default SettingForm;
