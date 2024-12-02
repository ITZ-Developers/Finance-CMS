import { translateKeys } from '@utils/intlHelper';
import { useIntl } from 'react-intl';

export default function useTranslate() {
    const intl = useIntl();
    return Object.assign(intl, { formatKeys: (message, keys = []) => translateKeys(intl, message, keys) });
}
