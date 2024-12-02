import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import React, { useEffect, useRef, useState } from 'react';
import BaseTable from '@components/common/table/BaseTable';
import { DEFAULT_FORMAT, DEFAULT_TABLE_ISPAGED_0, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import useAuth from '@hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import { convertUtcToLocalTime, decryptValue, orderNumber, validCheckFields } from '@utils';
import PageNotSessionKey from '@components/common/page/PageNotSessionKey';
import { BaseForm } from '@components/common/form/BaseForm';
import { Button, Col, Form, Row } from 'antd';
import TextField from '@components/common/form/TextField';
import { ClearOutlined, SearchOutlined } from '@ant-design/icons';
import useSettingUnit from '@hooks/useSettingUnit';
import routes from './routes';
import { BaseTooltip } from '@components/common/form/BaseTooltip';
import { TeamOutlined } from '@ant-design/icons';

const GroupTransactionListPage = ({ pageOptions }) => {
    const queryParameters = new URLSearchParams(window.location.search);
    const translate = useTranslate();
    const { isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { pathname: pagePath } = useLocation();
    const search = location.search;
    const [dataList, setDataList] = useState([]);
    const [nameFilter, setNameFilter] = useState(null);
    const [paginationInfo, setPaginationInfo] = useState({ current: 1, pageSize: 50, total: null });
    const [form] = Form.useForm();
    const handlePaginationChange = (pagination) => {
        setPaginationInfo(pagination);
    };
    const resetPageRef = useRef(null);

    const handleResetPage = () => {
        if (resetPageRef.current) {
            resetPageRef.current(); // Gọi hàm reset trang 1 từ BaseTable
        }
    };
    const { moneyUnit, dateUnit, dateTimeUnit, decimalSeparator, groupSeparator } = useSettingUnit();
    const { data, mixinFuncs, queryFilter, loading, dataSessionKey, checkKey, setCheckKey, serializeParams } = useListBase({
        apiConfig: {
            getList: apiConfig.groupTransaction.getList,
            getById: apiConfig.groupTransaction.getById,
            update: apiConfig.groupTransaction.update,
            delete: apiConfig.groupTransaction.delete,
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
                user: ({ id, name, status }) => (
                    <BaseTooltip title={translate.formatMessage(commonMessage.transactionPermission)}>
                        <Button
                            type="link"
                            style={{ padding: '0' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(routes.userOfTransactionListPage.path + `?transactionGroupId=${id}&transactionGroupName=${name}`);

                            }}
                        >
                            <TeamOutlined />
                        </Button>
                    </BaseTooltip>
                ),
            });
        },
    });
    useEffect(() => {
        if (nameFilter !== null) {
            const filteredData = data.filter((item) => item.name.toLowerCase().includes(nameFilter.toLowerCase()));
            setDataList(filteredData);
            handleResetPage();
        }
    }, [nameFilter]);
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
                        {convertUtcToLocalTime(dataRow?.createdDate, dateUnit, dateUnit)}
                    </div>
                );
            },
            align: 'end',
        },
        mixinFuncs.renderStatusColumn({ width: '120px' }),
        mixinFuncs.renderActionColumn({ user: mixinFuncs.hasPermission([apiConfig.transactionPermission.getList.baseURL]), edit: true, delete: true }, { width: '150px' }),
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

    const handleClearSearch = () => {
        form.resetFields();
        setDataList(data);
        handleResetPage();
    };

    const handleSearchText = (values) => {
        const nameFilter = values.name;
        mixinFuncs.setQueryParams(
            serializeParams({
                ...values,
            }),
        );
        if (nameFilter !== null ) {
            const filteredData = data.filter((item) => {
                const matchesName = !nameFilter || item.name.toLowerCase().includes(nameFilter.toLowerCase());
               

                return matchesName ;
            });
            setDataList(filteredData);
            handleResetPage();
        }
    };


    return (
        <PageWrapper routes={pageOptions.renderBreadcrumbs(commonMessage, translate)}>
            {checkKey ? (
                <ListPage
                    searchForm={
                        <BaseForm form={form} onFinish={handleSearchText}>
                            <Row gutter={8}>
                                <Col span={6}>
                                    <TextField name="name" placeholder={'Group transaction'} />
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

export default GroupTransactionListPage;
