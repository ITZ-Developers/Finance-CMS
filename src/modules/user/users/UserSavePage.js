import PageWrapper from '@components/common/layout/PageWrapper';
import { GROUP_KIND_ADMIN, STATUS_ACTIVE, UserTypes } from '@constants';
import apiConfig from '@constants/apiConfig';
import useSaveBase from '@hooks/useSaveBase';
import React from 'react';
import { useParams } from 'react-router-dom';
import UserForm from './UserForm';
import { defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import useFetch from '@hooks/useFetch';

const message = defineMessages({
    objectName: 'UserAdmin',
});

const UserSavePage = ({ pageOptions }) => {
    const translate = useTranslate();
    const { id } = useParams();
    const { data } = useFetch(apiConfig.groupPermission.getGroupList, {
        immediate: true,
        mappingData: (res) => res.data?.content?.map((item) => ({ value: item.id, label: item.name })),
        params: {
            kind: GROUP_KIND_ADMIN,
        },
    });
    const { detail, mixinFuncs, loading, onSave, setIsChangedFormValues, isEditing, title } = useSaveBase({
        apiConfig: {
            getById: apiConfig.user.getById,
            create: apiConfig.user.create,
            update: apiConfig.user.update,
        },
        options: {
            getListUrl: pageOptions.listPageUrl,
            objectName: translate.formatMessage(pageOptions.objectName),
        },
        override: (funcs) => {
            funcs.prepareUpdateData = (data) => {
                return {
                    status: STATUS_ACTIVE,
                    avatarPath: data.avatar,
                    ...data,
                    id: id,
                };
            };
            funcs.prepareCreateData = (data) => {
                return {
                    ...data,
                    avatarPath: data.avatar,
                    status: STATUS_ACTIVE,
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
            <UserForm
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

export default UserSavePage;
