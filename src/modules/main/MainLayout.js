import React, { useState } from 'react';
import { Layout } from 'antd';

import NavSider from './NavSider';
import AppHeader from './AppHeader';

import styles from './MainLayout.module.scss';
import { brandName } from '@constants';
import { defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';

const { Content, Footer } = Layout;

const SIDEBAR_WIDTH_EXPAND = 320;

const message = defineMessages({
    copyRight: ' <strong>{brandName} </strong>- © Copyright {year}. All Rights Reserved.',
});

const MainLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const translate = useTranslate();
    const toggleCollapsed = () => setCollapsed((prev) => !prev);

    return (
        <Layout hasSider>
            <NavSider collapsed={collapsed} onCollapse={toggleCollapsed} width={SIDEBAR_WIDTH_EXPAND} />
            <Layout>
                <AppHeader collapsed={collapsed} onCollapse={toggleCollapsed} />
                <Content className={styles.appContent}>
                    <div className={styles.wrapper}>{children}</div>
                    <Footer className={styles.appFooter}>
                        {translate.formatMessage(message.copyRight, {
                            strong: (chunk) => <strong>{chunk}</strong>,
                            brandName,
                            year: new Date().getFullYear(),
                        })}
                    </Footer>
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
