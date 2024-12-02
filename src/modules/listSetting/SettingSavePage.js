import PageWrapper from '@components/common/layout/PageWrapper';
import apiConfig from '@constants/apiConfig';
import useSaveBase from '@hooks/useSaveBase';
import React from 'react';
import { useParams } from 'react-router-dom';
import SettingForm from './SettingForm';
import { defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import routes from '@routes';

const message = defineMessages({
    objectName: 'setting',
});

const SettingSavePage = () => {
    const translate = useTranslate();
    const { id } = useParams();
    const { detail, mixinFuncs, loading, onSave, setIsChangedFormValues, isEditing, title } = useSaveBase({
        apiConfig: {
            getById: apiConfig.settings.getById,
            create: apiConfig.settings.create,
            update: apiConfig.settings.update,
        },
        options: {
            getListUrl: routes.listSettingsPage.path,
            objectName: translate.formatMessage(message.objectName),
        },
        override: (funcs) => {
            funcs.prepareUpdateData = (data) => {
                return {
                    ...data,
                    id: id,
                    status: 1,
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
        <PageWrapper
            loading={loading}
            routes={[
                {
                    breadcrumbName: translate.formatMessage(commonMessage.listSetting),
                    path: routes.listSettingsPage.path,
                },
                { breadcrumbName: title },
            ]}
        >
            <SettingForm
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

export default SettingSavePage;
