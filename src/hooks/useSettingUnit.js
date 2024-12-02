import { DATE_FORMAT_BASIC, DATE_FORMAT_BASIC_FIX, DEFAULT_FORMAT_BASIC, DEFAULT_FORMAT_BASIC_FIX } from '@constants';
import { settingKeyName } from '@constants/masterData';
import { settingSystemSelector } from '@selectors/app';
import React from 'react';
import { useSelector } from 'react-redux';
const useSettingUnit = () => {
    const settingSystem = useSelector(settingSystemSelector);
    const moneyUnit = settingSystem?.find((item) => item?.keyName === settingKeyName.MONEY_UNIT);
    const dateUnit = settingSystem?.find((item) => item?.keyName === settingKeyName.DATE_UNIT);
    const dateTimeUnit = settingSystem?.find((item) => item?.keyName === settingKeyName.DATE_TIME_UNIT);
    const decimalSeparator = settingSystem?.find((item) => item?.keyName === settingKeyName.DECIMAL_SEPARATOR);
    const groupSeparator = settingSystem?.find((item) => item?.keyName === settingKeyName.GROUP_SEPARATOR);

    // const dateUnitFix = dateUnit?.valueData == DATE_FORMAT_BASIC ? DATE_FORMAT_BASIC_FIX : dateUnit?.valueDate;
    // const dateTimeUnitFix = dateTimeUnit?.valueData == DEFAULT_FORMAT_BASIC ?  DEFAULT_FORMAT_BASIC_FIX : dateTimeUnit?.valueData;

    return {
        moneyUnit: moneyUnit?.valueData,
        dateUnit: DATE_FORMAT_BASIC_FIX,
        dateTimeUnit: DEFAULT_FORMAT_BASIC_FIX,
        decimalSeparator: decimalSeparator?.valueData,
        groupSeparator: groupSeparator?.valueData,
    };
};

export default useSettingUnit;
