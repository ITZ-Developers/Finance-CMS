import React from 'react';

import { categoryKind } from '@constants';
import CategoryListPageCommon from '@components/common/page/category';
import { defineMessages, useIntl } from 'react-intl';

const message = defineMessages({
    home: 'Home',
    transactionCategory: 'Transaction Category',
});

const CategoryListPage = () => {
    const intl = useIntl();

    return (
        <CategoryListPageCommon
            routes={[{ breadcrumbName: intl.formatMessage(message.transactionCategory) }]}
            kind={categoryKind.news}
        />
    );
};

export default CategoryListPage;
