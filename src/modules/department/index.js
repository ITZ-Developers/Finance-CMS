import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import React from 'react';
import BaseTable from '@components/common/table/BaseTable';
import { DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { useLocation, useNavigate } from 'react-router-dom';
import { orderNumber } from '@utils';
import { BaseTooltip } from '@components/common/form/BaseTooltip';
import routes from '@routes';
import { Button } from 'antd';
import { TeamOutlined } from '@ant-design/icons';

const DepartmentListPage = ({ pageOptions }) => {
    const translate = useTranslate();
    const location = useLocation();
    const { pathname: pagePath } = useLocation();
    const search = location.search;
    const navigate = useNavigate();
    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: {
            getList: apiConfig.department.getList,
            getById: apiConfig.department.getById,
            update: apiConfig.department.update,
            delete: apiConfig.department.delete,
        },
        options: {
            pageSize: DEFAULT_TABLE_ITEM_SIZE,
            objectName: translate.formatMessage(pageOptions.objectName),
        },
        override: (funcs) => {
            funcs.mappingData = (response) => {
                if (response.result === true) {
                    return {
                        data: response.data.content,
                        total: response.data.totalElements,
                    };
                }
            };
            funcs.getCreateLink = (record) => {
                return `${pagePath}/create${search}`;
            };
            funcs.getItemDetailLink = (dataRow) => {
                return `${pagePath}/${dataRow.id}${search}`;
            };
            funcs.additionalActionColumnButtons = () => ({
                user: ({ id, name, status }) => (
                    <BaseTooltip title={translate.formatMessage(commonMessage.user)}>
                        <Button
                            type="link"
                            style={{ padding: '0' }}
                            disabled={status === -1}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                    routes.userDepartmentPage.path +
                                    `?departmentId=${id}&departmentName=${name}`,
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
                return orderNumber(pagination, index);
            },
            width: 50,
        },
        { title: translate.formatMessage(commonMessage.name), dataIndex: 'name' },
        mixinFuncs.renderStatusColumn({ width: '90px' }, { width: '150px' }),
        mixinFuncs.renderActionColumn({ user: true, edit: true, delete: true }, { width: '150px' }),
    ];

    const searchFields = [
        {
            key: 'name',
            placeholder: translate.formatMessage(commonMessage.department),
        },
    ];

    return (
        <PageWrapper routes={pageOptions.renderBreadcrumbs(commonMessage, translate)}>
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({ fields: searchFields, initialValues: queryFilter })}
                actionBar={mixinFuncs.renderActionBar()}
                baseTable={
                    <BaseTable
                        onChange={mixinFuncs.changePagination}
                        columns={columns}
                        dataSource={data}
                        loading={loading}
                        rowKey={(record) => record.id}
                        pagination={pagination}
                    />
                }
            />
        </PageWrapper>
    );
};

export default DepartmentListPage;
