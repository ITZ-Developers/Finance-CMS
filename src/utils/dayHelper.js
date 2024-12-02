import { DATE_FORMAT_DISPLAY, DATE_FORMAT_VALUE } from '@constants';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import moment from 'moment';
dayjs.extend(weekOfYear);

export const currentWeek = dayjs().week();
export const lastWeek = dayjs().week(currentWeek - 1);

export const getWeek = (date) => {
    return dayjs(date).week();
};

export const getWeekStart = (date) => {
    return dayjs(date).startOf('week');
};

export const getLastWeek = (date) => {
    return dayjs(date).week(getWeek(date) - 1);
};

export const getLastWeekStart = (date) => {
    return dayjs(date).startOf('week').subtract(1, 'week');
};

export const getLastWeekEnd = (date) => {
    return dayjs(date).endOf('week').subtract(1, 'week');
};

export const convertStringToDateTime = (
    strFormDateTime,
    fromFormat = DATE_FORMAT_VALUE,
    toFormat = DATE_FORMAT_DISPLAY,
) => {
    try {
        if (strFormDateTime) {
            const datetime = moment(strFormDateTime, fromFormat);
            return moment(datetime.format(toFormat), toFormat);
        }
        return null;
    } catch (err) {
        return null;
    }
};

export const convertDateTimeToString = (datetime, stringFormat = DATE_FORMAT_VALUE) => {
    try {
        if (datetime) {
            return datetime.format(stringFormat);
        }
        return null;
    } catch (err) {
        return null;
    }
};