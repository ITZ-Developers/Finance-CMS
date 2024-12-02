import PageWrapper from '@components/common/layout/PageWrapper';
import apiConfig from '@constants/apiConfig';
import useSaveBase from '@hooks/useSaveBase';
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import TaskForm from './TaskForm';
import { TASK_PENDING } from '@constants';

const TaskSavePage = ({ pageOptions }) => {
    const translate = useTranslate();
    const { id } = useParams();
    const location = useLocation();
    const search = location.search;
    const stateLocation  = location.state || {};
    const queryParameters = new URLSearchParams(window.location.search);
    const projectId = queryParameters.get('projectId');
    const projectName = queryParameters.get('projectName');
    const { detail, mixinFuncs, loading, onSave, setIsChangedFormValues, isEditing, title, dataSessionKey } = useSaveBase({
        apiConfig: {
            getById: apiConfig.task.getById,
            create: apiConfig.task.create,
            update: apiConfig.task.update,
        },
        options: {
            getListUrl: pageOptions.listPageUrl + `?projectId=${projectId}&&projectName=${projectName}`,
            objectName: translate.formatMessage(pageOptions.objectName),
        },
        override: (funcs) => {

            funcs.mappingData = (data) => {
                return {
                    ...data.data,
                };
            };
            funcs.prepareCreateData = (data) => {
                return {
                    ...data,
                    state: TASK_PENDING,
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
            <TaskForm
                setIsChangedFormValues={setIsChangedFormValues}
                dataDetail={detail ? detail : {}}
                formId={mixinFuncs.getFormId()}
                isEditing={isEditing}
                actions={mixinFuncs.renderActions()}
                onSubmit={onSave}
                dataSessionKey={dataSessionKey}
                stateLocation={stateLocation}
                projectId={projectId}
            />
        </PageWrapper>
    );
};

export default TaskSavePage;
