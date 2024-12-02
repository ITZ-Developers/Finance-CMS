import { useSelector } from 'react-redux';

import { defaultLocale, locales } from '@constants';
import { selectAppLocale } from '@selectors/app';

const useLocale = () => {
    const locale = useSelector(selectAppLocale);

    return {
        locale: locales.includes(locale) ? locale : defaultLocale,
    };
};

export default useLocale;
