import PageWrapper from '@components/common/layout/PageWrapper';
import apiConfig from '@constants/apiConfig';
import useSaveBase from '@hooks/useSaveBase';
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import UserTransactionForm from './UserTransactionForm';
import { PermissionKind } from '@constants';

const message = defineMessages({
    objectName: 'Group Transaction',
});

const UserTransactionSavePage = ({ pageOptions }) => {
    const translate = useTranslate();
    const { id } = useParams();
    const location = useLocation();
    const search = location.search;
    const queryParameters = new URLSearchParams(window.location.search);
    const transactionGroupId = queryParameters.get('transactionGroupId');
    const { detail, mixinFuncs, loading, onSave, setIsChangedFormValues, isEditing, title, dataSessionKey } = useSaveBase({
        apiConfig: {
            getById: apiConfig.transactionPermission.getById,
            create: apiConfig.transactionPermission.create,
            update: apiConfig.transactionPermission.update,
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
                    permissionKind: PermissionKind.GROUP,
                    transactionGroupId,
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
        <PageWrapper loading={loading} routes={pageOptions.renderBreadcrumbs(commonMessage, translate, title, search)}>
            <UserTransactionForm
                setIsChangedFormValues={setIsChangedFormValues}
                dataDetail={detail ? detail : {}}
                formId={mixinFuncs.getFormId()}
                isEditing={isEditing}
                actions={mixinFuncs.renderActions()}
                onSubmit={onSave}
                dataSessionKey={dataSessionKey}
            />
        </PageWrapper>
    );
};

export default UserTransactionSavePage;
