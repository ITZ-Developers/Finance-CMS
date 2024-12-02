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
import { showErrorMessage } from '@services/notifyService';
import KeyGroupForm from './KeyGroupForm';

const message = defineMessages({
    objectName: 'Group Key Information',
});

const KeyGroupSavePage = ({ pageOptions }) => {
    const translate = useTranslate();
    const { id } = useParams();
    const location = useLocation();
    const search = location.search;
    const queryParameters = new URLSearchParams(window.location.search);
    const serviceId = queryParameters.get('serviceId');
    const { detail, mixinFuncs, loading, onSave, setIsChangedFormValues, isEditing, title, dataSessionKey } = useSaveBase({
        apiConfig: {
            getById: apiConfig.keyGroup.getById,
            create: apiConfig.keyGroup.create,
            update: apiConfig.keyGroup.update,
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
            <KeyGroupForm
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

export default KeyGroupSavePage;
