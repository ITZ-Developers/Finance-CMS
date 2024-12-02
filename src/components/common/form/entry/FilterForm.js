import { Button, Col, Dropdown, Form, Input, Row, Space } from 'antd';
import { useForm } from 'antd/es/form/Form';
import React, { useEffect, useMemo, useState } from 'react';

import { SearchOutlined, CaretDownOutlined } from '@ant-design/icons';
import FilterItem from './FilterItem';

import styles from './FilterForm.module.scss';

function FilterForm({ onApplyFilter, onResetFilter, onAddFilter, filters = [], ...props }) {
    const [ form ] = useForm();
    const [ activeFilters, setActiveFilters ] = useState({});

    const hasFilter = !!Object.keys(activeFilters).length;

    function onClearFilterItem(name) {
        if (!activeFilters[name]) return;

        const newFilters = { ...activeFilters };
        delete newFilters[name];
        setActiveFilters(newFilters);
        form.setFieldValue(name, undefined);
    }

    const selectFilterDropdownItem = useMemo(() => {
        return filters.map((filter) => ({
            key: filter.name,
            label: (
                <div
                    onClick={() => {
                        if (!activeFilters[filter.name]) {
                            setActiveFilters({
                                ...activeFilters,
                                [filter.name]: filter,
                            });

                            onAddFilter?.(filter);
                        }
                    }}
                >
                    {filter.label}
                </div>
            ),
        }));
    }, [ filters, activeFilters ]);

    const renderFilters = useMemo(() => {
        return Object.values(activeFilters).map((filter) => (
            <Row key={filter.name}>
                <FilterItem {...filter} onClearFilter={() => onClearFilterItem(filter.name)} />
            </Row>
        ));
    }, [ activeFilters ]);

    function renderApplyFilter() {
        if (!hasFilter) return null;

        return (
            <>
                <Col style={{ marginRight: 10, marginLeft: 10 }}>
                    <Button
                        onClick={() => {
                            setActiveFilters({});
                            onResetFilter?.();
                        }}
                    >
                        Remove all filters
                    </Button>
                </Col>
                <Col>
                    <Button htmlType="submit">Apply filters</Button>
                </Col>
            </>
        );
    }

    useEffect(() => {
        if (!hasFilter) {
            onResetFilter?.();
            form.resetFields();
        }
    }, [ activeFilters ]);

    function onFinish(values) {
        const urlSearchParams = new URLSearchParams();
        Object.entries(values).forEach(([ key, value ]) => {
            if (value?.value != undefined) {
                if (value.compareType != undefined) {
                    urlSearchParams.append(`[${key}][o]`, value.compareType);
                }

                urlSearchParams.append(`[${key}][v]`, value.value);
            }
        });
    }
    
    return (
        <div data-has-filter={hasFilter} className={styles.filterForm}>
            <Form
                {...props}
                form={form}
                onFinish={(value) => {
                    console.log(value);
                    onApplyFilter(value);
                }}
            >
                {renderFilters}
                <Row className={styles.actionBar}>
                    <Col>
                        <Input placeholder="Search video" prefix={<SearchOutlined />} />
                    </Col>
                    <Col>
                        <Dropdown menu={{ items: selectFilterDropdownItem }} trigger={[ 'click' ]}>
                            <Button className={styles.addFilterBtn}>
                                <Space>
                                    Add Filter
                                    <CaretDownOutlined className={styles.dropdownIcon} />
                                </Space>
                            </Button>
                        </Dropdown>
                    </Col>
                    {renderApplyFilter()}
                </Row>
            </Form>
        </div>
    );
}

export default FilterForm;
