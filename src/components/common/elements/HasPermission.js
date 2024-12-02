import useValidatePermission from '@hooks/useValidatePermission';
import { validatePermission } from '@utils';

function HasPermission({
    children,
    requiredPermissions,
    requiredKind,
    excludeKind = [],
    path,
    onValidate = validatePermission,
    fallback = null,
    separate = false,
}) {
    const validate = useValidatePermission();
    return validate(requiredPermissions, requiredKind, excludeKind, onValidate, path, separate) ? children : fallback;
}

export default HasPermission;
