import { Button, Card, Col, Flex, Form, Input, Row, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import TextField from '@components/common/form/TextField';
import {
    AppConstants,
    DEFAULT_FORMAT_ZERO,
    DEFAULT_TABLE_ISPAGED_0,
    KEY_KIND_SERVER,
    SERVICE_PERIOD_KIND_MONTH,
    SERVICE_PERIOD_KIND_YEAR,
    TAG_KIND_KEY_INFORMATION,
} from '@constants';
import useFetch from '@hooks/useFetch';
import apiConfig from '@constants/apiConfig';
import { FormattedMessage } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { BaseForm } from '@components/common/form/BaseForm';
import SelectField from '@components/common/form/SelectField';
import { kindKeyOptions } from '@constants/masterData';
import { decryptValue, limitCharacters } from '@utils';
import dayjs from 'dayjs';
import { isJsonString } from '@store/utils';
import { BaseTooltip } from '@components/common/form/BaseTooltip';
import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import FileUploadField from '@components/common/form/FileUploadField';
import useNotification from '@hooks/useNotification';
import { KeyOutlined } from '@ant-design/icons';
import { getSessionStorageWithExpiry } from '@utils/sessionStorage';

const KeyInformationForm = (props) => {
    const translate = useTranslate();
    const kindValues = translate.formatKeys(kindKeyOptions, ['label']);
    const { formId, actions, dataDetail, onSubmit, setIsChangedFormValues, branchs, isEditing, dataSessionKey } = props;
    const [kind, setKind] = useState(dataDetail?.kind);
    const [checkButton, setCheckButton] = useState([]);
    const [urlNumber, setUrlNumber] = useState(0);
    const [arrayDocument, setArrayDocument] = useState([]);
    const [imageUrl, setImageUrl] = useState(null);
    const { execute: executeUpFile } = useFetch(apiConfig.file.upload);
    const notification = useNotification();
    const [fileListArray, setFileListArray] = useState([]);
    const dataValueKey = JSON.parse(getSessionStorageWithExpiry('sessionKey'));
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

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

    const handleSubmit = (values) => {
        const arrayWeb = {
            username: values?.username,
            password: values?.password,
            phoneNumber: values?.phoneNumber,
            host: values?.host,
            port: values?.port,
            privateKey: values?.privateKey,
        };
        values.additionalInformation = JSON.stringify(arrayWeb);
        delete values?.username;
        delete values?.password;
        delete values?.phoneNumber;
        delete values?.host;
        delete values?.port;
        delete values?.privateKey;
        return mixinFuncs.handleSubmit({ ...values, document: JSON.stringify(values.document) });
    };
    useEffect(() => {
        if (!isEditing) {
            setKind(KEY_KIND_SERVER);
            form.setFieldsValue({
                kind: kindValues[0].value,
            });
        }
    }, [isEditing]);

    useEffect(() => {
        const additionalInformation = decryptValue(
            dataSessionKey?.decrytSecretKey,
            `${dataDetail?.additionalInformation}`,
        );
        const dataInfo = isJsonString(additionalInformation) ? JSON.parse(additionalInformation) : {};
        if (isEditing) setKind(dataDetail?.kind);
        let myArray = [];
        if (isEditing && dataDetail?.document) {
            try {
                const arrayImage = decryptValue(dataSessionKey?.decrytSecretKey, `${dataDetail?.document}`);
                const parsedArray = isJsonString(arrayImage) ? JSON.parse(arrayImage) : arrayImage;
                myArray = parsedArray?.map((document) => ({ url: document?.url || document, name: document?.name }));
            } catch (error) {
                myArray = [{ url: dataDetail?.document }];
            }
            setArrayDocument(myArray);
            const arrayLength = myArray?.length;
            setUrlNumber(arrayLength);
            const newCheckButton = Array(arrayLength).fill(false);
            setCheckButton(newCheckButton);
        }
        form.setFieldsValue({
            ...dataDetail,
            name: decryptValue(dataSessionKey?.decrytSecretKey, `${dataDetail?.name}`),
            description: decryptValue(dataSessionKey?.decrytSecretKey, `${dataDetail?.description}`),
            additionalInformation: decryptValue(dataSessionKey?.decrytSecretKey, `${dataDetail?.additionalInformation}`),
            keyInformationGroupId: dataDetail?.keyInformationGroup?.id,
            organizationId: dataDetail?.organization?.id,
            password: dataInfo?.password,
            phoneNumber: dataInfo?.phoneNumber,
            username: dataInfo?.username,
            host: dataInfo?.host,
            port: dataInfo?.port,
            privateKey: dataInfo?.privateKey,
            document: myArray,
            tagId: dataDetail?.tag?.id,
        });
    }, [dataDetail]);
    const checkPhone = (_, value) => {
        if (value) {
            const phoneRegex = /^[0-9]{10}$/; // Regex để kiểm tra số điện thoại có 10 chữ số
            if (!phoneRegex.test(value)) {
                return Promise.reject('Số điện thoại không hợp lệ, vui lòng nhập lại');
            }
        }
        return Promise.resolve();
    };
    const checkUserName = (_, value) => {
        if (value) {
            const usernameRegex = /^.{2,}$/;
            if (!usernameRegex.test(value)) {
                return Promise.reject('Username invalid !');
            }
            return Promise.resolve();
        } else return Promise.reject('Username invalid !');
    };
    const checkPassword = (_, value) => {
        if (value) {
            const passwordRegex = /^.{6,}$/;
            if (!passwordRegex.test(value)) {
                return Promise.reject('Password invalid !');
            }
            return Promise.resolve();
        } else return Promise.reject('Password invalid !');
    };

    const handleDownload = (index) => {
        const link = document.createElement('a');
        link.href = `${AppConstants.contentRootUrl}${arrayDocument[index].url}`;
        link.download = `${imageUrl}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // const imageUrl = 'https://media-cdn-v2.laodong.vn/storage/newsportal/2023/8/26/1233821/Giai-Nhat--Dem-Sai-G.jpg'; // Thay bằng URL ảnh thực tế
        // window.open(imageUrl, '_blank');
    };

    const uploadFile = (file, onSuccess, onError) => {
        executeUpFile({
            data: {
                type: 'DOCUMENT',
                file: file,
            },
            onCompleted: (response) => {
                if (response.result === true) {
                    onSuccess();
                    setImageUrl(response.data.filePath);
                    addItem({ name: '123', url: response.data.filePath });
                    setIsChangedFormValues(true);
                    setUrlValue(urlNumber, response.data.filePath);
                    const newCheckButton = [...checkButton];
                    newCheckButton[urlNumber] = false;
                    setCheckButton(newCheckButton);
                    notification({ type: 'success', message: 'Upload file successfully' });
                }
            },
            onError: (error) => {
                onError();
                notification({ type: 'error', message: 'Upload file failed' });
            },
        });
    };

    const addItem = (newItem) => {
        setFileListArray((prevDataCustom) => [...prevDataCustom, newItem]);
    };

    const setUrlValue = (index, value) => {
        const currentValues = form.getFieldsValue();
        const documents = currentValues.document || [];
        documents[index] = { ...documents[index], url: value };
        setArrayDocument((prevArrayDocument) => [...prevArrayDocument, documents[index]]);
        form.setFieldsValue({ document: documents });
    };
    const { execute: executeTags, data: tagData } = useFetch(apiConfig.tag.autocomplete, {
        immediate: true,
        params: { kind: TAG_KIND_KEY_INFORMATION, isPaged: 0 },
        mappingData: (data) =>
            data.data.content.map((item) => ({
                value: item.id,
                label: decryptValue(dataValueKey?.decrytSecretKey, `${item.name}`),
                color: decryptValue(dataValueKey?.decrytSecretKey, `${item.colorCode}`),
                
            })),
    });

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={10}>
                    <Col span={12}>
                        <SelectField
                            name="kind"
                            label={translate.formatMessage(commonMessage.kind)}
                            required
                            options={kindValues}
                            onChange={(data) => {
                                setKind(data);
                            }}
                            disabled={isEditing}
                        />
                    </Col>
                    <Col span={12}>
                        <TextField required label={translate.formatMessage(commonMessage.name)} name="name" />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            name="organizationId"
                            label={translate.formatMessage(commonMessage.organization)}
                            options={organizationData}
                        />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            label={<FormattedMessage defaultMessage="Group Key Information" />}
                            name="keyInformationGroupId"
                            options={keyGroupData}
                            required
                        />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            name="tagId"
                            label={<FormattedMessage defaultMessage={'Tag'} />}
                            options={tagData}
                            disabled={dataDetail?.tag?.id == TAG_KIND_KEY_INFORMATION }
                            renderCustomOption={renderCustomOption}
                        />
                    </Col>
                    <Col span={24}>
                        <TextField
                            label={translate.formatMessage(commonMessage.description)}
                            name="description"
                            type="textarea"
                            style={{ height: 250 }}
                        />
                    </Col>
                    <Col span={24}>
                        <fieldset>
                            <legend>
                                <b>{<FormattedMessage defaultMessage={'Additional Information'} />}</b>
                            </legend>
                            {kind == KEY_KIND_SERVER ? (
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <TextField
                                            label={translate.formatMessage(commonMessage.username)}
                                            name={'username'}
                                            rules={[
                                                {
                                                    required: true,
                                                    validator: checkUserName,
                                                },
                                            ]}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label={translate.formatMessage(commonMessage.password)}
                                            name={['password']}
                                            rules={[
                                                {
                                                    validator: checkPassword,
                                                },
                                            ]}
                                        >
                                            <Input.Password 
                                                addonAfter={
                                                    <Tooltip title={'Genarate password'} placement={'bottom'}>
                                                        <KeyOutlined
                                                            style={{
                                                                color: '#1f1f1f',
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                form.setFieldValue('password', generatePassword());
                                                            }}
                                                        />
                                                    </Tooltip>
                                                }/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <TextField
                                            label={translate.formatMessage(commonMessage.host)}
                                            name={['host']}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <TextField
                                            label={translate.formatMessage(commonMessage.port)}
                                            name={['port']}
                                        />
                                    </Col>
                                    <Col span={24}>
                                        <TextField
                                            label={translate.formatMessage(commonMessage.privateKey)}
                                            name={['privateKey']}
                                            type="textarea"
                                        />
                                    </Col>
                                </Row>
                            ) : (
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <TextField
                                            label={translate.formatMessage(commonMessage.username)}
                                            name={'username'}
                                            rules={[
                                                {
                                                    required: true,
                                                    validator: checkUserName,
                                                },
                                            ]}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label={translate.formatMessage(commonMessage.password)}
                                            name={['password']}
                                            rules={[
                                                {
                                                    required: true,
                                                    validator: checkPassword,
                                                },
                                            ]}
                                        >
                                            <Input.Password 
                                                addonAfter={
                                                    <Tooltip title={'Genarate password'} placement={'bottom'}>
                                                        <KeyOutlined
                                                            style={{
                                                                color: 'rgba(0,0,0,.25)',
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                form.setFieldValue('password', generatePassword());
                                                            }}
                                                        />
                                                    </Tooltip>
                                                }/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <TextField
                                            label={translate.formatMessage(commonMessage.phone)}
                                            name={['phoneNumber']}
                                            rules={[
                                                {
                                                    validator: checkPhone,
                                                },
                                            ]}
                                        />
                                    </Col>
                                </Row>
                            )}
                        </fieldset>
                    </Col>
                    <Col span={24}>
                        {
                            <Card title={'Document'} size="small" style={{ marginBottom: '18px', marginTop: '16px' }}>
                                <Form.List name="document">
                                    {(fields, { add, remove }) => (
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                            }}
                                        >
                                            {fields.map((field, index) => {
                                                setUrlNumber(index);
                                                return (
                                                    <Row key={field.key} gutter={12}>
                                                        <Col span={22}>
                                                            <TextField
                                                                required
                                                                name={[field.name, 'name']}
                                                                placeholder={translate.formatMessage(
                                                                    commonMessage.nameUrl,
                                                                )}
                                                            />
                                                        </Col>
                                                        {checkButton[index] == true ? (
                                                            <Col span={1}>
                                                                <FileUploadField
                                                                    labelUpload={translate.formatMessage(
                                                                        commonMessage.document,
                                                                    )}
                                                                    // name="document"
                                                                    imageUrl={
                                                                        imageUrl &&
                                                                        `${AppConstants.contentRootUrl}${imageUrl}`
                                                                    }
                                                                    aspect={1 / 1}
                                                                    uploadFile={uploadFile}
                                                                    filePath={imageUrl}
                                                                    accept={'.pdf,.png,.jpg,.zip,.txt'}
                                                                    fileList={fileListArray}
                                                                    setFileListArray={setFileListArray}
                                                                    setIsChangedFormValues={setIsChangedFormValues}
                                                                />
                                                            </Col>
                                                        ) : (
                                                            <Col span={1}>
                                                                {
                                                                    <Flex gap={6}>
                                                                        <BaseTooltip title={'Delete Document'}>
                                                                            <Button
                                                                                icon={<DeleteOutlined />}
                                                                                type="link"
                                                                                onClick={() => {
                                                                                    remove(field.name);
                                                                                    setCheckButton((prev) => {
                                                                                        const newCheckButton = [
                                                                                            ...prev,
                                                                                        ];
                                                                                        newCheckButton.splice(
                                                                                            index,
                                                                                            1,
                                                                                        );
                                                                                        return newCheckButton;
                                                                                    });
                                                                                    setArrayDocument((prev) => {
                                                                                        const newCheckButton = [
                                                                                            ...prev,
                                                                                        ];
                                                                                        newCheckButton.splice(
                                                                                            index,
                                                                                            1,
                                                                                        );
                                                                                        return newCheckButton;
                                                                                    });
                                                                                }}
                                                                                // disabled={
                                                                                //     dataDetail?.state ==
                                                                                //     TRANSACTION_STATE_PAID
                                                                                // }
                                                                                style={{
                                                                                    color: 'red',
                                                                                    // width: 170,
                                                                                }}
                                                                            />
                                                                        </BaseTooltip>
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
                                                                    </Flex>
                                                                }
                                                            </Col>
                                                        )}
                                                    </Row>
                                                );
                                            })}

                                            {
                                                <Row>
                                                    <Col span={22}>
                                                        <Button
                                                            // disabled={dataDetail?.state == TRANSACTION_STATE_PAID}
                                                            type="dashed"
                                                            onClick={() => {
                                                                add();
                                                                setCheckButton([...checkButton, true]);
                                                            }}
                                                            block
                                                        >
                                                            + <FormattedMessage defaultMessage="Thêm Tài liệu" />
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            }
                                        </div>
                                    )}
                                </Form.List>
                            </Card>
                        }
                    </Col>
                </Row>
                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

function generatePassword() {
    const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    
    const allChars = upperCaseChars + lowerCaseChars + numbers;
    let password = '';

    // Đảm bảo có ít nhất 1 ký tự chữ hoa, 1 chữ thường, và 1 số
    password += upperCaseChars[Math.floor(Math.random() * upperCaseChars.length)];
    password += lowerCaseChars[Math.floor(Math.random() * lowerCaseChars.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];

    // Tạo các ký tự còn lại ngẫu nhiên từ tập hợp tất cả các ký tự
    for (let i = password.length; i < 8; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Trộn các ký tự để mật khẩu không có cấu trúc dễ đoán
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    return password;
}

const renderCustomOption = (value, label, option) => {
    return {
        value: value,
        label: (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ marginRight: 8 }}>{limitCharacters(label, 30)}</span>
                <div style={{ width: '32px', height: '16px', backgroundColor: `${option.color}` }} color={option.color}></div>
            </div>
        ),
        labelText: label,
    };
};


export default KeyInformationForm;
