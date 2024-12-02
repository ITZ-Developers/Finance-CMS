import { useSelector } from 'react-redux';

import { selectActionLoading } from '@selectors/app';

const useActionLoading = (actionType) => {
    const loading = useSelector(selectActionLoading(actionType));

    return { loading };
};

export default useActionLoading;