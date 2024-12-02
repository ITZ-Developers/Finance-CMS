import BaseTable from '@components/common/table/BaseTable';
import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import { Button, Modal, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { EyeOutlined, UserOutlined } from '@ant-design/icons';
import AvatarField from '@components/common/form/AvatarField';
import ListPage from '@components/common/layout/ListPage';
import PageWrapper from '@components/common/layout/PageWrapper';
import { AppConstants, categoryKind, DEFAULT_FORMAT, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import { FieldTypes } from '@constants/formConfig';
import { statusOptions } from '@constants/masterData';
import useFetch from '@hooks/useFetch';
import useNotification from '@hooks/useNotification';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { convertUtcToLocalTime } from '@utils';
import { defineMessages, FormattedMessage } from 'react-intl';
import styles from './index.module.scss';
const message = defineMessages({
    objectName: 'news',
});

const NewsListPage = () => {
    const translate = useTranslate();
    const notification = useNotification();
    const statusValues = translate.formatKeys(statusOptions, ['label']);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const { execute: executeUpdateNewsPin, loading: updateNewsPinLoading } = useFetch(apiConfig.news.update);

    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: apiConfig.news,
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
            funcs.additionalActionColumnButtons = () => {
                if (!mixinFuncs.hasPermission([apiConfig.news.getById.baseURL])) return {};
                return {
                    preview: ({ id }) => {
                        return (
                            <Button
                                type="link"
                                style={{ padding: 0 }}
                                onClick={() => {
                                    executeGetNews({
                                        pathParams: {
                                            id,
                                        },
                                        onCompleted: () => setShowPreviewModal(true),
                                        onError: () =>
                                            notification({
                                                type: 'error',
                                                title: 'Error',
                                                message: translate.formatMessage(commonMessage.previewFailed),
                                            }),
                                    });
                                }}
                            >
                                <EyeOutlined />
                            </Button>
                        );
                    },
                };
            };
        },
    });

    const {
        execute: executeGetNews,
        loading: getNewsLoading,
        data: newsContent,
    } = useFetch(apiConfig.news.getById, {
        immediate: false,
        mappingData: ({ data }) => data.content,
    });

    const {
        data: categories,
        loading: getCategoriesLoading,
        execute: executeGetCategories,
    } = useFetch(apiConfig.category.autocomplete, {
        immediate: true,
        mappingData: ({ data }) =>
            data.content
                .map((item) => ({
                    value: item?.id,
                    label: item?.name,
                }))
                .filter((item, index, self) => {
                    // Lọc ra các phần tử duy nhất bằng cách so sánh value
                    return index === self.findIndex((t) => t.value === item.value);
                }),
    });

    const handleUpdatePinTop = (item) => {
        executeUpdateNewsPin({
            pathParams: {
                id: item.id,
            },
            data: {
                ...item,
                pinTop: Number(!item.pinTop),
            },
        });
    };

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
        { title: <FormattedMessage defaultMessage="Title" />, dataIndex: 'title' },
        {
            title: <FormattedMessage defaultMessage="Category" />,
            width: 120,
            dataIndex: ['category', 'name'],
            render: (dataRow) => {
                return (
                    <Tag color="#108ee9">
                        <div style={{ padding: '0 4px', fontSize: 14 }}>{dataRow}</div>
                    </Tag>
                );
            },
        },
        {
            title: <FormattedMessage defaultMessage="Created Date" />,
            width: 180,
            dataIndex: 'createdDate',
            render: (createdDate) => {
                const createdDateLocal = convertUtcToLocalTime(createdDate, DEFAULT_FORMAT, DEFAULT_FORMAT);
                return <div>{createdDateLocal}</div>;
            },
        },
        // {
        //     title: <FormattedMessage defaultMessage="Pin top" />,
        //     width: 80,
        //     align: 'center',
        //     render: (dataRow) => {
        //         const Icon = dataRow.pinTop ? IconPin : IconPinnedOff;

        //         return <Icon onClick={() => handleUpdatePinTop(dataRow)} size={18} />;
        //     },
        // },
        mixinFuncs.renderStatusColumn({ width: '90px' }),
        mixinFuncs.renderActionColumn(
            {
                preview: {
                    permissions: apiConfig.news.getById.baseURL,
                },
                edit: true,
                delete: true,
            },
            { width: '130px' },
        ),
    ];

    const searchFields = [
        {
            key: 'title',
            placeholder: translate.formatMessage(commonMessage.title),
        },
        {
            key: 'categoryId',
            placeholder: translate.formatMessage(commonMessage.category),
            type: FieldTypes.SELECT,
            options: categories,
        },
        {
            key: 'status',
            placeholder: translate.formatMessage(commonMessage.status),
            type: FieldTypes.SELECT,
            options: statusValues,
        },
    ];

    useEffect(() => {
        executeGetCategories({
            params: {
                kind: categoryKind.news,
            },
        });
    }, []);

    return (
        <PageWrapper
            loading={getNewsLoading}
            routes={[{ breadcrumbName: translate.formatMessage(commonMessage.news) }]}
        >
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({ fields: searchFields, initialValues: queryFilter })}
                actionBar={mixinFuncs.renderActionBar()}
                baseTable={
                    <BaseTable
                        onChange={mixinFuncs.changePagination}
                        columns={columns}
                        dataSource={data}
                        loading={loading || getCategoriesLoading || updateNewsPinLoading}
                        pagination={pagination}
                    />
                }
            />
            <Modal
                title={<FormattedMessage defaultMessage="Preview" />}
                width={1000}
                open={showPreviewModal}
                footer={null}
                centered
                onCancel={() => setShowPreviewModal(false)}
            >
                {newsContent && (
                    <div className={styles.previewContent} dangerouslySetInnerHTML={{ __html: newsContent }}></div>
                )}
            </Modal>
        </PageWrapper>
    );
};

export default NewsListPage;
