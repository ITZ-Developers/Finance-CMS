import React, { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import BaseTable from '@components/common/table/BaseTable';
import { DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import useTranslate from '@hooks/useTranslate';
import { Button, Avatar, Card, Col, Switch, Modal } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import EditGenralModal from './EditGenralModal';
import useDisclosure from '@hooks/useDisclosure';
import useFetch from '@hooks/useFetch';
import { UserOutlined } from '@ant-design/icons';
import { AppConstants } from '@constants';
import SliderModal from './SliderModal';
import useNotification from '@hooks/useNotification';
import IntroduceModal from './IntroduceModal';
import ColumnGroup from 'antd/es/table/ColumnGroup';
import AvatarField from '@components/common/form/AvatarField';
import { dataTypeSetting, settingGroups, settingKeyName } from '@constants/masterData';
import { actions } from '@store/actions/app';
import { useDispatch } from 'react-redux';
import RichTextField from '@components/common/form/RichTextField';
import { commonMessage } from '@locales/intl';
import styles from './GeneralSetting.module.scss';
import routes from '@routes';

const messages = defineMessages({
    objectName: 'Cài đặt chung',
    createNew: '+',
    deleteSuccess: 'Xoá slider thành công',
    slider: 'Slider',
    revenue: 'Lợi nhuận chia sẻ',
    setting: 'setting',
    updateSuccess: 'Cập nhật {objectName} thành công',
});
const GeneralSettingPage = ({ groupName }) => {
    const translate = useTranslate();
    const intl = useIntl();
    const notification = useNotification();
    const [sliderData, setSliderData] = useState({});
    const [revenueData, setRevenueData] = useState({});
    const [introduceData, setIntroduceData] = useState({});
    const [openedGeneralModal, handlersGeneralModal] = useDisclosure(false);
    const [openedIntroduceModal, handlersIntroduceModal] = useDisclosure(false);
    const [openedSliderModal, handlersSliderModal] = useDisclosure(false);
    const [openedRichTextModal, handlersRichTextModal] = useDisclosure(false);
    const [detail, setDetail] = useState();
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingRevenue, setIsEditingRevenue] = useState(false);
    const [parentData, setParentData] = useState({});
    const dispatch = useDispatch();
    const [switchValue, setSwitchValue] = useState(false);
    const { data, mixinFuncs, queryFilter, loading, pagination, changePagination } = useListBase({
        apiConfig: apiConfig.settings,
        options: {
            pageSize: DEFAULT_TABLE_ITEM_SIZE,
            objectName: translate.formatMessage(messages.objectName),
        },
        override: (funcs) => {
            funcs.mappingData = (response) => {
                if (response.result === true) {
                    return {
                        data: response.data.content.filter((item) => {
                            if (item.valueData) {
                                if (item?.keyName === 'slider') {
                                    const sliderDataParseJson = JSON.parse(item.valueData);
                                    const updatedSliderData = sliderDataParseJson?.map((obj, index) => ({
                                        ...obj,
                                        isSlider: true,
                                        index,
                                    }));
                                    setSliderData(updatedSliderData);
                                    setParentData(item);
                                    return false;
                                }

                                if (item?.keyName === 'introduce') {
                                    setIntroduceData(JSON.parse(item.valueData));
                                }

                                return true;
                            }
                        }),
                        total: response.data.totalElements,
                    };
                }
            };
            funcs.getList = () => {
                const params = mixinFuncs.prepareGetListParams(queryFilter);
                mixinFuncs.handleFetchList({ ...params, groupName });
            };
            funcs.additionalActionColumnButtons = () => ({
                booleanSetting: (item) => {
                    const handleChangeSwitch = (checked) => {
                        executeUpdate({
                            data: {
                                id: item.id,
                                isSystem: item.isSystem,
                                status: item.status,
                                valueData: checked,
                            },
                            onCompleted: (response) => {
                                if (response.result === true) {
                                    setSwitchValue(checked.toString());
                                    notification({
                                        message: intl.formatMessage(messages.updateSuccess, {
                                            objectName: translate.formatMessage(messages.setting),
                                        }),
                                    });
                                    executeLoading();
                                    executeGetDataSetting({
                                        onCompleted: (response) => {
                                            const dataSetting = response?.data;
                                            dispatch(actions.settingSystem(dataSetting));
                                        },
                                    });
                                }
                            },
                            onError: (err) => { },
                        });
                    };
                    if (item?.dataType == dataTypeSetting.BOOLEAN) {
                        setSwitchValue(item.valueData);
                        return <Switch onChange={handleChangeSwitch} checked={switchValue === 'true'} size={'small'} />;
                    }
                },
                editSetting: (item) => {
                    if (item?.dataType != dataTypeSetting.BOOLEAN)
                        return (
                            <Button
                                type="link"
                                style={{ padding: 0 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDetail(item);
                                    setIsEditingRevenue(false);
                                    handlersGeneralModal.open();
                                    // if (item?.isSlider) {
                                    //     setIsEditing(true);
                                    //     handlersSliderModal.open();
                                    // } else if (item?.keyName === 'introduce') {
                                    //     handlersIntroduceModal.open();
                                    // } else if (item?.groupName === settingGroups.REVENUE) {
                                    //     setIsEditingRevenue(true);
                                    //     handlersGeneralModal.open();
                                    // } else {
                                    //     setIsEditingRevenue(false);
                                    //     handlersGeneralModal.open();
                                    // }
                                }}
                            >
                                <EditOutlined />
                            </Button>
                        );
                },
                delete: (item) => (
                    <Button
                        type="link"
                        style={{ padding: 0 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteSlider(item);
                        }}
                    >
                        <DeleteOutlined />
                    </Button>
                ),
            });
        },
    });

    const deleteSlider = (item) => {
        const updateSliderData = sliderData.filter((obj) => obj.index !== item?.index);
        executeUpdate({
            data: {
                id: parentData.id,
                isSystem: 0,
                status: parentData.status,
                valueData: JSON.stringify(updateSliderData),
            },
            onCompleted: (response) => {
                if (response.result === true) {
                    notification({
                        message: intl.formatMessage(messages.deleteSuccess),
                    });
                    executeLoading();
                    mixinFuncs.getList();
                }
            },
            onError: (err) => { },
        });
    };
    const columnPage = [
        {
            title: <FormattedMessage defaultMessage="Tên" />,
            dataIndex: 'keyName',
            width: 200,
        },
        {
            title: <FormattedMessage defaultMessage="Giá trị" />,
            dataIndex: 'valueData',
            width: 500,
            render: (valueData, record) => {
                if (record?.keyName === 'introduce') {
                    const valueDataParseJson = JSON.parse(valueData);
                    return (
                        <div>
                            <span style={{ fontWeight: 600 }}>{valueDataParseJson?.title}</span>
                            <p>{valueDataParseJson?.message}</p>
                        </div>
                    );
                } else {
                    return <div>{valueData}</div>;
                }
            },
        },
        mixinFuncs.renderActionColumn({ editSetting: mixinFuncs.hasPermission([apiConfig.settings.update?.baseURL]), delete: false }, { width: '100px' }),
    ];

    const columnRevenue = [
        {
            title: <FormattedMessage defaultMessage="Tên" />,
            dataIndex: 'keyName',
            width: 200,
        },
        {
            title: <FormattedMessage defaultMessage="Giá trị" />,
            dataIndex: 'valueData',
            width: 500,
            align: 'center',
            render: (valueData, record) => {
                if (valueData > 0) {
                    return <div>{valueData} %</div>;
                } else return <div>{valueData}</div>;
            },
        },
        mixinFuncs.renderActionColumn({ editSetting: mixinFuncs.hasPermission([apiConfig.settings.update?.baseURL]), delete: false }, { width: '100px' }),
    ];

    const columnGeneral = [
        {
            title: <FormattedMessage defaultMessage="Tên" />,
            dataIndex: 'keyName',
            width: 200,
        },
        {
            title: <FormattedMessage defaultMessage="Giá trị" />,
            dataIndex: 'valueData',
            width: 500,
            align: 'center',
            render: (valueData, record) => {
                if (valueData > 0) {
                    return (
                        <div>
                            {valueData}{' '}
                            {localStorage.getItem(routes.settingsPage.keyActiveTab) == settingGroups.REVENUE && '%'}
                        </div>
                    );
                }
                if (record.dataType == dataTypeSetting.RICHTEXT) {
                    const htmlContent = { __html: valueData };
                    return (
                        <div>
                            <span
                                className={styles.customDiv}
                                onClick={() => {
                                    handlersRichTextModal.open();
                                }}
                            >
                                {translate.formatMessage(commonMessage.content)}
                            </span>
                            <Modal
                                open={openedRichTextModal}
                                footer={null}
                                onCancel={() => {
                                    handlersRichTextModal.close();
                                }}
                            >
                                <div dangerouslySetInnerHTML={htmlContent} />
                            </Modal>
                        </div>
                    );
                } else return <div>{valueData}</div>;
            },
        },
        mixinFuncs.renderActionColumn(
            {
                booleanSetting: mixinFuncs.hasPermission([apiConfig.settings.update?.baseURL]),
                editSetting: mixinFuncs.hasPermission([apiConfig.settings.update?.baseURL]),
                delete: false,
            },
            { width: '100px' },
        ),
    ];

    const columnsSlider = [
        {
            title: '#',
            dataIndex: 'imageUrl',
            align: 'center',
            width: '100px',
            render: (imageUrl) => (
                <AvatarField
                    style={{ width: '100%', height: '60px' }}
                    size="large"
                    shape="square"
                    icon={<UserOutlined />}
                    src={imageUrl ? `${AppConstants.contentRootUrl}${imageUrl}` : null}
                />
            ),
        },
        {
            title: <FormattedMessage defaultMessage="Tiêu đề" />,
            dataIndex: 'title',
            width: '400px',
        },

        mixinFuncs.renderActionColumn(
            { editSetting: mixinFuncs.hasPermission([apiConfig.settings.update?.baseURL]), delete: true },
            { width: '60px' },
        ),
    ];

    const columnTraining = [
        {
            title: <FormattedMessage defaultMessage="Tên" />,
            dataIndex: 'keyName',
            width: 200,
        },
        {
            title: <FormattedMessage defaultMessage="Giá trị" />,
            dataIndex: 'valueData',
            width: 500,
            align: 'center',
            render: (valueData, record) => {
                if (record.keyName == settingKeyName.NUMBER_OF_TRAINING_PROJECT) {
                    if (valueData > 0) {
                        return <div>{valueData} </div>;
                    } else return <div>{valueData}</div>;
                }
                if (valueData > 0) {
                    return <div>{valueData} %</div>;
                } else return <div>{valueData}</div>;
            },
        },
        mixinFuncs.renderActionColumn({ editSetting: mixinFuncs.hasPermission([apiConfig.settings.update?.baseURL]), delete: false }, { width: '100px' }),
    ];

    const { execute: executeUpdate } = useFetch(apiConfig.settings.update, { immediate: false });
    const { execute: executeGetDataSetting } = useFetch(apiConfig.settings.settings, {
        immediate: false,
    });
    const {
        data: listSetting,
        loading: dataLoading,
        execute: executeLoading,
    } = useFetch(apiConfig.settings.getList, {
        immediate: false,
        params: { groupName: groupName },
        mappingData: (response) => {
            if (response.result === true) {
                return {
                    data: response.data.content.filter((item) => {
                        if (item.keyName === 'slider') {
                            setSliderData(JSON.parse(item.valueData));
                            return false;
                        }
                        return true;
                    }),
                };
            }
        },
    });

    const renderColumn = () => {
        if (groupName == settingGroups.GENERAL) {
            return columnGeneral;
        } else if (groupName == settingGroups.PAGE) {
            return columnPage;
        } else if (groupName == settingGroups.REVENUE) {
            return columnRevenue;
        } else if (groupName == settingGroups.TRAINING) {
            return columnTraining;
        }
    };

    return (
        <div>
            <Card>
                <BaseTable
                    onChange={mixinFuncs.changePagination}
                    columns={renderColumn()}
                    dataSource={listSetting ? listSetting?.data : data}
                    loading={loading || dataLoading}
                    pagination={pagination}
                />
            </Card>
            {groupName === settingGroups.PAGE && (
                <Card
                    style={{
                        marginTop: '16px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px',
                        }}
                    >
                        <span style={{ fontSize: '20px' }}>{intl.formatMessage(messages.slider)}</span>
                        <Button
                            type="primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(false);
                                handlersSliderModal.open();
                            }}
                        >
                            {intl.formatMessage(messages.createNew)}
                        </Button>
                    </div>
                    <BaseTable
                        onChange={mixinFuncs.changePagination}
                        columns={columnsSlider}
                        dataSource={sliderData.length > 0 ? sliderData : []}
                        loading={loading}
                        pagination={pagination}
                    />
                </Card>
            )}
            {detail && (
                <EditGenralModal
                    open={openedGeneralModal}
                    onCancel={() => handlersGeneralModal.close()}
                    data={detail || {}}
                    executeUpdate={executeUpdate}
                    executeLoading={executeLoading}
                    isEditingRevenue={isEditingRevenue}
                    width={800}
                    executeGetDataSetting={executeGetDataSetting}
                />
            )}
            <IntroduceModal
                open={openedIntroduceModal}
                onCancel={() => handlersIntroduceModal.close()}
                introduceData={introduceData}
                data={detail || {}}
                executeUpdate={executeUpdate}
                executeLoading={executeLoading}
                width={800}
            />
            <SliderModal
                open={openedSliderModal}
                onCancel={() => handlersSliderModal.close()}
                data={detail || {}}
                reload={mixinFuncs.getList}
                sliderData={sliderData}
                parentData={parentData}
                executeUpdate={executeUpdate}
                executeLoading={executeLoading}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                width={800}
            />
        </div>
    );
};

export default GeneralSettingPage;
