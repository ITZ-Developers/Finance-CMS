import { Button, Card, Col, Flex, Form, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import TextField from '@components/common/form/TextField';
import { FormattedMessage } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { BaseForm } from '@components/common/form/BaseForm';
import { decryptValue } from '@utils';
import { commonMessage } from '@locales/intl';
import { AppConstants, DEFAULT_TABLE_ISPAGED_0 } from '@constants';
import useFetch from '@hooks/useFetch';
import apiConfig from '@constants/apiConfig';
import SelectField from '@components/common/form/SelectField';
import { BaseTooltip } from '@components/common/form/BaseTooltip';
import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import FileUploadField from '@components/common/form/FileUploadField';
import useNotification from '@hooks/useNotification';
import { isJsonString } from '@store/utils';
import { stateTaskOptions } from '@constants/masterData';

const TaskForm = (props) => {
    const translate = useTranslate();
    const { formId, actions, dataDetail, onSubmit, setIsChangedFormValues, branchs, isEditing, dataSessionKey, projectId } = props;
    const [checkButton, setCheckButton] = useState([]);
    const [urlNumber, setUrlNumber] = useState(0);
    const [arrayDocument, setArrayDocument] = useState([]);
    const [imageUrl, setImageUrl] = useState(null);
    const [fileListArray, setFileListArray] = useState([]);
    const { execute: executeUpFile } = useFetch(apiConfig.file.upload);
    const notification = useNotification();
    const stateValues = translate.formatKeys(stateTaskOptions, ['label']);

    const { data: projectData } = useFetch(apiConfig.project.autocomplete, {
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
        const parsedArray = JSON.parse('[{"name":"doc 1","url":"/DOCUMENT/DOCUMENT_NmLIU2UzDl.pdf"}]');
        return mixinFuncs.handleSubmit({ 
            ...values, 
            document: JSON.stringify(values.document), 
            projectId: projectId,
        });
    };

    useEffect(() => {
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
            note: decryptValue(dataSessionKey?.decrytSecretKey, `${dataDetail?.note}`),
            projectId: dataDetail?.project?.id || Number(projectId),
            organizationId: dataDetail?.organization?.id,
            document: myArray,
        });
    }, [dataDetail]);

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

    const handleDownload = (index) => {
        console.log(arrayDocument);
        const link = document.createElement('a');
        link.href = `${AppConstants.contentRootUrl}${arrayDocument[index].url}`;
        link.download = `${imageUrl}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // const imageUrl = 'https://media-cdn-v2.laodong.vn/storage/newsportal/2023/8/26/1233821/Giai-Nhat--Dem-Sai-G.jpg'; // Thay bằng URL ảnh thực tế
        // window.open(imageUrl, '_blank');
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

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={10}>
                    <Col span={12}>
                        <TextField
                            label={<FormattedMessage defaultMessage="Task" />}
                            name="name"
                            required
                        />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            label={<FormattedMessage defaultMessage="Project" />}
                            name="projectId"
                            options={projectData}
                            // defaultValue={projectId ? projectId : ''}
                            disabled={projectId}
                            required
                        />
                    </Col>
                    {isEditing && (
                        <Col span={12}>
                            <SelectField
                                label={<FormattedMessage defaultMessage="State" />}
                                name="state"
                                options={stateValues}
                            />
                        </Col>
                    )}
                    <Col span={24}>
                        <TextField
                            label={translate.formatMessage(commonMessage.note)}
                            name="note"
                            type="textarea"
                            style={{ height: '60vh' }}
                        />
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

export default TaskForm;
