import AutoCompleteField from '@components/common/form/AutoCompleteField';
import { BaseForm } from '@components/common/form/BaseForm';
import { BaseTooltip } from '@components/common/form/BaseTooltip';
import DatePickerField from '@components/common/form/DatePickerField';
import FileUploadField from '@components/common/form/FileUploadField';
import NumericField from '@components/common/form/MoneyField';
import SelectField from '@components/common/form/SelectField';
import TextField from '@components/common/form/TextField';
import { AppConstants, DEFAULT_FORMAT, DEFAULT_TABLE_ISPAGED_0, TAG_KIND_TRANSACTION, TRANSACTION_STATE_PAID } from '@constants';
import apiConfig from '@constants/apiConfig';
import { kindOptions, stateTransactionOptions, statusOptions } from '@constants/masterData';
import useAuth from '@hooks/useAuth';
import useBasicForm from '@hooks/useBasicForm';
import useFetch from '@hooks/useFetch';
import useNotification from '@hooks/useNotification';
import useSettingUnit from '@hooks/useSettingUnit';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { isJsonString } from '@store/utils';
import { convertUtcToLocalTime, decryptValue, formatDateLocalToUtc } from '@utils';
import { getSessionStorageWithExpiry } from '@utils/sessionStorage';
import { Button, Card, Col, Flex, Form, Row } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';

const DebitForm = ( props ) => {
    const translate = useTranslate();
    const { formId, actions, dataDetail, onSubmit, setIsChangedFormValues, branchs, isEditing, dataSessionKey } = props;
    const [kind, setKind] = useState(dataDetail?.kind);
    const statusValues = translate.formatKeys(statusOptions, ['label']);
    const kindValues = translate.formatKeys(kindOptions, ['label']);
    const stateValues = translate.formatKeys(stateTransactionOptions, ['label']);
    const dataValueKey = JSON.parse(getSessionStorageWithExpiry('sessionKey'));
    const [imageUrl, setImageUrl] = useState(null);
    const { execute: executeUpFile } = useFetch(apiConfig.file.upload);
    const notification = useNotification();
    const [fileListArray, setFileListArray] = useState([]);
    const [urlNumber, setUrlNumber] = useState(0);
    const [checkButton, setCheckButton] = useState([]);
    const [arrayDocument, setArrayDocument] = useState([]);
    const [categoryData, setCategoryData] = useState([{ value: null, label: null }]);
    const { dateUnit } = useSettingUnit();
    const { permissionCodes, profile } = useAuth();
    
    const { execute: executeTags, data: tagData } = useFetch(apiConfig.tag.autocomplete, {
        immediate: true,
        params: { kind: TAG_KIND_TRANSACTION, isPaged: 0 },
        mappingData: (data) =>
            data.data.content.map((item) => ({
                value: item.id,
                label: decryptValue(dataValueKey?.decrytSecretKey, `${item.name}`),
                colorCode: decryptValue(dataValueKey?.decrytSecretKey, `${item.colorCode}`),
                
            })),
    });

    const { execute: executeCategory } = useFetch(apiConfig.category.autocomplete, {
        immediate: false,
        mappingData: (data) =>
            data.data.content.map((item) => ({
                value: item.id,
                label: decryptValue(dataValueKey?.decrytSecretKey, `${item.name}`),
            })),
    });
    const { data: transactionGroupData } = useFetch(apiConfig.groupTransaction.autocomplete, {
        immediate: true,
        params: { isPaged: DEFAULT_TABLE_ISPAGED_0 },
        mappingData: (data) =>
            data.data.content.map((item) => ({
                value: item.id,
                label: decryptValue(dataValueKey?.decrytSecretKey, `${item.name}`),
            })),
    });

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

    useEffect(() => {
        executeCategory({
            params: { kind: dataDetail?.kind || kind, isPaged: DEFAULT_TABLE_ISPAGED_0 },
            onCompleted: (res) => {
                const array =
                    res?.data?.totalElements != 0
                        ? res.data.content.map((item) => ({
                            value: item.id,
                            label: decryptValue(dataValueKey?.decrytSecretKey, `${item.name}`),
                        }))
                        : [{ value: null, label: null }];
                setCategoryData(array);
            },
            onError: () => {
                const array = [];
                setCategoryData(array);
            },
        });
    }, [kind, dataDetail]);

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

    const handleSubmit = (values) => {
        values.transactionDate =
            values.transactionDate && formatDateLocalToUtc(values.transactionDate, DEFAULT_FORMAT, false);
        return mixinFuncs.handleSubmit({
            ...values,
            document: JSON.stringify(values.document),
            ignoreDebit: values.ignoreDebit ? 0 : 1,
        });
    };
    useEffect(() => {
        if (!isEditing) {
            form.setFieldsValue({
                status: statusValues[0].value,
                state: stateValues[0].value,
                addedBy: profile.id,
            });
        }
    }, [isEditing]);

    useEffect(() => {
        let myArray = [];
        if (isEditing && dataDetail?.document) {
            try {
                const arrayImage = decryptValue(dataValueKey?.decrytSecretKey, `${dataDetail?.document}`);
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
        dataDetail.transactionDate =
            dataDetail.transactionDate &&
            dayjs(convertUtcToLocalTime(dataDetail.transactionDate, DEFAULT_FORMAT, DEFAULT_FORMAT), DEFAULT_FORMAT);
        if (dataDetail && isEditing) {
            form.setFieldsValue({
                ...dataDetail,
                kind: dataDetail?.kind,
                categoryId: dataDetail?.category?.id,
                transactionGroupId: dataDetail?.transactionGroup?.id,
                name: decryptValue(dataValueKey?.decrytSecretKey, `${dataDetail?.name}`),
                money: decryptValue(dataValueKey?.decrytSecretKey, `${dataDetail?.money}`),
                note: decryptValue(dataValueKey?.decrytSecretKey, `${dataDetail?.note}`),
                document: myArray,
                addedBy: dataDetail?.addedBy?.id || profile?.id,
                approvedBy: dataDetail?.approvedBy?.id,
                ignoreDebit: dataDetail?.ignoreDebit == 1 ? 0 : 1,
                tagId: dataDetail?.tag?.id,
            });
        }
    }, [dataDetail]);

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

    const handleDownload = (index) => {
        const link = document.createElement('a');
        link.href = `${AppConstants.contentRootUrl}${arrayDocument[index].url}`;
        link.download = `${imageUrl}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={10}>
                    <Col span={24}></Col>
                    <Col span={12}>
                        <TextField
                            required
                            label={translate.formatMessage(commonMessage.name)}
                            name="name"
                            readOnly={dataDetail.state == TRANSACTION_STATE_PAID}
                        />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            name="kind"
                            label={translate.formatMessage(commonMessage.kind)}
                            required
                            options={kindValues}
                            onChange={(data) => {
                                setKind(data);
                                form.setFieldValue('categoryId', null);
                            }}
                            disabled={isEditing}
                        />
                    </Col>

                    <Col span={12}>
                        <NumericField
                            label={<FormattedMessage defaultMessage={'Tổng tiền'} />}
                            name="money"
                            min={0}
                            addonAfter="₫"
                            defaultValue={0}
                            required
                            readOnly={dataDetail.state == TRANSACTION_STATE_PAID}
                        />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            name="categoryId"
                            label={translate.formatMessage(commonMessage.category)}
                            options={categoryData}
                            disabled={(!kind && !dataDetail?.kind) || dataDetail.state == TRANSACTION_STATE_PAID}
                        />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            name="state"
                            label={translate.formatMessage(commonMessage.state)}
                            required
                            options={stateValues}
                            disabled={dataDetail.state === 4}
                        />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            name="transactionGroupId"
                            label={translate.formatMessage(commonMessage.groupTransaction)}
                            options={transactionGroupData}
                            disabled={dataDetail.state == TRANSACTION_STATE_PAID}
                            required
                        />
                    </Col>
                    <Col span={12}>
                        <DatePickerField
                            showTime={false}
                            label={<FormattedMessage defaultMessage="Transaction Date" />}
                            name="transactionDate"
                            format={dateUnit}
                            style={{ width: '100%' }}
                            required
                            disabled={dataDetail.state == TRANSACTION_STATE_PAID}
                        />
                    </Col>
                    <Col span={12}>
                        <AutoCompleteField
                            required
                            name="addedBy"
                            label={'Added by'}
                            apiConfig={apiConfig.account.getList}
                            mappingOptions={(item) => ({ value: item.id, label: item.fullName })}
                            searchParams={(text) => ({ fullName: text })}
                            disabled={!permissionCodes.includes('DEB_U_FA')}
                        />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            name="tagId"
                            label={<FormattedMessage defaultMessage={'Tag'} />}
                            options={tagData}
                            disabled={dataDetail?.tag?.id == TAG_KIND_TRANSACTION }
                        />
                    </Col>
                    <Col span={24}>
                        <TextField
                            label={translate.formatMessage(commonMessage.note)}
                            name="note"
                            type="textarea"
                            readOnly={dataDetail.state == TRANSACTION_STATE_PAID}
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
                                                                    accept={'.pdf,.png,.jpg'}
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
                                                                                        newCheckButton.splice(index, 1);
                                                                                        return newCheckButton;
                                                                                    });
                                                                                    setArrayDocument((prev) => {
                                                                                        const newCheckButton = [
                                                                                            ...prev,
                                                                                        ];
                                                                                        newCheckButton.splice(index, 1);
                                                                                        return newCheckButton;
                                                                                    });
                                                                                }}
                                                                                disabled={
                                                                                    dataDetail?.state ==
                                                                                    TRANSACTION_STATE_PAID
                                                                                }
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
                                                            disabled={dataDetail?.state == TRANSACTION_STATE_PAID}
                                                            type="dashed"
                                                            onClick={() => {
                                                                add();
                                                                setCheckButton([...checkButton, true]);
                                                            }}
                                                            block
                                                        >
                                                            + <FormattedMessage defaultMessage="Add Document" />
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

export default DebitForm;
