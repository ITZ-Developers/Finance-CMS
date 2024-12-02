import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import React, { useEffect, useRef, useState } from 'react';
import BaseTable from '@components/common/table/BaseTable';
import { DEFAULT_FORMAT, DEFAULT_TABLE_ISPAGED_0, SORT_DATE, SORT_DATE_DESC, TAG_KIND_PROJECT } from '@constants';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import useAuth from '@hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import { convertUtcToLocalTime, decryptValue, generateColor, orderNumber, validCheckFields } from '@utils';
import PageNotSessionKey from '@components/common/page/PageNotSessionKey';
import { Button, Col, ColorPicker, Flex, Form, Modal, Row, Tag, Tooltip } from 'antd';
import { BaseForm } from '@components/common/form/BaseForm';
import TextField from '@components/common/form/TextField';
import { ClearOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import useSettingUnit from '@hooks/useSettingUnit';
import { BaseTooltip } from '@components/common/form/BaseTooltip';
import { TeamOutlined } from '@ant-design/icons';
import routes from './routes';
import useDisclosure from '@hooks/useDisclosure';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import useFetch from '@hooks/useFetch';
import { showErrorMessage, showSucsessMessage } from '@services/notifyService';
import styles from './index.module.scss';
import './index.css';
import ColorPickerField from '@components/common/form/ColorPickerField';
// import ColorField from '@components/common/form/ColorField';
import RefeshIcon from '@assets/icons/refresh.svg';

const TagListPage = ({ pageOptions }) => {
    const queryParameters = new URLSearchParams(window.location.search);
    const translate = useTranslate();
    const { isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { pathname: pagePath } = useLocation();
    const search = location.search;
    const [dataList, setDataList] = useState([]);
    const [tagSelected, setTagSelected] = useState(null);
    const [form] = Form.useForm();
    const [formCreate] = Form.useForm();
    const [openedTagModal, handleCreateTag] = useDisclosure(false);
    const [defaultColor, setDefaultColor] = useState('#4096ff');
    const { execute: executeCreate, loading: loadingCreate } = useFetch( apiConfig.tag.create, {
        immediate: false,
    });
    const { execute: executeUpdate, loading: loadingUpdate } = useFetch( apiConfig.tag.update, {
        immediate: false,
    });
    const [paginationInfo, setPaginationInfo] = useState({ current: 1, pageSize: 50, total: null });
    const handlePaginationChange = (pagination) => {
        setPaginationInfo(pagination);
    };
    const resetPageRef = useRef(null);

    const handleResetPage = () => {
        if (resetPageRef.current) {
            resetPageRef.current(); // Gọi hàm reset trang 1 từ BaseTable
        }
    };
    const { dateUnit } = useSettingUnit();
    const { data, mixinFuncs, queryFilter, loading, dataSessionKey, checkKey, setCheckKey, serializeParams } =
        useListBase({
            apiConfig: {
                getList: apiConfig.tag.getList,
                getById: apiConfig.tag.getById,
                update: apiConfig.tag.update,
                delete: apiConfig.tag.delete,
            },
            localSearch: true,
            options: {
                // pageSize: DEFAULT_TABLE_ITEM_SIZE,
                isPaged: DEFAULT_TABLE_ISPAGED_0,
                objectName: translate.formatMessage(pageOptions.objectName),
            },
            isSessionKey: true,
            override: (funcs) => {
                funcs.mappingData = (response) => {
                    if (response.result === true) {
                        form.resetFields();
                        const decryptedContent =
                            response?.data?.content?.length > 0
                                ? response?.data?.content.map((item) => {
                                    return {
                                        ...item,
                                        name: decryptValue(dataSessionKey?.decrytSecretKey, `${item.name}`),
                                        colorCode: decryptValue(dataSessionKey?.decrytSecretKey, `${item.colorCode}`),
                                    };
                                })
                                : [];
                        setDataList(decryptedContent);
                        return {
                            data: decryptedContent,
                            total: response?.data?.totalElements,
                        };
                    }
                };
                funcs.prepareGetListParams = (params) => {
                    return {
                        isPaged: DEFAULT_TABLE_ISPAGED_0,
                        kind: pageOptions?.kind,
                        sortDate: SORT_DATE_DESC,
                    };
                };
                funcs.additionalActionColumnButtons = () => ({
                    edit: ({ id, name, colorCode }) => (
                        <BaseTooltip title={'Edit tag'}>
                            <Button
                                type="link"
                                style={{ padding: '0' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCreateTag.open();
                                    formCreate.setFieldsValue({
                                        name: name,
                                        colorCode: colorCode,
                                    });
                                    setTagSelected(id);
                                    setDefaultColor(colorCode);
                                }}
                            >
                                <EditOutlined />
                            </Button>
                        </BaseTooltip>
                    ),
                });

                funcs.changeFilter = (filter) => {
                    if (filter.name) {
                        delete filter.name;
                    }

                    mixinFuncs.setQueryParams(
                        serializeParams({
                            ...filter,
                        }),
                    );
                };
            },
        });
    const columns = [
        {
            title: '#',
            dataIndex: 'index',
            key: 'id',
            render: (text, record, index) => {
                return orderNumber(paginationInfo, index);
            },
            width: 50,
        },
        {
            title: translate.formatMessage(commonMessage.name),
            dataIndex: 'name',
        },
        {
            title: 'Color',
            width: 180,
            dataIndex: 'colorCode',
            render(dataRow) {
                return (
                    <Tag style={{ textAlign: 'center' }} color={dataRow}>
                        {dataRow}
                    </Tag>
                );
            },
            align: 'center',
        },
        mixinFuncs.renderActionColumn(
            {
                edit: true,
                delete: true,
            },
            { width: '150px' },
        ),
    ];

    useEffect(() => {
        const fieldsToSet = {
            name: queryParameters.get('name'),
        };
        const validFields = validCheckFields(fieldsToSet);
        if (validFields && data) {
            form.setFieldsValue(validFields);
            handleSearchText(validFields);
        }
    }, [data]);

    const handleSearchText = (values) => {
        const nameFilter = values.name;
        mixinFuncs.setQueryParams(
            serializeParams({
                ...values,
            }),
        );
        if (nameFilter !== null) {
            const filteredData = data.filter((item) => {
                const matchesName = !nameFilter || item.name.toLowerCase().includes(nameFilter.toLowerCase());

                return matchesName;
            });
            setDataList(filteredData);
            handleResetPage();
        }
    };
    const handleClearSearch = () => {
        form.resetFields();
        setDataList(data);
        handleResetPage();
    };

    const handleCancelModal = () => {
        formCreate.resetFields();
        handleCreateTag.close();
        setTagSelected(null);
        setDefaultColor('#4096ff');
    };

    const handleResolve = () => {
        const values = formCreate.getFieldsValue();
        values.colorCode = typeof values.colorCode == 'string' ? values?.colorCode : values?.colorCode?.toHexString();
        if (tagSelected != null) {
            executeUpdate({
                data: { ...values, id: tagSelected },
                onCompleted: (res) => {
                    showSucsessMessage('Update tag successfully!');
                    mixinFuncs.getList();
                    formCreate.resetFields();
                },
                onError: (err) => {
                    formCreate.resetFields();
                    showErrorMessage('Update tag failed!');
                },
            });
        } else {
            executeCreate({
                data: { ...values, kind: pageOptions?.kind, colorCode: values?.colorCode || '#4096ff' },
                onCompleted: (res) => {
                    showSucsessMessage('Create tag successfully!');
                    formCreate.resetFields();
                    mixinFuncs.getList();
                },
                onError: (err) => {
                    formCreate.resetFields();
                    if (err.code == 'ERROR-TAG-0001') 
                        showErrorMessage('Name tag existed for this kind!');
                    else
                        showErrorMessage('Create tag failed!');
                },
            });
        }
        handleCancelModal();      
    };

    const [open, setOpen] = useState(false);
    const [color, setColor] = useState(defaultColor);
    const handleDivClick = () => {
        setOpen(true);
    };
    useEffect(() => {
        setColor(defaultColor);
        form.setFieldValue(name, defaultColor);
    }, [ openedTagModal ]);


    return (
        <PageWrapper routes={pageOptions.renderBreadcrumbs(commonMessage, translate)}>
            {checkKey ? (
                <>
                    <ListPage
                        searchForm={
                            <BaseForm form={form} onFinish={handleSearchText}>
                                <Row gutter={8}>
                                    <Col span={6}>
                                        <TextField name="name" placeholder={'Tag'} />
                                    </Col>
                                    <Col span={3}>
                                        <Button icon={<SearchOutlined />} type="primary" htmlType="submit">
                                            {'Search'}
                                        </Button>
                                    </Col>
                                    <Col span={3}>
                                        <Button icon={<ClearOutlined />} onClick={handleClearSearch}>
                                            {'Clear'}
                                        </Button>
                                    </Col>
                                </Row>
                            </BaseForm>
                        }
                        actionBar={
                            <Button
                                type="primary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCreateTag.open();
                                }}
                            >
                                <PlusOutlined /> Add new
                            </Button>
                        }
                        baseTable={
                            <BaseTable
                                onChange={mixinFuncs.changePagination}
                                columns={columns}
                                dataSource={dataList}
                                loading={loading || loadingCreate || loadingUpdate}
                                rowKey={(record) => record.id}
                                pageLocal={true}
                                onPaginationChange={handlePaginationChange}
                                onResetPage={(resetToFirstPage) => {
                                    resetPageRef.current = resetToFirstPage; // Lưu hàm reset trang
                                }}
                            />
                        }
                    />
                    <Modal
                        title={tagSelected == null ? 'Create tag' : 'Update tag'}
                        open={openedTagModal}
                        onCancel={handleCancelModal}
                        footer={null}
                        width={'34vw'}
                    >
                        <BaseForm
                            form={formCreate}
                            onFinish={(values) => {
                                handleResolve(values);
                            }}
                            size="100%"
                        >
                            <Row gutter={10}>
                                <Col span={24}>
                                    <TextField
                                        name="name"
                                        placeholder="Name"
                                        style={{ width: '100%' }}
                                        label={'Name'}
                                        required
                                    />
                                </Col>
                            </Row>
                            <Row gutter={10} justify={'start'}>
                                <Col span={12}>
                                    {/* <ColorPickerField
                                        name="colorCode"
                                        placeholder="Color"
                                        style={{ width: '100%' }}
                                        label={'Color'}
                                        required
                                        form={formCreate}
                                        defaultColor={defaultColor}
                                        openModal={openedTagModal}
                                    /> */}
                                    <Form.Item
                                        label={'color'}
                                        name={"colorCode"}
                                        validateFirst
                                        initialValue={color}
                                    >
                                        <Flex style={{ position: 'relative' }} gap={8}>
                                            <div
                                                style={{
                                                    backgroundColor: `${color}`,
                                                    height: 32,
                                                    borderRadius: '6px',
                                                    width: '70%',
                                                    zIndex: 100,
                                                    position: 'relative',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={handleDivClick}
                                            />
                                            <ColorPicker
                                                value={color}
                                                open={open}
                                                onOpenChange={setOpen}
                                                onChange={(newColor) => {
                                                    formCreate.setFieldValue('colorCode', newColor.toHexString());
                                                    setColor(newColor.toHexString());
                                                }}
                                                showText
                                                style={{ width: '70%', height: 28, zIndex: 1, position: 'absolute' }}
                                                format={'hex'}
                                                mode={'gradient'}
                                            />
                                            <Tooltip title={'Generate Color'} placement="bottom">
                                                <Button
                                                    style={{ position: 'relative', display: 'block' }}
                                                    icon={<img src={RefeshIcon} />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const color = generateColor();
                                                        setColor(color);
                                                        formCreate.setFieldValue('colorCode', color);
                                                    }}
                                                />
                                            </Tooltip>
                                        </Flex>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row justify={'end'}>
                                <Button key="cancel" style={{ marginLeft: 5 }} onClick={handleCancelModal}>
                                    {'Cancel'}
                                </Button>
                                <Button
                                    key="submit"
                                    htmlType="submit"
                                    type="primary"
                                    style={{ marginLeft: 5 }}
                                    loading={loadingCreate || loadingUpdate}
                                >
                                    {tagSelected == null ? 'Create' : 'Update'}
                                </Button>
                            </Row>
                        </BaseForm>
                    </Modal>
                </>
            ) : (
                <PageNotSessionKey setCheckKey={setCheckKey} />
            )}
        </PageWrapper>
    );
};

export default TagListPage;
