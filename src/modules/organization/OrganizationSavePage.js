import PageWrapper from '@components/common/layout/PageWrapper';
import apiConfig from '@constants/apiConfig';
import useSaveBase from '@hooks/useSaveBase';
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { showErrorMessage } from '@services/notifyService';
import OrganizationForm from './OrganizationForm';

const message = defineMessages({
    objectName: 'Group Key Information',
});

const OrganizationSavePage = ({ pageOptions }) => {
    const translate = useTranslate();
    const { id } = useParams();
    const location = useLocation();
    const search = location.search;
    const { detail, mixinFuncs, loading, onSave, setIsChangedFormValues, isEditing, title, dataSessionKey } = useSaveBase({
        apiConfig: {
            getById: apiConfig.organization.getById,
            create: apiConfig.organization.create,
            update: apiConfig.organization.update,
        },
        options: {
            getListUrl: pageOptions.listPageUrl + `${search}`,
            objectName: translate.formatMessage(pageOptions.objectName),
        },
        override: (funcs) => {

            funcs.mappingData = (data) => {
                return {
                    ...data.data,
                };
            };
            funcs.onSaveError = (err) => {
                if (err.code === "ERROR-SERVICE-SCHEDULE-0001") {
                    showErrorMessage("Số ngày đến hạn đã tồn tại trong dịch vụ này");
                    mixinFuncs.setSubmit(false);
                } else {
                    mixinFuncs.handleShowErrorMessage(err, showErrorMessage);
                    mixinFuncs.setSubmit(false);
                }
            };
        },
    });

    return (
        <PageWrapper loading={loading} routes={pageOptions.renderBreadcrumbs(commonMessage, translate, title, search)}>
            <OrganizationForm
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

export default OrganizationSavePage;
