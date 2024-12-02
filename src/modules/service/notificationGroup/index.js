import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import { Button, Col, Form, Row } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import BaseTable from '@components/common/table/BaseTable';
import { DEFAULT_FORMAT, DEFAULT_TABLE_ISPAGED_0, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { convertUtcToLocalTime, decryptValue, orderNumber } from '@utils';
import { getSessionStorageWithExpiry } from '@utils/sessionStorage';
import { BaseTooltip } from '@components/common/form/BaseTooltip';
import routes from '@routes';
import { TeamOutlined } from '@ant-design/icons';
import PageNotSessionKey from '@components/common/page/PageNotSessionKey';
import { BaseForm } from '@components/common/form/BaseForm';
import TextField from '@components/common/form/TextField';
import { ClearOutlined, SearchOutlined } from '@ant-design/icons';

const NotificationGroupListPage = ({ pageOptions }) => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const location = useLocation();
    const { pathname: pagePath } = useLocation();
    const search = location.search;
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

    const [dataList, setDataList] = useState([]);
    const [nameFilter, setNameFilter] = useState(null);
    const { id } = useParams();
    const queryParameters = new URLSearchParams(window.location.search);
    const serviceId = queryParameters.get('serviceId');
    const { data, mixinFuncs, queryFilter, loading, dataSessionKey, checkKey, setCheckKey, serializeParams } = useListBase({
        apiConfig: {
            getList: apiConfig.serviceNotification.getList,
            getById: apiConfig.serviceNotification.getById,
            update: apiConfig.serviceNotification.update,
            delete: apiConfig.serviceNotification.delete,
        },
        options: {
            isPaged: DEFAULT_TABLE_ISPAGED_0,
            objectName: translate.formatMessage(pageOptions.objectName),
        },
        isSessionKey: true,
        override: (funcs) => {
            funcs.mappingData = (response) => {
                if (response.result === true) {
                    const decryptedContent = response?.data?.content?.length > 0 ? response?.data?.content.map((item) => {
                        return {
                            ...item,
                            name: decryptValue(dataSessionKey?.decrytSecretKey, `${item.notificationGroup.name}`),
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
                if (filter.name) {
                    setNameFilter(filter.name);
                    delete filter.name;
                }

                mixinFuncs.setQueryParams(
                    serializeParams({
                        ...filter,
                    }),
                );
            };
            funcs.additionalActionColumnButtons = () => ({
                userNoti: ({ id, name, status, notificationGroup }) => (
                    <BaseTooltip title={translate.formatMessage(commonMessage.userNotification)}>
                        <Button
                            type="link"
                            style={{ padding: '0' }}
                            disabled={status === -1}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                    routes.notificationGroupServiceMemberListPage.path +
                                        `?notificationGroupId=${notificationGroup.id}&notificationGroupName=${name}&serviceId=${serviceId}`,
                                );
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
        mixinFuncs.renderStatusColumn({ width: '90px' }, { width: '150px' }),
        mixinFuncs.renderActionColumn({ userNoti: true, edit: false, delete: true }, { width: '150px' }),
    ];

    const searchFields = [
        {
            key: 'name',
            placeholder: translate.formatMessage(commonMessage.notificationGroup),
        },
    ];

    const handleSearchText = (values) => {
        const nameFilter = values.name;
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

    return (
        <PageWrapper routes={pageOptions.renderBreadcrumbs(commonMessage, translate)}>
            {checkKey ? (
                <ListPage
                    searchForm={
                        <BaseForm form={form} onFinish={handleSearchText}>
                            <Row gutter={8}>
                                <Col span={6}>
                                    <TextField name="name" placeholder={'Notification Group'} />
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
                        />
                    }
                />
            ) : (
                <PageNotSessionKey setCheckKey={setCheckKey} />
            )}
        </PageWrapper>
    );
};

export default NotificationGroupListPage;
