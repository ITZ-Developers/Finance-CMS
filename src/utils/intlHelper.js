export const translateKeys = (intl, message, key = []) => {
    const result = [];
    message.forEach((item) => {
        const newItem = { ...item };
        if (typeof key === 'string') {
            newItem[key] = intl.formatMessage(item[key]);
        } else {
            key.forEach((k) => {
                newItem[k] = intl.formatMessage(item[k]);
            });
        }

        result.push(newItem);
    });
    return result;
};
