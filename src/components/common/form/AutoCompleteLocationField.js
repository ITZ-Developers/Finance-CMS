import useFetch from '@hooks/useFetch';
import useFormField from '@hooks/useFormField';
import { Spin } from 'antd';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SelectField from './SelectField';

function AutoCompleteLocationField({
    label,
    name,
    placeholder,
    rules,
    required,
    fromItemProps,
    options,
    allowClear,
    fieldProps,
    apiConfig,
    mappingOptions,
    searchParams,
    optionsParams = {},
    maxOptions = 5,
    debounceTime = 600,
    onChange,
    onSelect,
}) {
    const { placeholder: _placeholder, rules: _rules } = useFormField({
        placeholder,
        rules,
        required,
    });
    const [fetching, setFetching] = useState(false);
    const [_options, setOptions] = useState([]);
    const { execute } = useFetch(apiConfig);
    const [initialOpts, setInitialOpts] = useState();

    const handleFetchOptions = useCallback(
        ({ searchText, onCompleted, onError }) => {
            execute({
                params: {
                    size: maxOptions,
                    page: 0,
                    ...optionsParams,
                    ...(searchParams ? searchParams(searchText) : {}),
                },
                onCompleted: (res) => {
                    onCompleted(res.data?.content?.map(mappingOptions));
                },
                onError,
            });
        },
        [maxOptions, searchParams, mappingOptions, optionsParams],
    );

    const handleOnSearch = useMemo(() => {
        const onCompleted = (options) => {
            setFetching(false);
            if (options) {
                setOptions(options);
            }
        };

        const onError = () => {
            setFetching(false);
        };

        const loadOptions = (searchText) => {
            if (!searchText || !mappingOptions) return;
            setOptions([]);
            setFetching(true);
            handleFetchOptions({ searchText, onCompleted, onError });
        };

        return debounce(loadOptions, debounceTime);
    }, [handleFetchOptions, mappingOptions, debounceTime]);

    const handleFocus = useCallback(() => {
        // fallback to initial options if options is empty
        if (_options?.length === 0) {
            setOptions(initialOpts);
        }
    }, [_options]);

    useEffect(() => {
        if (options?.length > 0) {
            setOptions(options);
        }
    }, [options]);

    useEffect(() => {
        // full initial options
        execute({
            params: {
                page: 0,
                size: maxOptions,
                ...searchParams(''),
            },
            onCompleted: (res) => {
                setInitialOpts(res.data?.content?.map(mappingOptions));
            },
        });
    }, []);

    return (
        <SelectField
            onSelect={onSelect}
            fieldProps={fieldProps}
            fromItemProps={fromItemProps}
            label={label}
            name={name}
            rules={_rules}
            showSearch
            allowClear={allowClear}
            options={_options?.slice(0, maxOptions)}
            filterOption={false}
            notFoundContent={fetching ? <Spin size="small" /> : undefined}
            onSearch={handleOnSearch}
            placeholder={_placeholder}
            onChange={onChange}
            onFocus={handleFocus}
            onClear={() => handleOnSearch('')}
        />
    );
}

export default AutoCompleteLocationField;
