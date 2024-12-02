import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import BaseTable from '@components/common/table/BaseTable';
import { DEFAULT_FORMAT, DEFAULT_TABLE_ISPAGED_0, TASK_DONE } from '@constants';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { useLocation, useNavigate } from 'react-router-dom';
import { convertUtcToLocalTime, decryptValue, orderNumber, validCheckFields } from '@utils';
import PageNotSessionKey from '@components/common/page/PageNotSessionKey';
import { ClearOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Flex, Form, Row, Table, Tag } from 'antd';
import { BaseForm } from '@components/common/form/BaseForm';
import TextField from '@components/common/form/TextField';
import { stateTaskOptions } from '@constants/masterData';
import useFetch from '@hooks/useFetch';
import SelectField from '@components/common/form/SelectField';
import { BaseTooltip } from '@components/common/form/BaseTooltip';
import { CheckOutlined, AppstoreAddOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { showErrorMessage, showSucsessMessage } from '@services/notifyService';
import useDisclosure from '@hooks/useDisclosure';
import TaskDetailModal from './TaskDetailModal';
import useSettingUnit from '@hooks/useSettingUnit';

const TaskListPage = ({ pageOptions }) => {
    const queryParameters = new URLSearchParams(window.location.search);
    const projectId = queryParameters.get('projectId');
    const projectName = queryParameters.get('projectName');
    const translate = useTranslate();
    const location = useLocation();
    const { pathname: pagePath } = useLocation();
    const search = location.search;

    const [dataList, setDataList] = useState([]);
    const [form] = Form.useForm();
    const [paginationInfo, setPaginationInfo] = useState({ current: 1, pageSize: 50, total: null });
    const handlePaginationChange = (pagination) => {
        setPaginationInfo(pagination);
    };
    const resetPageRef = useRef(null);
    const stateValues = translate.formatKeys(stateTaskOptions, ['label']);
    const [openDetailModal, handlersDetailModal] = useDisclosure(false);
    const [dataModal, setDataModal] = useState();
    const [subTaskData, setSubTaskData] = useState({});
    const [parentId, setParentId] = useState('');
    const [project, setProject] = useState({});
    const navigate = useNavigate();

    const handleResetPage = () => {
        if (resetPageRef.current) {
            resetPageRef.current(); // Gọi hàm reset trang 1 từ BaseTable
        }
    };

    const { data: organizationData } = useFetch(apiConfig.organization.autocomplete, {
        immediate: true,
        params: { isPaged: DEFAULT_TABLE_ISPAGED_0 },
        mappingData: (data) =>
            data.data.content.map((item) => ({
                value: item.id,
                label: decryptValue(dataSessionKey?.decrytSecretKey, `${item.name}`),
            })),
    });

    const { execute: executeCheckDone } = useFetch(apiConfig.task.changeState, {
        immediate: false,
    });

    const { execute: executeGetListSubTask, loading: loadingSubTask } = useFetch(apiConfig.task.getList);
    const handleGetListSubTask = (parentId) => {
        executeGetListSubTask({
            params: {
                isPaged: DEFAULT_TABLE_ISPAGED_0,
                parentId: parentId,
            },
            onCompleted: (response) => {
                if (response.result === true) {
                    form.resetFields();
                    const decryptedContent =
                            response?.data?.content?.length > 0
                                ? response?.data?.content.map((item) => {
                                    return {
                                        ...item,
                                        name: decryptValue(dataSessionKey?.decrytSecretKey, `${item.name}`),
                                        organizationName: decryptValue(
                                            dataSessionKey?.decrytSecretKey,
                                            `${item?.project?.organization?.name}`,
                                        ),
                                        projectName: decryptValue(
                                            dataSessionKey?.decrytSecretKey,
                                            `${item?.project?.name}`,
                                        ),
                                    };
                                })
                                : [];
                    setSubTaskData((prevState) => ({
                        ...prevState,
                        [parentId]: decryptedContent,
                    }));
                    return {
                        data: subTaskData,
                        total: response?.data?.totalElements,
                    };
                }
            },
            onError: (error) => {
                showErrorMessage(error);
            },
        });
    };

    const handleCheckDone = (id) => {
        executeCheckDone({
            data: {
                id,
            },
            onCompleted: (res) => {
                showSucsessMessage('Check done successfully');
                if(parentId){
                    handleGetListSubTask(parentId);
                }
                mixinFuncs.getList();
            },
            onError: (err) => {
                showErrorMessage('Check done failed !');
            },
        });
    };

    const { dateTimeUnit } = useSettingUnit();

    const { data, mixinFuncs, queryFilter, loading, dataSessionKey, checkKey, setCheckKey, serializeParams } = useListBase({
        apiConfig: {
            getList: apiConfig.task.getList,
            getById: apiConfig.task.getById,
            update: apiConfig.task.update,
            delete: apiConfig.task.delete,
        },
        localSearch: true,
        options: {
            isPaged: DEFAULT_TABLE_ISPAGED_0,
            objectName: translate.formatMessage(pageOptions.objectName),
        },
        tabOptions: {
            queryPage: {  projectId: projectId },
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
                            organizationName: decryptValue(dataSessionKey?.decrytSecretKey, `${item?.project?.organization?.name}`),
                            projectName: decryptValue(dataSessionKey?.decrytSecretKey, `${item?.project?.name}`),
                        };
                    }) : [];
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
                    ignoreParent: 1,
                };
            };
            funcs.getCreateLink = (record) => {
                return `${pagePath}/create${search}`;
            };
            funcs.getItemDetailLink = (dataRow) => {
                return `${pagePath}/${dataRow.id}${search}`;
            };
            funcs.additionalActionColumnButtons = () => ({
                checkDone: ({ id, state }) => (
                    <BaseTooltip title={translate.formatMessage(commonMessage.checkDone)}>
                        <Button
                            type="link"
                            style={{ padding: '0' }}
                            disabled={state == TASK_DONE}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCheckDone(id);
                            }}
                        >
                            <CheckOutlined style={{  color: state == TASK_DONE ? 'gray' : 'green' }} />
                        </Button>
                    </BaseTooltip>
                ),
                editSubTask: ({ id }) => (
                    <BaseTooltip title={translate.formatMessage(commonMessage.checkDone)}>
                        <Button
                            type="link"
                            style={{ padding: '0' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/task/${id}`,
                                    {
                                        state: {
                                            parentId: parentId,
                                            project: project,
                                        },
                                    },
                                );

                            }}
                        >
                            <EditOutlined />
                        </Button>
                    </BaseTooltip>
                ),
            });
        },
    });
    const columns = [
        {
            title: '#',
            dataIndex: 'index',
            key: 'id',
            render: (text, record, index) => {
                const size = 50;
                return orderNumber(paginationInfo, index, size);
            },
            width: 50,
        },
        {
            title: translate.formatMessage(commonMessage.name),
            dataIndex: 'name',
        },
        {
            title: translate.formatMessage(commonMessage.project),
            dataIndex: 'projectName',
        },
        {
            title: translate.formatMessage(commonMessage.organization),
            dataIndex: 'organizationName',
        },
        // {
        //     title: 'Total Sub Note',
        //     width: 180,
        //     dataIndex:'totalChildren',
        //     align: 'center',
        //     render(dataRow) {
        //         return (
        //             <div>
        //                 {dataRow}
        //             </div>
        //         );
        //     },

        // },
        {
            title: 'Created Date',
            width: 180,
            render(dataRow) {
                return (
                    <div style={{ fontWeight: 'normal' }}>
                        {convertUtcToLocalTime(dataRow?.createdDate, dateTimeUnit, dateTimeUnit)}
                    </div>
                );
            },
            align: 'end',
        },
        {
            title: translate.formatMessage(commonMessage.state),
            dataIndex: 'state',
            width: 180,
            align: 'center',
            render(dataRow) {
                const kind = stateValues.find((item) => item.value == dataRow);

                return kind ? (
                    <Tag color={kind.color} style={{ width: '94px', textAlign: 'center' }}>
                        {kind.label}
                    </Tag>
                ) : (
                    <Tag />
                );
            },
        },
        mixinFuncs.renderActionColumn({
            checkDone: mixinFuncs.hasPermission([ apiConfig.task.changeState.baseURL ]),
            edit: true,
            delete: true,
        }, { width: '140px' }),
    ];

    useEffect(() => {
        const projectId = queryParameters.get('projectId');
        const organizationId = queryParameters.get('organizationId');
        const fieldsToSet = {
            name: queryParameters.get('name'),
            projectId: projectId && Number(projectId),
            organizationId: organizationId && Number(organizationId),
            projectName: queryParameters.get('projectName'),
        };
        const validFields = validCheckFields(fieldsToSet);
        if (validFields && data) {
            form.resetFields();
            // handleSearchText(validFields);
        }
    }, [ data ]);

    const handleSearchText = (values) => {
        mixinFuncs.setQueryParams(
            serializeParams({
                ...values,
                projectName: projectName,
                projectId: projectId,
            }),
        );
        const nameFilter = values.name;
        const organizationId = values.organizationId;
        if (nameFilter !== null || projectId !== null || organizationId !== null) {
            const filteredData = data.filter((item) => {
                const matchesName = !nameFilter || item.name.toLowerCase().includes(nameFilter.toLowerCase());
                const matchesOrganization = !organizationId || item?.project?.organization?.id === organizationId;

                return matchesName && matchesOrganization;
            });
            setDataList(filteredData);
            handleResetPage();
        }
    };

    const handleClearSearch = () => {
        form.resetFields();
        mixinFuncs.setQueryParams(
            serializeParams({
                projectId,
                projectName,
            }),
        );
        setDataList(data);
        handleResetPage();
    };

    const expandedRowRender = (record) => {
        const columns = [
            {
                title: '#',
                dataIndex: 'index',
                key: 'id',
                render: (text, record, index) => {
                    const size = 50;
                    return orderNumber(paginationInfo, index, size);
                },
                width: 50,
            },
            {
                title: translate.formatMessage(commonMessage.name),
                dataIndex: 'name',
            },
            {
                title: 'Created Date',
                width: 180,
                render(dataRow) {
                    return (
                        <div style={{ fontWeight: 'normal' }}>
                            {convertUtcToLocalTime(dataRow?.createdDate, dateTimeUnit, dateTimeUnit)}
                        </div>
                    );
                },
                align: 'end',
            },
            {
                title: translate.formatMessage(commonMessage.state),
                dataIndex: 'state',
                width: 180,
                align: 'center',
                render(dataRow) {
                    const kind = stateValues.find((item) => item.value == dataRow);

                    return kind ? (
                        <Tag color={kind.color} style={{ width: '94px', textAlign: 'center' }}>
                            {kind.label}
                        </Tag>
                    ) : (
                        <Tag />
                    );
                },
            },
            mixinFuncs.renderActionColumn({
                checkDone: mixinFuncs.hasPermission([ apiConfig.task.changeState.baseURL ]),
                editSubTask: true,
                delete: true,
            },
            { width: '140px' },
            {},
            <BaseTooltip title={translate.formatMessage(commonMessage.addSubTask)}>
                <Button
                    type="link"
                    style= {{ padding: 0 }}
                    onClick={(e) => {
                        e.stopPropagation();

                        navigate(`/task/create`,
                            {
                                state: {
                                    parentId: record?.id,
                                    project: record?.project,
                                },
                            },
                        );
                    }}
                >
                    {<PlusOutlined style={{ color: 'blue' }} />}
                </Button>
            </BaseTooltip>,
            ),
        ];
        return (
            <Table
                columns={columns}
                dataSource={subTaskData[record.id]}
                pagination={false}
                className="expanded-table"
                style={{ width: '100', overflowY: 'hidden', overflowX: 'hidden' }}
                onRow={(record) => ({
                    onClick: (e) => {
                        e.stopPropagation();
                        setDataModal(record);
                        handlersDetailModal.open();
                    },
                })}
            />
        );
    };

    return (
        <PageWrapper routes={pageOptions.renderBreadcrumbs(commonMessage, translate)}>
            {checkKey ? (
                <>
                    <ListPage
                        searchForm={
                            <BaseForm form={form} onFinish={handleSearchText}>
                                <Row gutter={8}>
                                    <Col span={6}>
                                        <TextField name="name" placeholder={'Task'} />
                                    </Col>
                                    {/* {!projectId && <Col span={4}>
                                        <SelectField
                                            options={projectData}
                                            name="projectId"
                                            placeholder={'Project'}
                                        />
                                    </Col>} */}
                                    <Col span={4}>
                                        <SelectField
                                            options={organizationData}
                                            name="organizationId"
                                            placeholder={'Organization'}
                                        />
                                    </Col>
                                    <Col span={3}>
                                        <Button icon={<SearchOutlined />} type="primary" htmlType="submit">
                                            {'Search'}
                                        </Button>
                                    </Col>
                                    <Col span={3}>
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
                        title={projectName}
                        baseTable={
                            <BaseTable
                                style={{ cusor: 'pointer' }}
                                columns={columns}
                                dataSource={dataList}
                                loading={loading}
                                rowKey={(record) => record.id}
                                pageLocal={true}
                                onPaginationChange={handlePaginationChange}
                                onResetPage={(resetToFirstPage) => {
                                    resetPageRef.current = resetToFirstPage; // Lưu hàm reset trang
                                }}
                                onRow={(record) => ({
                                    onClick: (e) => {
                                        e.stopPropagation();
                                        setDataModal(record);
                                        handlersDetailModal.open();
                                    },
                                })}
                                // expandable={{
                                //     showExpandColumn: true,
                                //     expandRowByClick: false,
                                //     expandedRowRender,
                                //     defaultExpandedRowKeys: ['0'],
                                //     onExpand: (expand, record) => {
                                //         if(expand === true){
                                //             handleGetListSubTask(record?.id);
                                //             setParentId(record?.id);
                                //             setProject(record?.project);
                                //         }
                                //     },
                                // }}
                            />
                        }
                    />
                    <TaskDetailModal
                        open={openDetailModal}
                        onCancel={() => handlersDetailModal.close()}
                        data={dataModal}
                        width={'80vw'}
                        dataSessionKey={dataSessionKey}
                        setDataModal={setDataModal}
                        dataValueKey={dataSessionKey}
                    />
                </>
            ) : (
                <PageNotSessionKey setCheckKey={setCheckKey} />
            )}
        </PageWrapper>
    );
};

export default TaskListPage;
