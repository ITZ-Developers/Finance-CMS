import PageWrapper from '@components/common/layout/PageWrapper';
import { GROUP_KIND_ADMIN, STATUS_ACTIVE, UserTypes } from '@constants';
import apiConfig from '@constants/apiConfig';
import useSaveBase from '@hooks/useSaveBase';
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import UserAdminForm from './UserAdminForm';
import { defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import useFetch from '@hooks/useFetch';

const message = defineMessages({
    objectName: 'User',
});

const UserAdminSavePage = ({ pageOptions }) => {
    const translate = useTranslate();
    const { id } = useParams();
    const location = useLocation();
    const search = location.search;
    const { data } = useFetch(apiConfig.groupPermission.getGroupList, {
        immediate: true,
        mappingData: (res) => res.data?.content?.map((item) => ({ value: item.id, label: item.name })),
        params: {
            kind: GROUP_KIND_ADMIN,
        },
    });
    const { detail, mixinFuncs, loading, onSave, setIsChangedFormValues, isEditing, title } = useSaveBase({
        apiConfig: {
            getById: apiConfig.account.getById,
            create: apiConfig.account.createAdmin,
            update: apiConfig.account.updateAdmin,
        },
        options: {
            getListUrl: pageOptions.listPageUrl + `${search}`,
            objectName: translate.formatMessage(pageOptions.objectName),
        },
        override: (funcs) => {
            funcs.prepareUpdateData = (data) => {
                return {
                    status: STATUS_ACTIVE,
                    kind: UserTypes.ADMIN,
                    avatarPath: data.avatarPath,
                    groupId: data.group.id,
                    ...data,
                    id: id,
                };
            };
            funcs.prepareCreateData = (data) => {
                return {
                    ...data,
                    kind: UserTypes.ADMIN,
                    avatarPath: data.avatarPath,
                    status: STATUS_ACTIVE,
                    groupId: data.group.id,
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
            <UserAdminForm
                setIsChangedFormValues={setIsChangedFormValues}
                dataDetail={detail ? detail : {}}
                formId={mixinFuncs.getFormId()}
                isEditing={isEditing}
                actions={mixinFuncs.renderActions()}
                onSubmit={onSave}
                groups={data || []}
            />
        </PageWrapper>
    );
};

export default UserAdminSavePage;
