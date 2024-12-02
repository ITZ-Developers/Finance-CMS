import { Button, Card, Col, Flex, Form, Row, Space, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import TextField from '@components/common/form/TextField';
import useFetch from '@hooks/useFetch';
import apiConfig from '@constants/apiConfig';
import { defineMessages, FormattedMessage } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { BaseForm } from '@components/common/form/BaseForm';
import SelectField from '@components/common/form/SelectField';
import { kindOptions, stateTransactionOptions, statusOptions } from '@constants/masterData';
import NumericField from '@components/common/form/MoneyField';
import { getSessionStorageWithExpiry } from '@utils/sessionStorage';
import { convertUtcToLocalTime, decryptValue, formatDateLocalToUtc, limitCharacters, validatePermission } from '@utils';
import { AppConstants, DATE_FORMAT_VALUE, DEFAULT_FORMAT, 
    DEFAULT_TABLE_ISPAGED_0, TRANSACTION_STATE_APPROVE, 
    TRANSACTION_STATE_PAID, TAG_KIND_TRANSACTION, TAG_KIND_SERVICE, 
    TAG_KIND_KEY_INFORMATION, TAG_KIND_PROJECT } from '@constants';
import useNotification from '@hooks/useNotification';
import FileUploadField from '@components/common/form/FileUploadField';
import { isJsonString } from '@store/utils';
import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { BaseTooltip } from '@components/common/form/BaseTooltip';
import DatePickerField from '@components/common/form/DatePickerField';
import dayjs from 'dayjs';
import useSettingUnit from '@hooks/useSettingUnit';
import AutoCompleteField from '@components/common/form/AutoCompleteField';
import useAuth from '@hooks/useAuth';
import CheckboxField from '@components/common/form/CheckboxField';

import styles from './index.module.scss';

const message = defineMessages({
    objectName: 'group permission',
});

const TransactionForm = (props) => {
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
    const roleCheck = isEditing ? 'TR_U_FA' : 'TR_C_FA';
    const [isDebit, setIsDebit] = useState(false);
    const handleOnChangeCheckBox = () => {
        setIsDebit(!isDebit);
    };
    const [isDisableDebit, setDisableDebit] = useState(false);


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
    const { execute: executeTags, data: tagData } = useFetch(apiConfig.tag.autocomplete, {
        immediate: true,
        params: { kind: TAG_KIND_TRANSACTION, isPaged: 0 },
        mappingData: (data) =>
            data.data.content.map((item) => ({
                value: item.id,
                label: decryptValue(dataValueKey?.decrytSecretKey, `${item.name}`),
                color: decryptValue(dataValueKey?.decrytSecretKey, `${item.colorCode}`),
                
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
                const array = res?.data?.totalElements != 0 ? res.data.content.map((item) => ({
                    value: item.id,
                    label: decryptValue(dataValueKey?.decrytSecretKey, `${item.name}`),
                })) : [{ value: null, label: null }];
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
        values.transactionDate = values.transactionDate && formatDateLocalToUtc(values.transactionDate, DEFAULT_FORMAT, false);
        return mixinFuncs.handleSubmit({ ...values,
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
        if(dataDetail && isEditing){
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
        // const imageUrl = 'https://media-cdn-v2.laodong.vn/storage/newsportal/2023/8/26/1233821/Giai-Nhat--Dem-Sai-G.jpg'; // Thay bằng URL ảnh thực tế
        // window.open(imageUrl, '_blank');
    };

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={10}>
                    <Col span={24}></Col>
                    <Col span={12}>
                        <TextField required label={translate.formatMessage(commonMessage.name)} name="name" readOnly={dataDetail.state == TRANSACTION_STATE_PAID}/>
                    </Col>
                    <Col span={6}>
                        <SelectField
                            name="kind"
                            label={translate.formatMessage(commonMessage.kind)}
                            required
                            options={kindValues}
                            onChange={(data) => {
                                setKind(data);
                                form.setFieldValue('categoryId', null);
                                if (data === 1) {
                                    setDisableDebit(true);
                                    setIsDebit(false);
                                    form.setFieldsValue({
                                        ignoreDebit: false,
                                    });
                                } else if (data === 2) {
                                    setDisableDebit(false);
                                }
                            }}
                            // disabled={isEditing}
                        />
                    </Col>
                    <Col span={6} className={styles.customCheckbox}>
                        <CheckboxField
                            optionLabel={<FormattedMessage defaultMessage="Create Debit" />}
                            name="ignoreDebit"
                            checked={isDebit}
                            onChange={handleOnChangeCheckBox}
                            disabled={isDisableDebit === true}

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
                            disabled={(!kind && !dataDetail?.kind) || (dataDetail.state == TRANSACTION_STATE_PAID)}
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
                            required={!isEditing}
                            name="addedBy"
                            label={'Added by'}
                            apiConfig={apiConfig.account.getList}
                            mappingOptions={(item) => ({ value: item.id, label: item.fullName })}
                            searchParams={(text) => ({ fullName: text })}
                            disabled={!permissionCodes.includes('TR_C_FA')}
                            // onChange={(data) => {
                            //     setDepartment(data);
                            // }}
                        />
                    </Col>
                    <Col span={12}>
                        {isEditing ? <AutoCompleteField
                            name="approvedBy"
                            label={'Approved by'}
                            apiConfig={apiConfig.account.getList}
                            mappingOptions={(item) => ({ value: item.id, label: item.fullName })}
                            searchParams={(text) => ({ fullName: text })}
                            disabled={!permissionCodes.includes(roleCheck)}
                            required={dataDetail?.state == TRANSACTION_STATE_APPROVE}
                        /> :
                            <AutoCompleteField
                                name="approvedBy"
                                label={'Approved by'}
                                apiConfig={apiConfig.account.getList}
                                mappingOptions={(item) => ({ value: item.id, label: item.fullName })}
                                searchParams={(text) => ({ fullName: text })}
                                disabled={!permissionCodes.includes(roleCheck)}
                            />}
                    </Col>
                    <Col span={12}>
                        <SelectField
                            name="tagId"
                            label={<FormattedMessage defaultMessage={'Tag'} />}
                            options={tagData}
                            disabled={dataDetail?.tag?.id == TAG_KIND_TRANSACTION }
                            renderCustomOption={renderCustomOption}
                        />
                    </Col>
                   
                    <Col span={24}>
                        <TextField label={translate.formatMessage(commonMessage.note)} name="note" type="textarea"
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

export default TransactionForm;
