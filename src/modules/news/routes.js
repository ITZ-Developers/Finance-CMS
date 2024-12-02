import apiConfig from '@constants/apiConfig';
import NewsListPage from '.';
import CategoryListPage from './category';
import CategorySavePage from './category/CategorySavePage';
import NewsSavePage from './NewsSavePage';

export default {
    newsListPage: {
        path: '/news',
        title: 'News',
        auth: true,
        component: NewsListPage,
        permission: [apiConfig.news.getList.baseURL],
    },
    newsSavePage: {
        path: '/news/:id',
        title: 'News Save Page',
        auth: true,
        component: NewsSavePage,
        separateCheck: true,
        permission: [apiConfig.news.create.baseURL, apiConfig.news.update.baseURL],
    },
    newsCategoryListPage: {
        path: '/transaction-category',
        title: 'Transaction Category',
        auth: true,
        component: CategoryListPage,
    },
    newsCategorySavePage: {
        path: '/transaction-category/:id',
        title: 'Transaction Category Save Page',
        auth: true,
        component: CategorySavePage,
    },
};
