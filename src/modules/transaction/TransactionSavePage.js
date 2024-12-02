import PageWrapper from '@components/common/layout/PageWrapper';
import apiConfig from '@constants/apiConfig';
import useSaveBase from '@hooks/useSaveBase';
import React, { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import DepartmentForm from './TransactionForm';
import { TAG_KIND_TRANSACTION } from '@constants';

const message = defineMessages({
    objectName: 'UserAdmin',
});

const TransactionSavePage = ({ pageOptions }) => {
    const translate = useTranslate();
    const { id } = useParams();
    // const {}
    const location = useLocation();
    const search = useMemo(() => {
        return location.search;
    }, []);
    const { detail, mixinFuncs, loading, onSave, setIsChangedFormValues, isEditing, title, dataSessionKey } = useSaveBase({
        apiConfig: {
            getById: apiConfig.transaction.getById,
            create: apiConfig.transaction.create,
            update: apiConfig.transaction.update,
            tag: apiConfig.tag,
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
                    tags: [
                        {
                            kind: TAG_KIND_TRANSACTION,
                            name: data.name, // Assuming the transaction has a 'name' field
                        },
                    ],
                };
            };
            funcs.prepareCreateData = (data) => {
                return {
                    ...data,
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
        <PageWrapper loading={loading} routes={pageOptions.renderBreadcrumbs(commonMessage, translate, title, search)}>
            <DepartmentForm
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

export default TransactionSavePage;
