import PageWrapper from '@components/common/layout/PageWrapper';
import { GROUP_KIND_ADMIN, STATUS_ACTIVE, UserTypes } from '@constants';
import apiConfig from '@constants/apiConfig';
import useSaveBase from '@hooks/useSaveBase';
import React from 'react';
import { useParams } from 'react-router-dom';
import { defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import useFetch from '@hooks/useFetch';
import AddressForm from './AddressForm';

const message = defineMessages({
    objectName: 'address',
});

const AddressSavePage = ({ pageOptions }) => {
    const translate = useTranslate();
    const { id } = useParams();
    const queryParameters = new URLSearchParams(window.location.search);
    const userId = queryParameters.get('userId');
    const { detail, mixinFuncs, loading, onSave, setIsChangedFormValues, isEditing, title } = useSaveBase({
        apiConfig: {
            getById: apiConfig.address.getById,
            create: apiConfig.address.create,
            update: apiConfig.address.update,
        },
        options: {
            getListUrl: pageOptions.listPageUrl +`?userId=${userId}`,
            objectName: translate.formatMessage(pageOptions.objectName),
        },
        override: (funcs) => {
            funcs.prepareUpdateData = (data) => {
                return {
                    status: STATUS_ACTIVE,
                    wardId: data.wardInfo.id,
                    provinceId: data.provinceInfo.id,
                    districtId: data.districtInfo.id,
                    id: id,
                    name: data.name,
                    phone: data.phone,
                    address: data.address,
                };
            };
            // funcs.prepareCreateData = (data) => {
            //     return {
            //         ...data,
            //     };
            // };
        },
    });

    return (
        <PageWrapper loading={loading} routes={pageOptions.renderBreadcrumbs(commonMessage, translate, title,{ userId:userId })}>
            <AddressForm
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

export default AddressSavePage;
