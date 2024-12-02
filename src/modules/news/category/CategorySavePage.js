import CategorySavePageCommon from '@components/common/page/category/CategorySavePageCommon';
import { categoryKind } from '@constants';
import React from 'react';
import { useIntl } from 'react-intl';
import routes from '../routes';
import { defineMessages } from 'react-intl';
import { useLocation } from 'react-router-dom';

const message = defineMessages({
    home: 'Home',
    newsCategory: 'Transaction Category',
});

const CategorySavePage = () => {
    const intl = useIntl();
    const location = useLocation();
    const search = location.search;

    return (
        <CategorySavePageCommon
            routes={[
                {
                    breadcrumbName: intl.formatMessage(message.newsCategory),
                    path: routes.newsCategoryListPage.path,
                },
            ]}
            getListUrl={routes.newsCategoryListPage.path + `${search}`}
            kind={categoryKind.news}
        />
    );
};

export default CategorySavePage;
