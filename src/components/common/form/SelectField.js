import React, { useRef } from 'react';

import { Form, Select } from 'antd';
import { isSafari, removeAccents } from '@utils';
import useFormField from '@hooks/useFormField';
import styles from './SelectField.module.scss';

function SelectField({
    loading,
    disabled,
    key,
    label = '',
    mode,
    name = '',
    options = [],
    optionValue = 'value',
    allowClear = true,
    showSearch = true,
    showArrow = true,
    onSelect,
    onChange,
    onDeselect,
    onSearch,
    onBlur,
    defaultValue,
    renderCustomOption,
    optionLabelProp,
    autoComplete,
    formItemProps,
    fieldProps,
    initialValue,
    notFoundContent,
    value,
    onClear,
    onFocus,
    onChangeOption,
    ...props
}) {
    const { placeholder, rules } = useFormField(props);
    const selectRef = useRef();

    const onFilterOption = (input, option) =>
        renderCustomOption
            ? (option?.labelText ?? '').toLowerCase().includes(input.toLowerCase())
            : removeAccents(option.label.toLowerCase()).indexOf(removeAccents(input.toLowerCase())) >= 0;

    return (
        <Form.Item initialValue={initialValue} key={key} {...formItemProps} label={label} name={name} rules={rules}>
            <Select
                onFocus={onFocus}
                {...fieldProps}
                ref={selectRef}
                className={isSafari ? styles.field : null}
                onDropdownVisibleChange={(open) => {
                    // remove blink cursor when user selected an option
                    if (!open) selectRef.current.blur();
                }}
                value={value}
                notFoundContent={notFoundContent}
                optionLabelProp={optionLabelProp}
                showSearch={showSearch}
                defaultValue={defaultValue}
                allowClear={allowClear}
                disabled={disabled}
                placeholder={placeholder}
                loading={loading}
                defaultActiveFirstOption={false}
                showArrow={showArrow}
                onSearch={onSearch}
                filterOption={onSearch ? false : onFilterOption}
                onChange={onChange}
                onSelect={onSelect}
                onDeselect={onDeselect}
                onBlur={onBlur}
                mode={mode}
                autoComplete={autoComplete}
                onClear={onClear}
                options={options?.slice(0, 10)?.map(
                    (option) => renderCustomOption?.(option.value, option.label, option) ?? option,
                )}
                {...props}
            />
        </Form.Item>
    );
}

export default SelectField;