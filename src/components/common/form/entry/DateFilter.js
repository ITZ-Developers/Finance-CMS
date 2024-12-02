import DatePickerField from '@components/common/form/DatePickerField';
import DateRangePickerField from '@components/common/form/DateRangePickerField';
import { DatePicker, Input } from 'antd';
import useFormInstance from 'antd/es/form/hooks/useFormInstance';
import dayjs from 'dayjs';
import React, { useEffect, useLayoutEffect, useMemo } from 'react';
import InputTextField from '../InputTextField';

const { RangePicker } = DatePicker;

function DateFilter({ compareType, name, ...props }) {
    const form = useFormInstance();

    const renderPicker = useMemo(() => {
        if (compareType === 'between') {
            return (
                <DateRangePickerField
                    name={name}
                    fieldProps={{
                        style: {
                            width: 322,
                        },
                    }}
                />
            );
        } else if (compareType === 'date') {
            return (
                <DatePickerField
                    name={name}
                    fieldProps={{
                        style: {
                            width: 322,
                        },
                    }}
                />
            );
        } else {
            return <InputTextField name={name} formItemProps={{ hidden: true }} />;
        }
    }, [ compareType ]);

    useEffect(() => {
        if (compareType === 'between' || compareType === 'date') {
            form.setFieldValue(name, undefined);
        }else{
            form.setFieldValue(name, compareType);
        }
    }, [ compareType ]);

    return <>{renderPicker}</>;
}

const FilterComponent = {
    date: DatePicker,
    dateRange: RangePicker,
};

const today = `${dayjs().startOf('day').toISOString()} - ${dayjs().toISOString()}`;
const yesterday = `${dayjs().subtract(1, 'day').startOf('day').toISOString()} - ${dayjs().toISOString()}`;
const thisWeek = `${dayjs().startOf('week').toISOString()} - ${dayjs().toISOString()}`;
const lastWeek = `${dayjs().subtract(1, 'week').toISOString()} - ${dayjs().toISOString()}`;

export default DateFilter;
