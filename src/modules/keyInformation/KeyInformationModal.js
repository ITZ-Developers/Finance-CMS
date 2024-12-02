import { BaseForm } from '@components/common/form/BaseForm';
import SelectField from '@components/common/form/SelectField';
import TextField from '@components/common/form/TextField';
import { AppConstants, DEFAULT_TABLE_ISPAGED_0, KEY_KIND_SERVER, WidthDialogDetail } from '@constants';
import apiConfig from '@constants/apiConfig';
import { kindKeyOptions } from '@constants/masterData';
import useFetch from '@hooks/useFetch';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { isJsonString } from '@store/utils';
import { copyToClipboard, decryptValue } from '@utils';
import { Button, Card, Col, Flex, Form, Input, Modal, Row, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { CopyOutlined } from '@ant-design/icons';
import { BaseTooltip } from '@components/common/form/BaseTooltip';
import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';

const messages = defineMessages({
    objectName: 'Chi tiết Key information',
    update: 'Cập nhật',
    create: 'Thêm mới',
    createSuccess: 'Tạo {objectName} thành công',
});
const KeyInformationModal = ({ open, onCancel, dataSessionKey, data, setDataModal }) => {
    const translate = useTranslate();
    const [form] = Form.useForm();
    const [kind, setKind] = useState(data?.kind);
    const [dataInfo, setDataInfo] = useState({});
    const [modalHeight, setModalHeight] = useState(700);
    const kindValues = translate.formatKeys(kindKeyOptions, ['label']);
    const innerHeight = window.innerHeight;
    const [ arrayDocument, setArrayDocument ] = useState([]);

    const updateModalHeight = () => {
        const modalContent = document.querySelector('.ant-modal-content');
        if (modalContent) {
            const height = modalContent.clientHeight;
            if (height > 0){
                setModalHeight(height > window.innerHeight ? '50vh' : 'max-content');
            } else {
                const heightModal = window.innerHeight > 900 ? kind == KEY_KIND_SERVER ? '70vh' :'max-content' : '80vh';
                setModalHeight(heightModal);
            }
        }
    };

    useEffect(() => {
        // Cập nhật chiều cao khi modal được mở hoặc khi kích thước màn hình thay đổi
        if (open && innerHeight) {
            updateModalHeight();
            window.addEventListener('resize', updateModalHeight);
        }

        // Cleanup sự kiện resize khi component unmount hoặc khi modal đóng
        return () => {
            window.removeEventListener('resize', updateModalHeight);
        };
    }, [open, innerHeight]);


    const handleOnCancel = () => {
        form.resetFields();
        setDataModal({});
        onCancel();
    };

    const { data: keyGroupData } = useFetch(apiConfig.keyGroup.autocomplete, {
        immediate: true,
        params: { isPaged: DEFAULT_TABLE_ISPAGED_0 },
        mappingData: (data) =>
            data.data.content.map((item) => ({
                value: item.id,
                label: decryptValue(dataSessionKey?.decrytSecretKey, `${item.name}`),
            })),
    });

    const { data: organizationData } = useFetch(apiConfig.organization.autocomplete, {
        immediate: true,
        params: { isPaged: DEFAULT_TABLE_ISPAGED_0 },
        mappingData: (data) =>
            data.data.content.map((item) => ({
                value: item.id,
                label: decryptValue(dataSessionKey?.decrytSecretKey, `${item.name}`),
            })),
    });

    useEffect(() => {
        if (data) {
            let myArray;
            if (data?.document) {
                try {
                    const arrayImage = decryptValue(dataSessionKey?.decrytSecretKey, `${data?.document}`);
                    const parsedArray = isJsonString(arrayImage) ? JSON.parse(arrayImage) : arrayImage;
                    myArray = parsedArray?.map((document) => ({ url: document?.url || document, name: document?.name }));
                } catch (error) {
                    myArray = [{ url: data?.document }];
                }
                setArrayDocument(myArray);
            }
            const additionalInformation = decryptValue(
                dataSessionKey?.decrytSecretKey,
                `${data?.additionalInformation}`,
            );
            const dataInfo = isJsonString(additionalInformation) ? JSON.parse(additionalInformation) : {};
            setDataInfo(dataInfo);
            setKind(data?.kind);
            const test = `ssh ${dataInfo?.username}@${dataInfo?.host} -p ${dataInfo?.port}`;
            console.log(dataInfo);
            form.setFieldsValue({
                ...data,
                // name: decryptValue(dataSessionKey?.decrytSecretKey, `${data?.name}`),
                description: decryptValue(dataSessionKey?.decrytSecretKey, `${data?.description}`),
                additionalInformation: decryptValue(dataSessionKey?.decrytSecretKey, `${data?.additionalInformation}`),
                keyInformationGroupId: data?.keyInformationGroup?.id,
                organizationId: data?.organization?.id,
                password: dataInfo?.password,
                phoneNumber: dataInfo?.phoneNumber,
                username: dataInfo?.username,
                host: dataInfo?.host,
                port: dataInfo?.port,
                privateKey: dataInfo?.privateKey,
                document: myArray,
                ssh: dataInfo?.username && dataInfo?.host && dataInfo?.port && test,
            });
        }
    }, [data]);

    const handleDownload = (index) => {
        const arrayDocument = form.getFieldValue('document');
        const link = document.createElement('a');
        link.href = `${AppConstants.contentRootUrl}${arrayDocument[index].url}`;
        // link.download = `${imageUrl}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Modal
            centered
            open={open}
            onCancel={handleOnCancel}
            footer={null}
            title={translate.formatMessage(messages.objectName)}
            width={WidthDialogDetail}
            styles={{
                content: {
                    padding: 15,
                    margin: 50,
                },
                body: {
                    padding: 10,
                    height:  innerHeight > 1200 ? 'max-content' : '60vh',
                },
            }}
        >
            <BaseForm form={form} size="100%" style={{ width: '100%', height: '100%', overflowX: 'hidden' }}>
                <Card className="card-form" bordered={false}>
                    <Row gutter={10}>
                        <Col span={12}>
                            <TextField
                                required
                                label={translate.formatMessage(commonMessage.name)}
                                name="name"
                                readOnly
                            />
                        </Col>
                        <Col span={12}>
                            <SelectField
                                name="organizationId"
                                label={translate.formatMessage(commonMessage.organization)}
                                options={organizationData}
                                disabled
                            />
                        </Col>
                        <Col span={12}>
                            <SelectField
                                name="kind"
                                label={translate.formatMessage(commonMessage.kind)}
                                required
                                options={kindValues}
                                disabled
                            />
                        </Col>
                        <Col span={12}>
                            <SelectField
                                label={<FormattedMessage defaultMessage="Group Key Information" />}
                                name="keyInformationGroupId"
                                options={keyGroupData}
                                disabled
                            />
                        </Col>
                        <Col span={24}>
                            <TextField
                                label={translate.formatMessage(commonMessage.description)}
                                name="description"
                                type="textarea"
                                readOnly={true}
                                style={{ height: 200 }}
                            />
                        </Col>
                        <Col span={24}>
                            <div>
                                <fieldset>
                                    <legend>
                                        <b>{<FormattedMessage defaultMessage={'Additional Information'} />}</b>
                                    </legend>
                                    {kind == KEY_KIND_SERVER ? (
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <TextField
                                                    required
                                                    label={translate.formatMessage(commonMessage.username)}
                                                    name={'username'}
                                                    readOnly
                                                    addonAfter={
                                                        <CopyOutlined
                                                            style={{
                                                                color: 'rgba(0,0,0,.25)',
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                copyToClipboard(dataInfo?.username);
                                                            }}
                                                        />
                                                    }
                                                />
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    label={translate.formatMessage(commonMessage.password)}
                                                    name={['password']}
                                                >
                                                    <Input.Password
                                                        readOnly
                                                        addonAfter={
                                                            <CopyOutlined
                                                                style={{
                                                                    color: 'rgba(0,0,0,.25)',
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    copyToClipboard(dataInfo?.password);
                                                                }}
                                                            />
                                                        }
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <TextField
                                                    label={translate.formatMessage(commonMessage.host)}
                                                    name={['host']}
                                                    readOnly
                                                    addonAfter={
                                                        <CopyOutlined
                                                            style={{
                                                                color: 'rgba(0,0,0,.25)',
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                copyToClipboard(dataInfo?.host);
                                                            }}
                                                        />
                                                    }
                                                />
                                            </Col>
                                            <Col span={12}>
                                                <TextField
                                                    label={translate.formatMessage(commonMessage.port)}
                                                    name={['port']}
                                                    readOnly
                                                    addonAfter={
                                                        <CopyOutlined
                                                            style={{
                                                                color: 'rgba(0,0,0,.25)',
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                copyToClipboard(dataInfo?.port);
                                                            }}
                                                        />
                                                    }
                                                />
                                            </Col>
                                            <Col span={24}>
                                                <TextField
                                                    label={<Flex gap={8}>
                                                        <span>{translate.formatMessage(commonMessage.privateKey)}</span>
                                                        <span>
                                                            <CopyOutlined
                                                                style={{
                                                                    color: 'rgba(0,0,0,.25)',
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    copyToClipboard(dataInfo?.phoneNumber);
                                                                }}
                                                            />
                                                        </span>
                                                    </Flex>}
                                                    name={['privateKey']}
                                                    readOnly
                                                    type="textarea"
                                                />
                                            </Col>
                                            <Col span={12}>
                                                <TextField
                                                    label={translate.formatMessage(commonMessage.ssh)}
                                                    name={['ssh']}
                                                    readOnly
                                                    disabled={!dataInfo?.username || !dataInfo?.host || !dataInfo?.port}
                                                    addonAfter={
                                                        <CopyOutlined
                                                            style={{
                                                                color: 'rgba(0,0,0,.25)',
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // const test = `ssh [${dataInfo?.username}]@[${dataInfo?.host}] -p [${dataInfo?.port}]`;
                                                                // console.log(dataInfo);
                                                                copyToClipboard(form.getFieldValue('ssh'));
                                                            }}
                                                        />
                                                    }
                                                />
                                            </Col>
                                        </Row>
                                    ) : (
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <TextField
                                                    required
                                                    label={translate.formatMessage(commonMessage.username)}
                                                    name={'username'}
                                                    readOnly
                                                    addonAfter={
                                                        <CopyOutlined
                                                            style={{
                                                                color: 'rgba(0,0,0,.25)',
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                copyToClipboard(dataInfo?.username);
                                                            }}
                                                        />
                                                    }
                                                />
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    label={translate.formatMessage(commonMessage.password)}
                                                    name={['password']}
                                                >
                                                    <Input.Password
                                                        readOnly
                                                        addonAfter={
                                                            <CopyOutlined
                                                                style={{
                                                                    color: 'rgba(0,0,0,.25)',
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    copyToClipboard(dataInfo?.password);
                                                                }}
                                                            />
                                                        }
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={24}>
                                                <TextField
                                                    label={translate.formatMessage(commonMessage.phone)}
                                                    name={['phoneNumber']}
                                                    readOnly
                                                    addonAfter={
                                                        <CopyOutlined
                                                            style={{
                                                                color: 'rgba(0,0,0,.25)',
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                copyToClipboard(dataInfo?.phoneNumber);
                                                            }}
                                                        />
                                                    }
                                                />
                                            </Col>
                                        </Row>
                                    )}
                                </fieldset>
                            </div>
                        </Col>
                        <Col span={24}>
                            {
                                arrayDocument?.length > 0 && <Card title={'Document'} size="small" style={{ marginBottom: '18px', marginTop: '16px' }}>
                                    <Form.List name="document">
                                        {(fields, { add, remove }) => (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                }}
                                            >
                                                {fields.map((field, index) => {
                                                    return (
                                                        <Row key={field.key} gutter={16}>
                                                            <Col span={22}>
                                                                <TextField
                                                                    required
                                                                    name={[field.name, 'name']}
                                                                    placeholder={translate.formatMessage(
                                                                        commonMessage.nameUrl,
                                                                    )}
                                                                />
                                                            </Col>

                                                            <Col span={1}>
                                                                {
                                                                    <BaseTooltip title={'Download Document'}>
                                                                        <Button
                                                                            icon={<DownloadOutlined />}
                                                                            type="link"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDownload(index);
                                                                            }}
                                                                            disabled={false}
                                                                        />
                                                                    </BaseTooltip>
                                                                }
                                                            </Col>
                                                        </Row>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </Form.List>
                                </Card>
                            }
                        </Col>
                    </Row>
                </Card>
            </BaseForm>
        </Modal>
    );
};

export default KeyInformationModal;
