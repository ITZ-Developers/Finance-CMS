import PageWrapper from '@components/common/layout/PageWrapper';
import { GROUP_KIND_ADMIN, STATUS_ACTIVE, UserTypes } from '@constants';
import apiConfig from '@constants/apiConfig';
import useSaveBase from '@hooks/useSaveBase';
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import useFetch from '@hooks/useFetch';
import ServiceScheduleForm from './ServiceScheduleForm';
import { showErrorMessage } from '@services/notifyService';

const message = defineMessages({
    objectName: 'Service Schedule',
});

const ServiceScheduleSavePage = ({ pageOptions }) => {
    const translate = useTranslate();
    const { id } = useParams();
    const location = useLocation();
    const search = location.search;
    const queryParameters = new URLSearchParams(window.location.search);
    const serviceId = queryParameters.get('serviceId');
    const { detail, mixinFuncs, loading, onSave, setIsChangedFormValues, isEditing, title } = useSaveBase({
        apiConfig: {
            getById: apiConfig.serviceSchedule.getById,
            create: apiConfig.serviceSchedule.create,
            update: apiConfig.serviceSchedule.update,
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
                    serviceId: serviceId,
                };
            };
            funcs.prepareCreateData = (data) => {
                return {
                    ...data,
                    serviceId: serviceId,
                };
            };

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
            <ServiceScheduleForm
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

export default ServiceScheduleSavePage;
