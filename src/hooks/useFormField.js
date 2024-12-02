const useFormField = ({ requiredMsg, placeholder, required, rules, initialValue, fieldName, dataDetail }) => {
    // const { dataDetail } = useListBase();

    const getRequiredMsg = () => {
        // Use intl instead
        return requiredMsg || 'Required';
    };

    const getPlaceHolder = () => {
        if (placeholder) {
            return placeholder;
        } else if (required) {
            return '';
        }

        return '';
    };

    const getRules = () => {
        const rules = [];

        if (required) {
            // rules.push({
            //     required,
            //     message: null,
            // });
            rules.push({
                required,
                validator: (_, value) => {
                    const changeValue = typeof value === 'string' ? value.trim() : String(value).trim() ;
                    if (!value || changeValue === '') {
                        return Promise.reject(new Error(getRequiredMsg()));
                    }
                    return Promise.resolve();
                },
            });
        }

        return rules;
    };

    const getInitValue = () => {
        if (initialValue) {
            return initialValue;
        } else if (dataDetail && dataDetail[fieldName]) {
            return dataDetail[fieldName];
        } else return undefined;
    };

    const mergeRules = (rulesA, rulesB) => {
        // Nếu có lỗi "required", chỉ giữ các quy tắc "required" từ rulesA
        // if (rulesA.some(rule => rule.validator)) {
        //     return rulesA;
        // }
        // Nếu không có lỗi "required", kết hợp cả hai bộ quy tắc
        return [...rulesA, ...rulesB];
    };

    return {
        placeholder: getPlaceHolder(),
        rules: mergeRules(getRules(), rules || []),
    };
};

export default useFormField;
