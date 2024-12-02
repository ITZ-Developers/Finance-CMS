import { Button, Col, Form, Modal, Row, Space, Tag, Tooltip } from 'antd';
import React, { useEffect } from 'react';
import useTranslate from '@hooks/useTranslate';
import { BaseForm } from '../BaseForm';
import { getSessionStorageWithExpiry, sessionStorageWrapper, setSessionStorageWithExpiry } from '@utils/sessionStorage';
import TextField from '../TextField';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';
import { decryptRSA, encryptRSA } from '@utils';
import useNotification from '@hooks/useNotification';
import { showErrorMessage } from '@services/notifyService';

const ModalSession = ({ open, close, setCheckKey }) => {
    const translate = useTranslate();
    const [form] = Form.useForm();
    const dataValueKey = JSON.parse(getSessionStorageWithExpiry('sessionKey'));
    const { execute: getMyKey } = useFetch(apiConfig.account.getMyKey, {
        immediate: false,
    });

    const handleFinish = (values) => {
        getMyKey({
            onCompleted: (res) => {
                values.decrytSecretKey = decryptRSA(values.privateKey, res.data.secretKey);
                if (values.decrytSecretKey == null) showErrorMessage('Private key invalid');
                else {
                    setSessionStorageWithExpiry('sessionKey', JSON.stringify(values), 3 * 60 * 60 * 1000);
                    form.resetFields();
                    setCheckKey(true);
                }
            },
        });
        close();
    };

    const handleDeleteKey = (values) => {
        close();
        form.resetFields();
    };

    const handleCancel = (values) => {
        close();
        form.resetFields();
    };

    return (
        <Modal
            title={<span>{'Nhập Session Key'}</span>}
            open={open}
            onCancel={handleCancel}
            footer={null}
        >
            <BaseForm
                form={form}
                onFinish={(values) => {
                    handleFinish(values);
                }}
                size="100%"
            >
                <div style={{ marginTop: 10 }}>
                    <Row>
                        <Col span={24}>
                            <TextField
                                label={'Private key'}
                                name="privateKey"
                                type="textarea"
                                style={{ height: 200 }}
                                required
                            />
                        </Col>
                        {/* {dataValueKey?.decrytSecretKey && (
                            <Col span={24}>
                                <TextField
                                    label={'Secret key'}
                                    name="decrytSecretKey"
                                    // type="textarea"
                                    readOnly
                                />
                            </Col>
                        )} */}
                    </Row>
                    <Row justify={'end'}>
                        <Button onClick={handleCancel}>Cancel</Button>
                        {/* <Button type="dashed" style={{ marginLeft: 5 }} onClick={handleDeleteKey} disabled={!dataValueKey}>Delete key</Button> */}
                        <Button key="submit" htmlType="submit" type="primary" style={{ marginLeft: 5 }}>
                            {'Ok'}
                        </Button>
                    </Row>
                </div>
            </BaseForm>
        </Modal>
    );
};

export default ModalSession;
