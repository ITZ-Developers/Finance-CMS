import PageWrapper from '@components/common/layout/PageWrapper';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';
import useFetchAction from '@hooks/useFetchAction';
import useSaveBase from '@hooks/useSaveBase';
import { accountActions } from '@store/actions';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProfileForm from './ProfileForm';
import { defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import useAuth from '@hooks/useAuth';

const message = defineMessages({
    objectName: 'profile',
});

const ProfilePage = () => {
    const { profile, permissions } = useAuth();
    const translate = useTranslate();
    const [detail, setDetail] = useState({});
    const { execute, loading } = useFetch({ ...apiConfig.account.getProfile }, { immediate: false });
    const { execute: executeGetProfile } = useFetchAction(accountActions.getProfile);
    const { mixinFuncs, onSave, setIsChangedFormValues, isEditing } = useSaveBase({
        options: {
            getListUrl: `/admins`,
            objectName: translate.formatMessage(message.objectName),
        },
        apiConfig: {
            getById: apiConfig.account.getProfile,
            update: apiConfig.account.updateProfileAdmin,
        },
        override: (funcs) => {
            const onSaveCompleted = funcs.onSaveCompleted;

            funcs.onSaveCompleted = (response) => {
                onSaveCompleted(response);
                executeGetProfile();
            };
        },
    });

    useEffect(() => {
        execute({
            onCompleted: (response) => {
                if (response.result === true) setDetail(response.data);
            },
            onError: mixinFuncs.handleGetDetailError,
        });
    }, []);

    return (
        <PageWrapper
            loading={loading}
            routes={[
                { breadcrumbName: translate.formatMessage(commonMessage.profile) },
            ]}
        >
            <ProfileForm
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

export default ProfilePage;
