import { Card, Flex, Spin } from 'antd';
import React from 'react';

import styles from './ListPage.module.scss';

function ListPage({ searchForm, actionBar, baseTable, loading = false, children, title, style }) {
    return (
        <Card className={styles.baseListPage} style={style}>
            <Spin spinning={loading}>
                <div className={styles.baseListPageList}>
                    <div>{searchForm}</div>
                    <Flex justify='space-between' align='center'>
                        <div className={styles.title}>{title}</div>
                        <div className={styles.actionBar}>{actionBar}</div>
                    </Flex>
                    <div className={styles.actionBar}>{baseTable}</div>
                </div>
                <div>{children}</div>
            </Spin>
        </Card>
    );
}

export default ListPage;