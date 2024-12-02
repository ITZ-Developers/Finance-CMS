import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import { Button, Col, Flex, Form, Row, Tag, Tooltip, Upload } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import BaseTable from '@components/common/table/BaseTable';
import { DEFAULT_FORMAT_BASIC_FIX, DEFAULT_TABLE_ISPAGED_0, KEY_KIND_SERVER, storageKeys, TAG_KIND_KEY_INFORMATION } from '@constants';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import useAuth from '@hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { copyToClipboard, decryptValue, limitCharacters, orderNumber, validCheckFields } from '@utils';
import { kindKeyOptions } from '@constants/masterData';
import { getSessionStorageWithExpiry } from '@utils/sessionStorage';
import PageNotSessionKey from '@components/common/page/PageNotSessionKey';
import { FieldTypes } from '@constants/formConfig';
import { isJsonString } from '@store/utils';
import { CopyOutlined } from '@ant-design/icons';
import { showErrorMessage, showSucsessMessage } from '@services/notifyService';
import KeyInformationModal from './KeyInformationModal';
import useDisclosure from '@hooks/useDisclosure';
import { BaseForm } from '@components/common/form/BaseForm';
import TextField from '@components/common/form/TextField';
import SelectField from '@components/common/form/SelectField';
import { ClearOutlined, SearchOutlined, GlobalOutlined , HddOutlined } from '@ant-design/icons';
import useFetch from '@hooks/useFetch';
import { IconDownload, IconUpload } from '@tabler/icons-react';
import { getCacheAccessToken } from '@services/userService';
import axios from 'axios';
import useNotification from '@hooks/useNotification';
import dayjs from 'dayjs';
import { FormattedMessage } from 'react-intl';

const KeyInformationListPage = ({ pageOptions }) => {
    const translate = useTranslate();
    const { isAdmin } = useAuth();
    const location = useLocation();
    const { pathname: pagePath } = useLocation();
    const search = location.search;
    const kindValues = translate.formatKeys(kindKeyOptions, ['label']);
    const dataValueKey = JSON.parse(getSessionStorageWithExpiry('sessionKey'));
    const queryParameters = new URLSearchParams(window.location.search);
    // const kind = queryParameters.get('kind') || 1;
    const [openCreateModal, handlersCreateModal] = useDisclosure(false);
    const [dataModal, setDataModal] = useState();
    const [form] = Form.useForm();
    const [dataKey, setDataKey] = useState([]);
    const [tagData, setTagData] = useState([]);
    const userAccessToken = getCacheAccessToken();
    const { execute: executeUpFile, loading: loadingImport } = useFetch(apiConfig.keyInformation.importToExcel);
    const notification = useNotification();
    const [paginationInfo, setPaginationInfo] = useState({ current: 1, pageSize: 50, total: null });
    const [kind, setKind] = useState();
    const [organizationData, setOrganizationData] = useState([]);
    const [keyGroupData, setKeyGroupData] = useState([]);
    const [loadingExport, setLoadingExport] = useState(false);
    const handlePaginationChange = (pagination) => {
        setPaginationInfo(pagination);
    };
    const resetPageRef = useRef(null);

    const handleResetPage = () => {
        if (resetPageRef.current) {
            resetPageRef.current(); // Gọi hàm reset trang 1 từ BaseTable
        }
    };

    const { execute: executeTag } = useFetch(apiConfig.tag.autocomplete, {
        immediate: false,
        params: { isPaged: DEFAULT_TABLE_ISPAGED_0, kind: TAG_KIND_KEY_INFORMATION },
        // mappingData: (data) =>
        //     data.data.content.map((item) => ({
        //         value: item.id,
        //         label: decryptValue(dataSessionKey?.decrytSecretKey, `${item.name}`),
        //         color: decryptValue(dataSessionKey?.decrytSecretKey, `${item.colorCode}`),
        //     })),
    });

    const { data, mixinFuncs, queryFilter, loading, dataSessionKey, checkKey, setCheckKey, serializeParams } =
        useListBase({
            apiConfig: {
                getList: apiConfig.keyInformation.getList,
                getById: apiConfig.keyInformation.getById,
                update: apiConfig.keyInformation.update,
                delete: apiConfig.keyInformation.delete,
            },
            localSearch: true,
            options: {
                isPaged: DEFAULT_TABLE_ISPAGED_0,
                objectName: translate.formatMessage(pageOptions.objectName),
            },
            isSessionKey: true,
            override: (funcs) => {
                funcs.mappingData = (response) => {
                    if (response.result === true) {
                        form.resetFields();
                        const dataContent = response.data.content?.length > 0 ? response.data.content.map((item) => {
                            const additionalInformation = decryptValue(
                                dataValueKey?.decrytSecretKey,
                                `${item?.additionalInformation}`,
                            );
                            const dataInfo = isJsonString(additionalInformation)
                                ? JSON.parse(additionalInformation)
                                : {};
                            return {
                                ...item,
                                name: decryptValue(dataSessionKey?.decrytSecretKey, `${item.name}`),
                                organizationName: decryptValue(dataSessionKey?.decrytSecretKey, `${item?.organization?.name}`),
                                keyInformationGroupName: decryptValue(dataSessionKey?.decrytSecretKey, `${item?.keyInformationGroup?.name}`),
                                password: dataInfo?.password,
                                phoneNumber: dataInfo?.phoneNumber,
                                userName: dataInfo?.username,
                                host: dataInfo?.host,
                                port: dataInfo?.port,
                            };
                        }) : [];
                        setDataKey(dataContent);
                        return {
                            data: dataContent,
                            total: response.data.totalElements,
                        };
                    } else return {};
                };
                funcs.getCreateLink = (record) => {
                    return `${pagePath}/create${search}`;
                };
                funcs.getItemDetailLink = (dataRow) => {
                    return `${pagePath}/${dataRow.id}${search}`;
                };
            },
        });

    const column = [
        {
            title: '#',
            dataIndex: 'index',
            key: 'id',
            align: 'center',
            render: (text, record, index) => {
                const size = 50;
                const name = decryptValue(dataValueKey?.decrytSecretKey, `${record?.tag?.name}`);
                const color = decryptValue(dataValueKey?.decrytSecretKey, `${record?.tag?.colorCode}`);
                return (
                    <Flex align='center' gap={4}>
                        {record?.tag?.colorCode && <Tooltip title={name} placement='bottom' style={{ cursor: 'pointer' }}>
                            <div style={{ width: '16px', height: '28px', backgroundColor: `${color}` }}/>
                        </Tooltip>}
                        <span>{orderNumber(paginationInfo, index, size)}</span>
                    </Flex>
                );
            },
            width: 60,
        },
        {
            dataIndex: 'kind',
            width: 80,
            align: 'center',
            render(dataRow) {
                const kind = dataRow != null ? kindValues.find((item) => item.value == dataRow) : null;
                return dataRow ? (
                    dataRow == KEY_KIND_SERVER ? <HddOutlined style={{ fontSize: 22, color: 'blue' }}/> : <GlobalOutlined style={{ fontSize: 22, color: 'blue' }}/>
                ): (
                    <Tag />
                );
            },
        },
        {
            title: translate.formatMessage(commonMessage.organization),
            dataIndex: ['organizationName'],
            width: 200,
        },
        {
            title: 'Group key',
            dataIndex: ['keyInformationGroupName'],
            width: 200,
        },
        {
            title: translate.formatMessage(commonMessage.name),
            dataIndex: 'name',
            // render: (name) => {
            //     return <span>{decryptValue(dataValueKey?.decrytSecretKey, `${name}`)}</span>;
            // },
        },
        mixinFuncs.renderActionColumn({ edit: true, delete: true }, { width: '120px' }),
    ];

    useEffect(() => {
        const keyGroupId = queryParameters.get('keyGroupId');
        const organizationId = queryParameters.get('organizationId');
        const kind = queryParameters.get('kind');
        const fieldsToSet = {
            name: queryParameters.get('name'),
            keyGroupId: keyGroupId && Number(keyGroupId),
            kind: kind && Number(kind),
            organizationId: organizationId && Number(organizationId),
        };
        const validFields = validCheckFields(fieldsToSet);
        if (validFields && data) {
            form.setFieldsValue(validFields);
            handleSearchText(validFields);
        }
    }, [ data ]);

    const handleSearchText = () => {
        const values = form.getFieldsValue();
        mixinFuncs.setQueryParams(
            serializeParams({
                ...values,
            }),
        );
        const name = values.name;
        const keyGroupId = values.keyGroupId;
        const organizationId = values.organizationId;
        const kind = values.kind;
        const tag = values.tag;
        if (name !== null || keyGroupId !== null || organizationId !== null || kind !== null) {
            const filteredData = data.filter((item) => {
                const matchesName = !name || item.name.toLowerCase().includes(name.toLowerCase());
                const matchesKeyGroupId = !keyGroupId || item?.keyInformationGroup?.id === keyGroupId;
                const matchesOrganizationId = !organizationId || item?.organization?.id === organizationId;
                const matcheskind = !kind || item?.kind === kind;
                const matchesTag = !tag || item?.tag?.id === tag;
                return matchesName && matchesKeyGroupId && matchesOrganizationId && matcheskind && matchesTag;
            });
            setDataKey(filteredData);
            handleResetPage();
        }
    };

    const handleClearSearch = () => {
        form.resetFields();
        setDataKey(data);
        handleResetPage();
        setKind();
    };

    const { execute: executeKeyGroupData } = useFetch(apiConfig.keyGroup.autocomplete, {
        immediate: true,
        params: { isPaged: DEFAULT_TABLE_ISPAGED_0 },
        // mappingData: (data) =>
        //     data.data.content.map((item) => ({
        //         value: item.id,
        //         label: decryptValue(dataSessionKey?.decrytSecretKey, `${item.name}`),
        //     })),
    });

    const { execute: executeOrganizationData } = useFetch(apiConfig.organization.autocomplete, {
        immediate: false,
        params: { isPaged: DEFAULT_TABLE_ISPAGED_0 },
    });



    useEffect(() => {
        if (dataSessionKey?.decrytSecretKey){
            executeOrganizationData({
                onCompleted: (res) => {
                    const data = res?.data?.content.map((item) => ({
                        value: item.id,
                        label: decryptValue(dataSessionKey?.decrytSecretKey, `${item.name}`),
                    }));
                    setOrganizationData(data || []);
                },
            });
            executeKeyGroupData({
                onCompleted: (res) => {
                    const data = res?.data?.content.map((item) => ({
                        value: item.id,
                        label: decryptValue(dataSessionKey?.decrytSecretKey, `${item.name}`),
                    }));
                    setKeyGroupData(data || []);
                },
            });
            executeTag({
                onCompleted: (res) => {
                    const data = res.data.content.map((item) => ({
                        value: item.id,
                        label: decryptValue(dataSessionKey?.decrytSecretKey, `${item?.name}`),
                        color: decryptValue(dataSessionKey?.decrytSecretKey, `${item?.colorCode}`),
                    }));
                    setTagData(data);
                },
            });
        }
    }, [ checkKey ]);

    const exportToExcel = (value, nameExcel = 'demo', nameLog) => {
        const dataCustom = dataKey.map(item => item.id);
        setLoadingExport(true);
        axios({
            url: apiConfig.keyInformation.exportToExcel.baseURL,
            method: 'POST',
            responseType: 'blob',
            // withCredentials: true,
            headers: {
                Authorization: `Bearer ${userAccessToken}`, // Sử dụng token từ state
            },
            data: {
                keyInformationIds: dataCustom,
                kind: kind,
            },
        })
            .then((response) => {
                // const fileName="uy_nhiem_chi";
                setLoadingExport(false);
                const date = new Date();
                const dateCurrent = dayjs(new Date()).format('DD.MM.YYYY_HHmmss');

                const excelBlob = new Blob([response.data], {
                    type: response.headers['content-type'],
                });

                const link = document.createElement('a');

                link.href = URL.createObjectURL(excelBlob);
                link.download = `Key_Information.${dateCurrent}.xlsx`;
                link.click();
                showSucsessMessage('Download file successfully !!');
            })
            .catch((error) => {
                console.log(error);
                setLoadingExport(false);
                showErrorMessage('Download file failed !!');
                // Xử lý lỗi tải file ở đây
            });
    };
    const uploadFile = (file, onSuccess, onError) => {
        executeUpFile({
            data: {
                // type: 'DOCUMENT',
                file: file,
            },
            onCompleted: (response) => {
                if (response.result === true) {
                    onSuccess();
                    notification({ type: 'success', message: 'Upload file successfully' });
                }
            },
            onError: (error) => {
                onError();
                notification({ type: 'error', message: 'Upload file failed' });
            },
        });
    };
    const onUploadFile = ({ file, onSuccess, onError }) => {
        uploadFile(
            file,
            (onSuccess = (res) => {
                // setFileName(file.name);
                console.log(res);
            }),
            onError,
        );
    };
    const props = {
        name: 'file',
        // action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
        headers: {
            authorization: 'authorization-text',
        },
        showUploadList: false,
        customRequest: onUploadFile,
        onChange(info) {
        },
    };

    const renderCustomOption = (value, label, option) => {
        return {
            value: value,
            label: (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ marginRight: 8 }}>{limitCharacters(label, 20)}</span>
                    <div style={{ width: '32px', height: '16px', backgroundColor: `${option.color}` }} color={option.color}></div>
                </div>
            ),
            labelText: label,
        };
    };

    return (
        <PageWrapper routes={pageOptions.renderBreadcrumbs(commonMessage, translate)}>
            <>
                {checkKey ? (
                    <ListPage
                        searchForm={
                            <BaseForm form={form} size="full">
                                <Row gutter={8} justify={'start'}>
                                    <Col span={3}>
                                        <TextField name="name" placeholder={'Name'} />
                                    </Col>
                                    <Col span={3}>
                                        <SelectField
                                            name="kind"
                                            placeholder={translate.formatMessage(commonMessage.kind)}
                                            options={kindValues}
                                            onChange={(value) => {
                                                setKind(value);
                                                handleSearchText();
                                            }}
                                        />
                                    </Col>
                                    <Col span={3}>
                                        <SelectField
                                            name="keyGroupId"
                                            placeholder={'Key group'}
                                            options={keyGroupData}
                                        />
                                    </Col>
                                    <Col span={3}>
                                        <SelectField
                                            name="organizationId"
                                            placeholder={translate.formatMessage(commonMessage.organization)}
                                            options={organizationData}
                                        />
                                    </Col>
                                    <Col span={4}>
                                        <SelectField
                                            name="tag"
                                            placeholder={translate.formatMessage(commonMessage.tag)}
                                            options={tagData}
                                            renderCustomOption={renderCustomOption}
                                        />
                                    </Col>
                                    <Col>
                                        <Button icon={<SearchOutlined />} type="primary" onClick={handleSearchText}>
                                            {'Search'}
                                        </Button>
                                    </Col>
                                    <Col span={1}>
                                        <Button icon={<ClearOutlined />} onClick={handleClearSearch}>
                                            {'Clear'}
                                        </Button>
                                    </Col>
                                </Row>
                            </BaseForm>
                        }
                        actionBar={
                            <Flex>
                                <Flex gap={12}>
                                    { mixinFuncs.hasPermission([apiConfig.keyInformation.exportToExcel.baseURL]) && <Button
                                        // style={{ marginRight: 10 }}
                                        type="dashed"
                                        icon={<IconDownload size={12} />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            exportToExcel();
                                        }}
                                        disabled={!kind}
                                        loading={loadingExport}
                                    >
                                        Export
                                    </Button>}
                                    { mixinFuncs.hasPermission([apiConfig.keyInformation.importToExcel.baseURL]) &&   <Upload {...props}>
                                        <Button type="dashed" loading={loadingImport} icon={<IconUpload size={12} />}>
                                            Import
                                        </Button>
                                    </Upload> }
                                </Flex>
                                <div>{mixinFuncs.renderActionBar()}</div>
                            </Flex>
                        }
                        baseTable={
                            <BaseTable
                                style={{ cursor: 'pointer' }}
                                onChange={mixinFuncs.changePagination}
                                columns={column}
                                dataSource={dataKey}
                                loading={loading}
                                rowKey={(record) => record.id}
                                onRow={(record) => ({
                                    onClick: (e) => {
                                        e.stopPropagation();
                                        setDataModal(record);
                                        handlersCreateModal.open();
                                    },
                                })}
                                pageLocal={true}
                                onPaginationChange={handlePaginationChange}
                                onResetPage={(resetToFirstPage) => {
                                    resetPageRef.current = resetToFirstPage; // Lưu hàm reset trang
                                }}
                            />
                        }
                    />
                ) : (
                    <PageNotSessionKey setCheckKey={setCheckKey}/>
                )}
                <KeyInformationModal
                    open={openCreateModal}
                    onCancel={() => handlersCreateModal.close()}
                    data={dataModal}
                    width={800}
                    dataSessionKey={dataValueKey}
                    setDataModal={setDataModal}
                />
            </>
        </PageWrapper>
    );
};

export default KeyInformationListPage;
