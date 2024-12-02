import PageWrapper from '@components/common/layout/PageWrapper';
import apiConfig from '@constants/apiConfig';
import useSaveBase from '@hooks/useSaveBase';
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import ProjectForm from './ProjectForm';

const message = defineMessages({
    objectName: 'Project',
});

const ProjectSavePage = ({ pageOptions }) => {
    const translate = useTranslate();
    const { id } = useParams();
    const location = useLocation();
    const search = location.search;
    const queryParameters = new URLSearchParams(window.location.search);
    const serviceId = queryParameters.get('serviceId');
    const { detail, mixinFuncs, loading, onSave, setIsChangedFormValues, isEditing, title, dataSessionKey } = useSaveBase({
        apiConfig: {
            getById: apiConfig.project.getById,
            create: apiConfig.project.create,
            update: apiConfig.project.update,
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
            // funcs.onSaveError = (err) => {
            //     if (err.code === "ERROR-SERVICE-SCHEDULE-0001") {
            //         showErrorMessage("Số ngày đến hạn đã tồn tại trong dịch vụ này");
            //         mixinFuncs.setSubmit(false);
            //     } else {
            //         mixinFuncs.handleShowErrorMessage(err, showErrorMessage);
            //         mixinFuncs.setSubmit(false);
            //     }
            // };
        },
    });

    return (
        <PageWrapper loading={loading} routes={pageOptions.renderBreadcrumbs(commonMessage, translate, title, search)}>
            <ProjectForm
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

export default ProjectSavePage;
