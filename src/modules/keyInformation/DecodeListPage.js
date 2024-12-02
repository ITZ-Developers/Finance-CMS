import apiConfig from '@constants/apiConfig';
import { Button, Card, Col, Flex, Form, Row, Tag, Tooltip, Upload } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import PageWrapper from '@components/common/layout/PageWrapper';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { useLocation } from 'react-router-dom';
import { copyToClipboard, decryptValue, orderNumber } from '@utils';
import { CopyOutlined } from '@ant-design/icons';
import { showErrorMessage, showSucsessMessage } from '@services/notifyService';
import { BaseForm } from '@components/common/form/BaseForm';
import TextField from '@components/common/form/TextField';
import useFetch from '@hooks/useFetch';

const DecodeListPage = ({ pageOptions }) => {
    const translate = useTranslate();
    const location = useLocation();
    const { pathname: pagePath } = useLocation();
    const search = location.search;
    const [form] = Form.useForm();
    const [ decryptedValue, setDecryptedValue ] = useState(null);
    const { execute: executeDecrypt } = useFetch(apiConfig.keyInformation.decrypt, {
        immediate: false,
    });
    const [isFormChanged, setIsFormChanged] = useState(false);

    const handleDecrypt = () => {
        // const value = form.getFieldsValue();
        // console.log(value);
        executeDecrypt({
            data: { value: form.getFieldValue('valueEncode') },
            onCompleted: (res) => {
                form.setFieldValue('valueDecode', '********************');
                setDecryptedValue(res.data.decryptedValue);
                showSucsessMessage('Decrypt successfully !');
            },
            onError: (res) => {
                showErrorMessage('Decrypt failed !');
            },
        });
    };

    const DecodeForm = () => {
        return (
            <BaseForm form={form} id={'decode'} style={{ width: '40vw' }}>
                <Card className="card-form" bordered={true}>
                    <Row gutter={10}>
                        {location.key == 'default' && <Col span={24} align={'center'}>
                            <span style={{ color: '#1f1f1f', fontSize: 22, fontWeight: 500 }}>{'DECODE KEY'}</span>
                        </Col>}
                        <Col span={24}>
                            <TextField
                                label={translate.formatMessage(commonMessage.stringEncode)}
                                name="valueEncode"
                                type="textarea"
                                required
                                style={{ height: 250 }}
                                onChange={(e) => {
                                    console.log(e.target.value);
                                    if (e.target.value == '') setIsFormChanged(true);
                                    else setIsFormChanged(false);
                                }}
                            />
                        </Col>
                        <Col span={24}>
                            <TextField
                                label={translate.formatMessage(commonMessage.stringDecode)}
                                name={'valueDecode'}
                                readOnly
                                addonAfter={
                                    <CopyOutlined
                                        style={{
                                            color: 'rgba(0,0,0,.25)',
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.log(decryptedValue);
                                            copyToClipboard(decryptedValue);
                                        }}
                                    />
                                }
                            />
                        </Col>
                        <Col span={24} align="end">
                            <Button type="primary" onClick={() => handleDecrypt()} disabled={isFormChanged}>
                                Decode
                            </Button>
                        </Col>
                    </Row>
                    {/* <div className="footer-card-form">{actions}</div> */}
                </Card>
            </BaseForm>
        );
    };

    return location.key == 'default' ? (
        <Flex align="center" justify="center" style={{ height: '100vh' }}>
            <DecodeForm />
        </Flex>
    ) : (
        <PageWrapper routes={pageOptions.renderBreadcrumbs(commonMessage, translate)}>
            <DecodeForm />
        </PageWrapper>
    );
};

export default DecodeListPage;
