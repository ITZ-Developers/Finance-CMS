import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import React, { useState } from 'react';
import BaseTable from '@components/common/table/BaseTable';

import { DEFAULT_TABLE_ITEM_SIZE, SettingTypes, isSystemSettingOptions } from '@constants';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import { defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import useAuth from '@hooks/useAuth';
import SelectField from '@components/common/form/SelectField';
import { Tabs } from 'antd';

const message = defineMessages({
    objectName: 'setting',
});
const SettingListPage = () => {
    const translate = useTranslate();
    const [activeTab, setActiveTab] = useState(localStorage.getItem('activeSettingTab') ?? SettingTypes.Money);
    const { isAdmin } = useAuth();
    const { data, mixinFuncs, queryFilter, loading } = useListBase({
        apiConfig: apiConfig.settings,
        options: {
            pageSize: DEFAULT_TABLE_ITEM_SIZE,
            objectName: translate.formatMessage(message.objectName),
        },
        override: (funcs) => {
            funcs.prepareGetListParams = (params) => {
                return {
                    isSystem: isSystemSettingOptions[0].value,
                    ...params,
                };
            };
            funcs.mappingData = (response) => {
                if (response.result === true) {
                    const setting = {};

                    response.data.content.forEach((item) => {
                        if (setting[item.groupName] == undefined) {
                            setting[item.groupName] = {};
                            setting[item.groupName].data = [];
                            setting[item.groupName].total = 0;
                        }

                        setting[item.groupName].total++;
                        setting[item.groupName].data.push(item);
                    });
                    if (Object.keys(setting).length > 0) {
                        localStorage.setItem('activeSettingTab', Object.keys(setting)[0]);
                        setActiveTab(Object.keys(setting)[0]);
                    }
                    return {
                        data: setting,
                        total: response.data.totalElements,
                    };
                }
            };
        },
    });
    const columns = [
        { title: translate.formatMessage(commonMessage.description), dataIndex: 'description' },
        {
            title: translate.formatMessage(commonMessage.settingValue),
            dataIndex: 'settingValue',
            render: (dataRow, record) => {
                if (record.groupName == 'Timezone') {
                    return (
                        <span>
                            {JSON.parse(dataRow).name} {JSON.parse(dataRow).offset}
                        </span>
                    );
                } else {
                    return <span>{dataRow}</span>;
                }
            },
        },
        mixinFuncs.renderActionColumn({ edit: (dataRow) => !!dataRow.isEditable }, { width: '130px' }),
    ];

    const searchFields = [
        {
            options: translate.formatKeys(isSystemSettingOptions, ['label']),
            key: 'isSystem',
            submitOnChanged: true,
            placeholder: 'System settings',
            component: (props) =>
                isAdmin && (
                    <div style={{ width: '250px' }}>
                        <SelectField {...props} />
                    </div>
                ),
        },
    ];

    const getTabsTranslatedLabel = (value) => {
        if (value == SettingTypes.Timezone) {
            return translate.formatMessage(commonMessage.timeZone);
        }
        if (value == SettingTypes.Money) {
            return translate.formatMessage(commonMessage.money);
        }
        if (value == SettingTypes.System) {
            return translate.formatMessage(commonMessage.system);
        }
    };

    return (
        <PageWrapper routes={[{ breadcrumbName: translate.formatMessage(commonMessage.listSetting) }]}>
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({
                    fields: searchFields,
                    hiddenAction: true,
                    initialValues: { isSystem: isSystemSettingOptions[0].value, ...queryFilter },
                })}
                baseTable={
                    <Tabs
                        style={{ marginTop: 20 }}
                        type="card"
                        onTabClick={(key) => {
                            setActiveTab(key);
                            localStorage.setItem('activeSettingTab', key);
                        }}
                        activeKey={activeTab}
                        items={Object.keys(data).map((item) => {
                            return {
                                label: getTabsTranslatedLabel(item),
                                key: item,
                                children: (
                                    <BaseTable
                                        columns={columns}
                                        dataSource={data[item].data}
                                        pagination={{
                                            pageSize: DEFAULT_TABLE_ITEM_SIZE,
                                            total: data[item].total,
                                        }}
                                        loading={loading}
                                    />
                                ),
                            };
                        })}
                    />
                }
            />
        </PageWrapper>
    );
};

export default SettingListPage;
