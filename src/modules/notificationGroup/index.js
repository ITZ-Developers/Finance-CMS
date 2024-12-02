import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import { Button, Col, Form, Row } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import BaseTable from '@components/common/table/BaseTable';
import { DEFAULT_FORMAT, DEFAULT_TABLE_ISPAGED_0 } from '@constants';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { useLocation, useNavigate } from 'react-router-dom';
import { convertUtcToLocalTime, decryptValue, orderNumber, validCheckFields } from '@utils';
import { BaseTooltip } from '@components/common/form/BaseTooltip';
import routes from '@routes';
import { TeamOutlined } from '@ant-design/icons';
import PageNotSessionKey from '@components/common/page/PageNotSessionKey';
import { BaseForm } from '@components/common/form/BaseForm';
import TextField from '@components/common/form/TextField';
import { ClearOutlined, SearchOutlined } from '@ant-design/icons';
import useSettingUnit from '@hooks/useSettingUnit';

const NotificationGroupListPage = ({ pageOptions }) => {
    const queryParameters = new URLSearchParams(window.location.search);
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
    const { dateTimeUnit } = useSettingUnit();
    const { data, mixinFuncs, queryFilter, loading, dataSessionKey, checkKey, setCheckKey, serializeParams } = useListBase({
        apiConfig: {
            getList: apiConfig.notificationGroup.getList,
            getById: apiConfig.notificationGroup.getById,
            update: apiConfig.notificationGroup.update,
            delete: apiConfig.notificationGroup.delete,
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
                userNoti: ({ id, name, status, studentName, state }) => (
                    <BaseTooltip title={translate.formatMessage(commonMessage.userNotification)}>
                        <Button
                            type="link"
                            style={{ padding: '0' }}
                            disabled={status === -1}
                            onClick={(e) => {
                                e.stopPropagation();
                                const groupName = decryptValue(dataSessionKey?.decrytSecretKey, `${name}`);
                                navigate(
                                    routes.userNotificationListPage.path +
                                        `?notificationGroupId=${id}&notificationGroupName=${name}`,
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
                        {convertUtcToLocalTime(dataRow?.createdDate, dateTimeUnit, dateTimeUnit)}
                    </div>
                );
            },
            align: 'end',
        },
        mixinFuncs.renderStatusColumn({ width: '120px' }),
        mixinFuncs.renderActionColumn({ userNoti: true, edit: true, delete: true }, { width: '150px' }),
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
    }, [ data ]);

    const handleSearchText = (values) => {
        mixinFuncs.setQueryParams(
            serializeParams({
                ...values,
            }),
        );
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
