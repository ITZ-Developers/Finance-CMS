import PageWrapper from '@components/common/layout/PageWrapper';
import { categoryKind } from '@constants';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';
import useSaveBase from '@hooks/useSaveBase';
import React, { useEffect } from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import VillageForm from './VillageForm';
import routes from '../routes';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';

const message = defineMessages({
    objectName: 'Village',
});

const VillageSavePage = () => {
    const translate = useTranslate();
    const queryParameters = new URLSearchParams(window.location.search);
    const provinceId = queryParameters.get('provinceId');
    const districtId = queryParameters.get('districtId');
    const provinceName = queryParameters.get('provinceName');
    const districtName = queryParameters.get('districtName');

    const { detail, mixinFuncs, loading, setIsChangedFormValues, isEditing, title } = useSaveBase({
        apiConfig: {
            getById: apiConfig.nation.getById,
            create: apiConfig.nation.create,
            update: apiConfig.nation.update,
        },
        options: {
            getListUrl: routes.villagetListPage.path,
            objectName: translate.formatMessage(commonMessage.Village),
        },
        override: (funcs) => {
            funcs.prepareUpdateData = (data) => {
                return {
                    ...data,
                    id: detail.id,
                };
            };
            funcs.prepareCreateData = (data) => {
                return {
                    ...data,
                };
            };
        },
    });

    return (
        <PageWrapper
            loading={loading}
            routes={[
                { breadcrumbName: translate.formatMessage(commonMessage.Province), path: routes.nationListPage.path },
                {
                    breadcrumbName: `${provinceName}`,
                    path: routes.districtListPage.path + `?provinceId=${provinceId}&provinceName=${provinceName}`,
                },
                {
                    breadcrumbName: `${districtName}`,
                    path:
                        routes.villagetListPage.path +
                        `?provinceId=${provinceId}&districtId=${districtId}&provinceName=${provinceName}&districtName=${districtName}`,
                },
                { breadcrumbName: title },
            ]}
            title={title}
        >
            <VillageForm
                setIsChangedFormValues={setIsChangedFormValues}
                dataDetail={detail ? detail : {}}
                formId={mixinFuncs.getFormId()}
                isEditing={isEditing}
                actions={mixinFuncs.renderActions()}
                onSubmit={mixinFuncs.onSave}
            />
        </PageWrapper>
    );
};

export default VillageSavePage;
