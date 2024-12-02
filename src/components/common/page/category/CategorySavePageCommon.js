import PageWrapper from '@components/common/layout/PageWrapper';
import apiConfig from '@constants/apiConfig';
import useSaveBase from '@hooks/useSaveBase';
import React from 'react';
import CategoryFormCommon from './CategoryFormCommon';
import { defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { useLocation } from 'react-router-dom';

const message = defineMessages({
    objectName: 'category',
});

const CategorySavePageCommon = ({ routes, kind, getListUrl }) => {
    const translate = useTranslate();
    const { detail, mixinFuncs, loading, setIsChangedFormValues, isEditing, title, dataSessionKey } = useSaveBase({
        apiConfig: {
            getById: apiConfig.category.getById,
            create: apiConfig.category.create,
            update: apiConfig.category.update,
        },
        options: {
            getListUrl,
            objectName: translate.formatMessage(message.objectName),
        },
        override: (funcs) => {
            funcs.prepareUpdateData = (data) => {
                return {
                    ...data,
                    id: detail.id,
                    categoryId: detail.id,
                };
            };
            funcs.prepareCreateData = (data) => {
                return {
                    ...data,
                };
            };
        },
    });

    return (
        <PageWrapper loading={loading} routes={[...routes, { breadcrumbName: title }]} title={title}>
            <CategoryFormCommon
                setIsChangedFormValues={setIsChangedFormValues}
                dataDetail={detail ? detail : {}}
                formId={mixinFuncs.getFormId()}
                isEditing={isEditing}
                actions={mixinFuncs.renderActions()}
                onSubmit={mixinFuncs.onSave}
                dataSessionKey={dataSessionKey}
            />
        </PageWrapper>
    );
};

export default CategorySavePageCommon;
