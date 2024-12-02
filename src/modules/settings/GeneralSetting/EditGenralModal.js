import { BaseForm } from '@components/common/form/BaseForm';
import NumericField from '@components/common/form/NumericField';
import RichTextField from '@components/common/form/RichTextField';
import SelectField from '@components/common/form/SelectField';
import TextField from '@components/common/form/TextField';
import { AppConstants } from '@constants';
import apiConfig from '@constants/apiConfig';
import { dataTypeSetting, dateOptions, dateTimeOptions, settingGroups } from '@constants/masterData';
import useBasicForm from '@hooks/useBasicForm';
import useFetch from '@hooks/useFetch';
import useNotification from '@hooks/useNotification';
import useTranslate from '@hooks/useTranslate';
import routes from '@routes';
import { actions } from '@store/actions/app';
import { Button, Card, Col, Form, Modal, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

const messages = defineMessages({
    objectName: 'setting',
    update: 'Cập nhật',
    updateSuccess: 'Cập nhật {objectName} thành công',
});
const EditGenralModal = ({
    open,
    onCancel,
    onOk,
    title,
    data,
    executeUpdate,
    executeLoading,
    executeGetDataSetting,
    executeLoadingRevenue,
    isEditingRevenue,
    ...props
}) => {
    const { form, mixinFuncs, onValuesChange } = useBasicForm({});
    const [isChanged, setChange] = useState(false);
    const notification = useNotification();
    const intl = useIntl();
    const translate = useTranslate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    const updateSetting = (values) => {
        executeUpdate({
            data: {
                id: data.id,
                isSystem: data.isSystem,
                status: data.status,
                valueData: values?.valueData,
            },
            onCompleted: (response) => {
                if (response.result === true) {
                    onCancel();
                    notification({
                        message: intl.formatMessage(messages.updateSuccess, {
                            objectName: translate.formatMessage(messages.objectName),
                        }),
                    });
                    executeLoading();
                    executeGetDataSetting({
                        onCompleted: (response) => {
                            const dataSetting = response?.data;
                            dispatch(actions.settingSystem(dataSetting));
                        },
                    });
                    setChange(false);
                }
            },
            onError: (err) => {},
        });
    };

    const handleInputChange = () => {
        setChange(true);
    };

    useEffect(() => {
        // form.setFields(data);
        form.setFieldsValue({
            ...data,
        });
        setLoading(false);
    }, [data]);

    const renderField = () => {
        const dataType = data.dataType;
        const keyName = data.keyName;
        if (dataType == dataTypeSetting.INT || dataType == dataTypeSetting.DOUBLE) {
            return (
                <Col span={24}>
                    <NumericField
                        label={<FormattedMessage defaultMessage="Nội dung" />}
                        name="valueData"
                        min={0}
                        max={ localStorage.getItem(routes.settingsPage.keyActiveTab) == settingGroups.REVENUE && 100}
                        formatter={(value) =>
                            localStorage.getItem(routes.settingsPage.keyActiveTab) == settingGroups.REVENUE
                                ? `${value}%`
                                : `${value}`
                        }
                        parser={(value) => value.replace('%', '')}
                        onChange={handleInputChange}
                    />
                </Col>
            );
        } else if (dataType == dataTypeSetting.RICHTEXT) {
            return (
                <Col span={24}>
                    <RichTextField
                        style={{ height: 200, marginBottom: 70 }}
                        label={<FormattedMessage defaultMessage="Nội dung" />}
                        name="valueData"
                        baseURL={AppConstants.contentRootUrl}
                        form={form}
                        setIsChangedFormValues={handleInputChange}
                    />
                </Col>
            );
        } else if (dataType == dataTypeSetting.DATE) {
            return (
                <Col span={24}>
                    <SelectField
                        label={<FormattedMessage defaultMessage="Nội dung" />}
                        name="valueData"
                        options={keyName === 'date_time_format' ? dateTimeOptions : dateOptions}
                        onChange={handleInputChange}
                    />
                </Col>
            );
        } else {
            return (
                <Col span={24}>
                    <TextField
                        label={<FormattedMessage defaultMessage="Nội dung" />}
                        name="valueData"
                        onChange={handleInputChange}
                    />
                </Col>
            );
        }
    };
    const onCancelModal = () => {
        onCancel();
        setChange(false);
    };

    return (
        <Modal centered open={open} onCancel={onCancelModal} footer={null} title={data?.keyName} {...props}>
            <Card className="card-form" bordered={false}>
                <BaseForm form={form} onFinish={updateSetting} size="100%">
                    <Row gutter={16}>{renderField()}</Row>
                    <div style={{ float: 'right' }}>
                        <Button key="submit" type="primary" htmlType="submit" disabled={!isChanged}>
                            {intl.formatMessage(messages.update)}
                        </Button>
                    </div>
                </BaseForm>
            </Card>
        </Modal>
    );
};

export default EditGenralModal;
