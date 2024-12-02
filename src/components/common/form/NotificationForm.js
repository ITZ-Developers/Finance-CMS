import { DEFAULT_FORMAT, DEFAULT_TABLE_ITEM_SIZE, UserTypes } from '@constants';
import apiConfig from '@constants/apiConfig';
import useAuth from '@hooks/useAuth';
import useFetch from '@hooks/useFetch';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import routes from '@routes';
import { IconBell, IconBellFilled, IconCheck, IconCircleCheck, IconCircleX, IconInfoCircle } from '@tabler/icons-react';
import HeadlessTippy from '@tippyjs/react/headless';
import {  convertStringToDateTime, convertDateTimeToString } from '@utils/dayHelper';
import { Badge, Button, Card, Modal, Skeleton } from 'antd';
import React, { useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { BaseTooltip } from './BaseTooltip';
import styles from './NotificationForm.module.scss';
import { IconBellRinging } from '@tabler/icons-react';
const messages = defineMessages({
    doneTaskDescription: 'Bạn đã hoàn thành task: ',
    studentNewTaskDescription: 'Bạn đã được giao task: ',
    cancelTaskDescription: 'Bạn đã bị huỷ task : ',
    leaderNewTaskDescription: 'Một task mới được tạo: ',
    leaderDoneTaskDescription: 'Thông báo xong task: ',
    deleteAllConfirm: 'Do you want to delete all notifications?',
});

export const NotificationForm = ({
    data,
    executeGetData,
    executeUpdateState,
    loading,
    unReadTotal,
    pageTotal,
    ...props
}) => {
    const [activeButtonAll, setActiveButtonAll] = useState(true);
    const [activeIcon, setActiveIcon] = useState(false);
    const translate = useTranslate();
    const [dataNotification, setDataNotification] = useState([]);
    const [isLoadMore, setIsLoadMore] = useState(false);
    let [countLoadMore, setCountLoadMore] = useState(1);
    const [hiddenItems, setHiddenItems] = useState([]);
    const [deleteAll, setDeleteAll] = useState(false);
    const [readAll, setReadAll] = useState(false);
    const [dataNotificationUnRead, setDataNotificationUnRead] = useState([]);
    const [hasNotification, setHasNotification] = useState(false);
    const navigate = useNavigate();
    const hostPath = window.location.host;
    const { profile } = useAuth();
    const { execute: executeReadAll } = useFetch(apiConfig.notification.readAll, {
        immediate: false,
    });
    const { execute: executeDeleteAll } = useFetch(apiConfig.notification.deleteAll, {
        immediate: false,
    });
    useEffect(() => {
        const interval = setInterval(() => {
            const hasNotificationLocalStr = JSON.parse(localStorage.getItem('hasNotification'));
            if (hasNotificationLocalStr && !hasNotification) {
                setHasNotification(true);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isLoadMore && data) {
            setDataNotification([...dataNotification, ...data]);
        } else {
            setDataNotification(data);
        }
    }, [data]);
    useEffect(() => {
        setDataNotificationUnRead(dataNotification?.filter((item) => item.state == 0));
    }, [dataNotification]);
    useEffect(() => {
        if (activeIcon) {
            if (activeButtonAll) {
                executeGetData({
                    params: {
                        size: DEFAULT_TABLE_ITEM_SIZE,
                    },
                });
            } else {
                executeGetData({
                    params: { state: 0, size: DEFAULT_TABLE_ITEM_SIZE },
                });
            }
            setReadAll(false);
            setDeleteAll(false);
            localStorage.setItem('hasNotification', false);
            setHasNotification(false);
        }
        setHiddenItems([]);
    }, [activeIcon]);

    useEffect(() => {
        if (activeIcon) {
            if (!activeButtonAll) {
                executeGetData({
                    params: { state: 0, size: DEFAULT_TABLE_ITEM_SIZE },
                });
            } else {
                executeGetData({
                    params: {
                        size: DEFAULT_TABLE_ITEM_SIZE,
                    },
                });
            }
        }
        setIsLoadMore(false);
        setCountLoadMore(1);
        setHiddenItems([]);
    }, [activeButtonAll]);
    const iconNotification = (kind, style, size) => {
        if (kind == 1 || kind == 5) {
            return <IconCircleCheck color="green" style={style} size={size} />;
        } else if (kind == 2 || kind == 6) {
            return <IconInfoCircle color="blue" style={style} size={size} />;
        } else if (kind == 3 || kind == 7) {
            return <IconCircleX color="red" style={style} size={size} />;
        } else if (kind == 4 || kind == 8) {
            return <IconBellRinging color="orange" style={style} size={size} />;
        }
    };
    const titleNotification = (item) => {
        // const kind = item?.kind;
        // const projectNameTitle = translate.formatMessage(commonMessage.project) + ` ${item?.projectName}: `;
        // const courseNameTitle = translate.formatMessage(commonMessage.course) + ` ${item?.courseName}: `;
        // const title = item?.projectName ? projectNameTitle : courseNameTitle;
        // if (kind == 1 || kind == 5) {
        //     return title + translate.formatMessage(commonMessage.doneTaskTitle);
        // } else if (kind == 2 || kind == 6) {
        //     return title + translate.formatMessage(commonMessage.newTaskTitle);
        // } else if (kind == 3 || kind == 7) {
        //     return title + translate.formatMessage(commonMessage.cancelTaskTitle);
        // } else if (kind == 4 || kind == 8) {
        //     return title + translate.formatMessage(commonMessage.notifyDoneTaskTitle);
        // }
        return 'Service';
    };
    const descriptionNotification = (item) => {
        const kind = item?.kind;
        const taskName = item?.taskName ? item?.taskName : item?.lectureName;
        return item?.message;
    };
    const timeNotification = (createdDate) => {
        const dateTime = convertStringToDateTime(createdDate, DEFAULT_FORMAT, DEFAULT_FORMAT).add(7, 'hour');
        const dateTimeString = convertDateTimeToString(dateTime, DEFAULT_FORMAT);
        return dateTimeString;
    };
    const handleOnClickChecked = (e, id) => {
        e.stopPropagation();
        executeUpdateState({
            data: { id },
        });

        if (hiddenItems?.length == dataNotificationUnRead?.length - 1) {
            setReadAll(true);
        }
        setHiddenItems([...hiddenItems, id]);
    };

    const handleLoadMore = () => {
        setIsLoadMore(true);
        if (!activeButtonAll) {
            executeGetData({
                params: { state: 0, page: countLoadMore, size: DEFAULT_TABLE_ITEM_SIZE },
            });
        } else {
            executeGetData({
                params: { page: countLoadMore, size: DEFAULT_TABLE_ITEM_SIZE },
            });
        }
        setCountLoadMore((countLoadMore += 1));
    };
    const handleReadAll = () => {
        executeReadAll();
        setReadAll(true);
    };
    const handleDeleteAll = () => {
        Modal.confirm({
            title: translate.formatMessage(messages.deleteAllConfirm),
            centered: true,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => {
                executeDeleteAll();
                setDeleteAll(true);
            },
        });
    };
    const handleClickItem = (item) => {
        const kind = item?.kind;
        executeUpdateState({
            data: { id: item?.id },
        });
        if (hiddenItems?.length == dataNotificationUnRead?.length - 1) {
            setReadAll(true);
        }
        setHiddenItems([...hiddenItems, item?.id]);
        // setActiveIcon(false);
        if (kind == 1 || kind == 2 || kind == 3 || kind == 4) {
            if (profile?.kind == UserTypes.STUDENT) {
                navigate(
                    routes.projectStudentTaskListPage.path +
                    `?projectId=${item?.projectId}&projectName=${item?.projectName}&developerId=${profile?.id}&active=true`,
                );
            } else if (profile?.kind == UserTypes.LEADER) {
                navigate(
                    routes.projectLeaderTaskListPage.path +
                    `?projectId=${item?.projectId}&projectName=${item?.projectName}&active=true`,
                );
            }
        } else if (kind == 5 || kind == 6 || kind == 7 || kind == 8) {
            if (profile?.kind == UserTypes.STUDENT) {
                navigate(
                    routes.courseStudentListPage.path +
                    `/task/${item?.courseId}?courseId=${item?.courseId}&courseName=${item?.courseName}`,
                );
            } else if (profile?.kind == UserTypes.LEADER) {
                navigate(
                    routes.courseLeaderListPage.path +
                    `/task/${item?.courseId}?courseId=${item?.courseId}&courseName=${item?.courseName}`,
                );
            }
        }
    };

    return (
        <HeadlessTippy
            interactive
            placement="bottom-end"
            trigger="click"
            onClickOutside={() => setActiveIcon(false)}
            visible={activeIcon}
            onShow={() => {
                setActiveIcon(true);
            }}
            onHide={() => {
                setActiveIcon(false);
            }}
            offset={[30, 12]}
            render={(attrs) => (
                <Card className={styles.wrapper}>
                    <div className={styles.content}>
                        <div className={styles.wrapperButton}>
                            <div>
                                <Button
                                    type={activeButtonAll ? 'primary' : 'default'}
                                    shape="round"
                                    onClick={() => {
                                        setActiveButtonAll(true);
                                    }}
                                    style={{ marginRight: '4px' }}
                                >
                                    {translate.formatMessage(commonMessage.all)}
                                </Button>
                                <Button
                                    type={!activeButtonAll ? 'primary' : 'default'}
                                    shape="round"
                                    onClick={() => {
                                        setActiveButtonAll(false);
                                    }}
                                >
                                    {translate.formatMessage(commonMessage.unRead)}
                                </Button>
                            </div>
                            <div>
                                <Button type="default" shape="round" style={{ marginRight: '4px' }} onClick={handleReadAll}>
                                    {translate.formatMessage(commonMessage.readAll)}
                                </Button>
                                <Button
                                    style={{ color: 'white', backgroundColor: 'red' }}
                                    type="default"
                                    shape="round"
                                    onClick={handleDeleteAll}
                                >
                                    {translate.formatMessage(commonMessage.deleteAll)}
                                </Button>
                            </div>
                        </div>
                        {loading ? (
                            <div>
                                <Skeleton active paragraph={{ rows: 2 }} />
                                <Skeleton active paragraph={{ rows: 2 }} />
                                <Skeleton active paragraph={{ rows: 2 }} />
                                <Skeleton active paragraph={{ rows: 2 }} />
                            </div>
                        ) : (
                            <div >
                                {dataNotification?.map((item) => {
                                    return (
                                        <div
                                            key={item.id}
                                            className={
                                                styles.notificationItem +
                                            ' ' +
                                            ((item?.state == 1 || hiddenItems.includes(item?.id) || readAll) &&
                                                styles.viewed)
                                            }
                                            style={{
                                                display:
                                                (hiddenItems.includes(item?.id) && !activeButtonAll) ||
                                                    deleteAll ||
                                                    (readAll && !activeButtonAll)
                                                    ? 'none'
                                                    : '',
                                            }}
                                            // onClick={() => handleClickItem(item)}
                                        >
                                            {/* {iconNotification(item?.kind, { marginRight: '16px' }, 36)} */}
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    whiteSpace: 'normal',
                                                    width: '410px',
                                                }}
                                            >
                                                <text style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: 700 }}>{titleNotification(item)}</span>
                                                    <span
                                                        style={{ fontWeight: 600, width: '350px', wordWrap: 'break-word' }}
                                                    >
                                                        {descriptionNotification(item)}
                                                    </span>
                                                </text>
                                                <span style={{ paddingTop: '4px' }}>
                                                    {/* {timeNotification(item?.createdDate)} */}
                                                </span>
                                            </div>
                                            {item?.state == 0 && !hiddenItems.includes(item?.id) && !readAll && (
                                                <BaseTooltip title={translate.formatMessage(commonMessage.markAsRead)}>
                                                    <Button
                                                        type="link"
                                                        style={{ paddingRight: '10px' }}
                                                        onClick={(e) => handleOnClickChecked(e, item?.id)}
                                                    >
                                                        <IconCheck color="#2b6fab" />
                                                    </Button>
                                                </BaseTooltip>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {pageTotal > 0 &&
                        countLoadMore != pageTotal &&
                        !deleteAll &&
                        !(readAll && !activeButtonAll) &&
                        !loading &&
                        (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
                                <Button onClick={handleLoadMore}>
                                    {translate.formatMessage(commonMessage.loadMore)}
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>
            )}
            {...props}
        >
            <div
                style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}
                onClick={() => {
                    activeIcon ? setActiveIcon(false) : setActiveIcon(true);
                }}
            >
                <Badge dot={(unReadTotal > 0 && !readAll && !deleteAll && !loading) || hasNotification}>
                    {activeIcon ? <IconBellFilled /> : <IconBell />}
                </Badge>
            </div>
        </HeadlessTippy>
    );
};
