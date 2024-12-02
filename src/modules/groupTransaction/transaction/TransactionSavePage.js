import PageWrapper from '@components/common/layout/PageWrapper';
import { GROUP_KIND_ADMIN, STATUS_ACTIVE, UserTypes } from '@constants';
import apiConfig from '@constants/apiConfig';
import useSaveBase from '@hooks/useSaveBase';
import React, { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import useFetch from '@hooks/useFetch';
import DepartmentForm from './TransactionForm';

const message = defineMessages({
    objectName: 'UserAdmin',
});

const TransactionSavePage = ({ pageOptions }) => {
    const translate = useTranslate();
    const { id } = useParams();
    const location = useLocation();
    const { pathname: pagePath } = useLocation();
    const search = useMemo(() => {
        return location.search;
    }, []);
    const { detail, mixinFuncs, loading, onSave, setIsChangedFormValues, isEditing, title } = useSaveBase({
        apiConfig: {
            getById: apiConfig.transaction.getById,
            create: apiConfig.transaction.create,
            update: apiConfig.transaction.update,
        },
        options: {
            getListUrl: pageOptions.listPageUrl + `${search}`,
            objectName: translate.formatMessage(pageOptions.objectName),
        },
        override: (funcs) => {
            funcs.prepareUpdateData = (data) => {
                return {
                    ...data,
                    id: id,
                };
            };
            funcs.prepareCreateData = (data) => {
                return {
                    ...data,
                };
            };

            funcs.mappingData = (data) => {
                return {
                    ...data.data,
                };
            };
        },
    });

    return (
        <PageWrapper loading={loading} routes={pageOptions.renderBreadcrumbs(commonMessage, translate, title)}>
            <DepartmentForm
                setIsChangedFormValues={setIsChangedFormValues}
                dataDetail={detail ? detail : {}}
                formId={mixinFuncs.getFormId()}
                isEditing={isEditing}
                actions={mixinFuncs.renderActions()}
                onSubmit={onSave}
            />
        </PageWrapper>
    );
};

export default TransactionSavePage;
