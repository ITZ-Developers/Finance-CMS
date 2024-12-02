import TextField from '@components/common/form/TextField';
import { Card, Col, Form, Modal, Row, Button } from 'antd';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { BaseForm } from '@components/common/form/BaseForm';
import useNotification from '@hooks/useNotification';
import { defineMessages } from 'react-intl';
import { useIntl } from 'react-intl';
import useTranslate from '@hooks/useTranslate';

const messages = defineMessages({
    objectName: 'setting',
    update: 'Cập nhật',
    updateSuccess: 'Cập nhật {objectName} thành công',
});
const IntroduceModal = ({
    open,
    onCancel,
    onOk,
    title,
    data,
    introduceData,
    executeUpdate,
    executeLoading,
    ...props
}) => {
    const [form] = Form.useForm();
    const [isChanged, setChange] = useState(false);
    const notification = useNotification();
    const intl = useIntl();
    const translate = useTranslate();
    const updateSetting = (values) => {
        executeUpdate({
            data: {
                id: data.id,
                isSystem: data.isSystem,
                status: data.status,
                valueData: JSON.stringify(values),
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
            ...introduceData,
        });
    }, [introduceData]);
    return (
        <Modal centered open={open} onCancel={onCancel} footer={null} title={data?.keyName} {...props}>
            <Card className="card-form" bordered={false}>
                <BaseForm form={form} onFinish={updateSetting} size="100%">
                    <Row gutter={16}>
                        <Col span={24}>
                            <TextField
                                label={<FormattedMessage defaultMessage="Tiêu đề" />}
                                name="title"
                                onChange={handleInputChange}
                            />
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <TextField
                                label={<FormattedMessage defaultMessage="Nội dung" />}
                                name="message"
                                onChange={handleInputChange}
                                type="textarea"
                            />
                        </Col>
                    </Row>
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

export default IntroduceModal;
