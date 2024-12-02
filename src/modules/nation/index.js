import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import React, { useEffect, useState } from 'react';
import BaseTable from '@components/common/table/BaseTable';
import { DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import useTranslate from '@hooks/useTranslate';
import { defineMessages, FormattedMessage } from 'react-intl';
import { commonMessage } from '@locales/intl';
import { Button, Tag } from 'antd';
import { BaseTooltip } from '@components/common/form/BaseTooltip';
import { useNavigate } from 'react-router-dom';
import routes from '@routes';
import { RightSquareOutlined } from '@ant-design/icons';
import styles from './nation.module.scss';

const message = defineMessages({
    objectName: 'Nation',
});

const ProvinceListPage = () => {
    const translate = useTranslate();
    const navigate = useNavigate();

    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: apiConfig.nation,
        options: {
            pageSize: DEFAULT_TABLE_ITEM_SIZE,
            objectName: translate.formatMessage(message.objectName),
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
            funcs.getList = () => {
                const params = mixinFuncs.prepareGetListParams(queryFilter);
                mixinFuncs.handleFetchList({ ...params, kind: 1 });
            };
            funcs.additionalActionColumnButtons = () => ({
                district: ({ id, name }) => (
                    <BaseTooltip title={translate.formatMessage(commonMessage.district)}>
                        <Button
                            type="link"
                            style={{ padding: 0 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                    routes.nationListPage.path + `/district?provinceId=${id}&provinceName=${name}`,
                                );
                            }}
                        >
                            <RightSquareOutlined />
                        </Button>
                    </BaseTooltip>
                ),
            });
        },
    });

    const handleOnClick = (event, record) => {
        event.preventDefault();
        navigate(routes.nationListPage.path + `/district?provinceId=${record.id}&provinceName=${record.name}`);
    };
    const columns = [
        {
            title: translate.formatMessage(commonMessage.Province),
            dataIndex: 'name',
            render: (name, record) => (
                <div onClick={(event) => handleOnClick(event, record)} className={styles.customDiv}>
                    {name}
                </div>
            ),
        },
        // {
        //     title: <FormattedMessage defaultMessage="Post Code" />,
        //     width: 180,
        //     dataIndex: 'postCode',
        // },
        mixinFuncs.renderStatusColumn({ width: '120px' }),

        mixinFuncs.renderActionColumn(
            {
                edit: true,
                delete: true,
            },
            { width: '130px' },
        ),
    ];

    const searchFields = [
        {
            key: 'name',
            placeholder: translate.formatMessage(commonMessage.Province),
        },

        // {
        //     key: 'kind',
        //     placeholder: translate.formatMessage(commonMessage.kind),
        //     type: FieldTypes.SELECT,
        //     options: nationValues,
        // },
    ];

    return (
        <PageWrapper routes={[{ breadcrumbName: translate.formatMessage(commonMessage.Province) }]}>
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({ fields: searchFields, initialValues: queryFilter })}
                actionBar={mixinFuncs.renderActionBar()}
                baseTable={
                    <BaseTable
                        onChange={mixinFuncs.changePagination}
                        columns={columns}
                        dataSource={data}
                        loading={loading}
                        pagination={pagination}
                    />
                }
            />
        </PageWrapper>
    );
};

export default ProvinceListPage;
