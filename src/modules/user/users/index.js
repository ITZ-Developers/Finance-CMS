import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import { Button } from 'antd';
import React from 'react';
import BaseTable from '@components/common/table/BaseTable';
import { UserOutlined } from '@ant-design/icons';
import { AppConstants, DATE_FORMAT_VALUE, DEFAULT_FORMAT, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import useTranslate from '@hooks/useTranslate';
import AvatarField from '@components/common/form/AvatarField';
import { commonMessage } from '@locales/intl';
import { convertUtcToLocalTime } from '@utils/index';
import { BaseTooltip } from '@components/common/form/BaseTooltip';
import { useNavigate } from 'react-router-dom';
import routes from '@routes';
import { HomeOutlined } from '@ant-design/icons';

const UserListPage = ({ pageOptions }) => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: apiConfig.user,
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
            funcs.additionalActionColumnButtons = () => ({
                address: ({ id }) => (
                    <BaseTooltip title={translate.formatMessage(commonMessage.address)}>
                        <Button
                            type="link"
                            style={{ padding: 0 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                    routes.userListPage.path +
                                    `/address?userId=${id}`,
                                    {
                                        state: { action: 'taskLog', prevPath: location.pathname },
                                    },
                                );
                            }}
                        >
                            <HomeOutlined />
                        </Button>
                    </BaseTooltip>
                ),
            });
        },
    });
    const columns = [
        {
            title: '#',
            dataIndex: 'avatar',
            align: 'center',
            width: 100,
            render: (avatar) => (
                <AvatarField
                    size="large"
                    icon={<UserOutlined />}
                    src={avatar ? `${AppConstants.contentRootUrl}${avatar}` : null}
                />
            ),
        },
        { title: translate.formatMessage(commonMessage.fullName), dataIndex: ['account','fullName'] },
        { title: translate.formatMessage(commonMessage.phone), dataIndex: ['account','phone'], width: '130px' },
        { title: translate.formatMessage(commonMessage.email), dataIndex: ['account','email'] },
        {
            title: translate.formatMessage(commonMessage.birthday),
            dataIndex: 'birthday',
            render: (birthday) => {
                const result = convertUtcToLocalTime(birthday, DEFAULT_FORMAT, DATE_FORMAT_VALUE);
                return <div>{result}</div>;
            },
            width: '180px',
        },
        // {
        //     title: translate.formatMessage(commonMessage.createdDate),
        //     dataIndex: 'createdDate',
        //     width: '180px',
        //     render: (createdDate) => convertUtcToTimezone(createdDate),
        // },
        // mixinFuncs.renderStatusColumn({ width: '90px' }),
        mixinFuncs.renderActionColumn({ address:true, edit: true, delete: true }, { width: '120px' }),

    ];

    const searchFields = [
        {
            key: 'name',
            placeholder: translate.formatMessage(commonMessage.fullName),
        },
        // {
        //     key: 'status',
        //     placeholder: translate.formatMessage(commonMessage.status),
        //     type: FieldTypes.SELECT,
        //     options: statusValues,
        // },
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

export default UserListPage;
