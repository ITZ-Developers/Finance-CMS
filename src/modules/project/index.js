import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import React, { useEffect, useRef, useState } from 'react';
import BaseTable from '@components/common/table/BaseTable';
import { AppConstants, DEFAULT_FORMAT, DEFAULT_TABLE_ISPAGED_0, TAG_KIND_PROJECT, TASK_DONE } from '@constants';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { useLocation, useNavigate } from 'react-router-dom';
import { convertUtcToLocalTime, decryptValue, limitCharacters, orderNumber, validCheckFields } from '@utils';
import PageNotSessionKey from '@components/common/page/PageNotSessionKey';
import { FieldTypes } from '@constants/formConfig';
import { ClearOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Flex, Form, Modal, Row, Table, Tag, Tooltip } from 'antd';
import { BaseForm } from '@components/common/form/BaseForm';
import TextField from '@components/common/form/TextField';
import AvatarField from '@components/common/form/AvatarField';
import { CodepenOutlined } from '@ant-design/icons';
import SelectField from '@components/common/form/SelectField';
import useFetch from '@hooks/useFetch';
import { BaseTooltip } from '@components/common/form/BaseTooltip';
import { TeamOutlined } from '@ant-design/icons';
import routes from './routes';
import { FormattedMessage } from 'react-intl';

const ProjectListPage = ({ pageOptions }) => {
    const translate = useTranslate();
    const location = useLocation();
    const { pathname: pagePath } = useLocation();
    const search = location.search;
    const queryParameters = new URLSearchParams(window.location.search);
    const navigate = useNavigate();

    const [dataList, setDataList] = useState([]);
    const [tagData, setTagData] = useState([]);
    const [organizationData, setOrganizationData] = useState([]);
    const [form] = Form.useForm();
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

    const { execute: executeOrganizationData } = useFetch(apiConfig.organization.autocomplete, {
        immediate: false,
        params: { isPaged: DEFAULT_TABLE_ISPAGED_0 },
    });

    const { execute: executeTag } = useFetch(apiConfig.tag.autocomplete, {
        immediate: false,
        params: { isPaged: DEFAULT_TABLE_ISPAGED_0, kind: TAG_KIND_PROJECT },
    });

    const { data, mixinFuncs, queryFilter, loading, dataSessionKey, checkKey, setCheckKey, serializeParams } = useListBase({
        apiConfig: {
            getList: apiConfig.project.getList,
            getById: apiConfig.project.getById,
            update: apiConfig.project.update,
            delete: apiConfig.project.delete,
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
                    const decryptedContent = response?.data?.content?.length > 0 ? response?.data?.content.map((item) => {
                        return {
                            ...item,
                            name: decryptValue(dataSessionKey?.decrytSecretKey, `${item.name}`),
                            organizationName: decryptValue(dataSessionKey?.decrytSecretKey, `${item?.organization?.name}`),
                        };
                    }) : [];
                    setDataList(decryptedContent);
                    return {
                        data: decryptedContent,
                        total: response?.data?.totalElements,
                    };
                }
            };
            funcs.getCreateLink = (record) => {
                return `${pagePath}/create${search}`;
            };
            funcs.getItemDetailLink = (dataRow) => {
                return `${pagePath}/${dataRow.id}${search}`;
            };
            funcs.changeFilter = (filter) => {

                mixinFuncs.setQueryParams(
                    serializeParams({
                        ...filter,
                    }),
                );
            };
            funcs.additionalActionColumnButtons = () => ({
                user: ({ id, name, status }) => (
                    <BaseTooltip title={translate.formatMessage(commonMessage.projectPermission)}>
                        <Button
                            type="link"
                            style={{ padding: '0' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(routes.userOfProjectListPage.path + `?projectId=${id}&projectName=${name}`);

                            }}
                        >
                            <TeamOutlined />
                        </Button>
                    </BaseTooltip>
                ),
            });
        },
    });
    const columns = [
        {
            title: '#',
            dataIndex: 'logo',
            align: 'center',
            width: 100,
            render: (dataRow) => {
                const logo = decryptValue(dataSessionKey?.decrytSecretKey, `${dataRow}`);
                return (
                    <AvatarField
                        size="large"
                        icon={<CodepenOutlined />}
                        src={logo ? `${AppConstants.contentRootUrl}${logo}` : null}
                    />
                );
            },
        },
        {
            title: translate.formatMessage(commonMessage.name),
            render: (record) => {
                const size = 50;
                const name = decryptValue(dataSessionKey?.decrytSecretKey, `${record?.tag?.name}`);
                const color = decryptValue(dataSessionKey?.decrytSecretKey, `${record?.tag?.colorCode}`);
                return (
                    <Flex align='center' gap={4}>
                        {record?.tag?.colorCode && <Tooltip title={name} placement='bottom' style={{ cursor: 'pointer' }}>
                            <div style={{ width: '16px', height: '28px', backgroundColor: `${color}` }}/>
                        </Tooltip>}
                        <span>{record.name}</span>
                    </Flex>
                );
            },
        },
        {
            title: translate.formatMessage(commonMessage.organization),
            dataIndex: 'organizationName',
            width: 200,
        },
        {
            title: 'Total Task',
            width: 180,
            dataIndex:'totalTasks',
            align: 'center',
            render(dataRow) {
                return (
                    <div>
                        {dataRow}
                    </div>
                );
            },

        },
        {
            title: 'Created Date',
            width: 180,
            render(dataRow) {
                return (
                    <div style={{ fontWeight: 'normal' }}>
                        {convertUtcToLocalTime(dataRow?.createdDate, DEFAULT_FORMAT, DEFAULT_FORMAT)}
                    </div>
                );
            },
            align: 'end',
        },
        mixinFuncs.renderStatusColumn({ width: '120px' }),
        mixinFuncs.renderActionColumn(
            {
                user: mixinFuncs.hasPermission([apiConfig.taskPermission.getList.baseURL]),
                edit: true,
                delete: true,
            },
            { width: '120px' },
        ),
    ];

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

    useEffect(() => {
        const organizationId = queryParameters.get('organizationId');
        const fieldsToSet = {
            name: queryParameters.get('name'),
            organizationId: organizationId && Number(organizationId),
        };
        const validFields = validCheckFields(fieldsToSet);
        if (validFields && data) {
            form.setFieldsValue(validFields);
            handleSearchText(validFields);
        }
    }, [ data ]);

    const handleSearchText = (values) => {
        mixinFuncs.setQueryParams(
            serializeParams({
                ...values,
            }),
        );
        const nameFilter = values.name;
        const organizationId = values.organizationId;
        const tag = values.tag;
        if (nameFilter !== null || organizationId !== null) {
            const filteredData = data.filter((item) => {
                const matchesName = !nameFilter || item.name.toLowerCase().includes(nameFilter.toLowerCase());
                const matchesOrganization = !organizationId || item?.organization?.id === organizationId;
                const matchesTag = !tag || item?.tag?.id === tag;
                return matchesName && matchesOrganization && matchesTag;
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

    const renderCustomOption = (value, label, option) => {
        return {
            value: value,
            label: (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ marginRight: 8 }}>{limitCharacters(label, 14)}</span>
                    <div style={{ width: '32px', height: '16px', backgroundColor: `${option.color}` }} color={option.color}></div>
                </div>
            ),
            labelText: label,
        };
    };

    return (
        <PageWrapper routes={pageOptions.renderBreadcrumbs(commonMessage, translate)}>
            {checkKey ? (
                <ListPage
                    searchForm={
                        <BaseForm form={form} onFinish={handleSearchText} size='bigXl'>
                            <Row gutter={8}>
                                <Col span={4}>
                                    <TextField name="name" placeholder={'Project'} />
                                </Col>
                                <Col span={4}>
                                    <SelectField
                                        options={organizationData}
                                        name="organizationId"
                                        placeholder={'Organization'}
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
                                    <Button icon={<SearchOutlined />} type="primary" htmlType="submit">
                                        {'Search'}
                                    </Button>
                                </Col>
                                <Col span={1}>
                                    <Button
                                        icon={<ClearOutlined />}
                                        onClick={handleClearSearch}
                                    >
                                        {'Clear'}
                                    </Button>
                                </Col>
                            </Row>
                        </BaseForm>
                    }
                    actionBar={mixinFuncs.renderActionBar()}
                    baseTable={
                        <BaseTable
                            onChange={mixinFuncs.changePagination}
                            columns={columns}
                            dataSource={dataList}
                            loading={loading}
                            rowKey={(record) => record.id}
                            pageLocal={true}
                            onPaginationChange={handlePaginationChange}
                            onResetPage={(resetToFirstPage) => {
                                resetPageRef.current = resetToFirstPage; // Lưu hàm reset trang
                            }}
                            style={{ cursor: 'pointer' }}
                            onRow={(record) => ({ 
                                onClick: (e) => {
                                    navigate(routes.taskOfProjectListPage.path + `?projectId=${record.id}&&projectName=${record?.name}`,
                                        {
                                            state: {
                                                projectId: record?.id,
                                                projectName: record?.name,
                                            },
                                        },
                                    );
                                },
                            })}
                        />
                    }
                />
            ) : (
                <PageNotSessionKey setCheckKey={setCheckKey} />
            )}
        </PageWrapper>
    );
};

export default ProjectListPage;
