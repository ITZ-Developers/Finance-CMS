import React, { useEffect, useState } from 'react';
import { Button, Table } from 'antd';

import styles from './BaseTable.module.scss';
import classNames from 'classnames';

const BaseTable = ({
    dataSource,
    onChange,
    rowSelection,
    columns = [],
    loading,
    pagination,
    rowKey = (record) => record.id,
    pageLocal = false,
    onPaginationChange,
    onResetPage, // Thêm prop này để nhận hàm từ component khác
    rowClassName,
    className,
    ...props
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [paginatedData, setPaginatedData] = useState([]);

    useEffect(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        if (pageLocal) {
            setPaginatedData(dataSource.slice(startIndex, endIndex));
        }
    }, [currentPage, pageSize, dataSource]);

    const resetToFirstPage = () => {
        setCurrentPage(1);
        if (onPaginationChange) {
            onPaginationChange({ current: 1, pageSize: pageSize });
        }
    };

    // Gọi hàm reset từ bên ngoài
    useEffect(() => {
        if (onResetPage) {
            onResetPage(resetToFirstPage);
        }
    }, [onResetPage]);

    const handleTableChange = (pagination) => {
        setCurrentPage(pagination.current);
        setPageSize(pagination.pageSize);
        if (onPaginationChange) {
            console.log(pagination);
            onPaginationChange(pagination);
        }
    };

    return (
        <Table
            scroll={{ x: 'max-content' }}
            columns={columns.filter(Boolean)}
            dataSource={pageLocal ? paginatedData : dataSource}
            loading={loading}
            rowKey={rowKey}
            pagination={
                pagination
                    ? { ...pagination, showSizeChanger: false, hideOnSinglePage: true }
                    : pageLocal
                        ? {
                            current: currentPage,
                            pageSize: pageSize,
                            total: dataSource.length,
                            // showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                            showSizeChanger: false,
                            hideOnSinglePage: true,
                        }
                        : false
            }
            onChange={pageLocal ? handleTableChange : onChange}
            rowSelection={rowSelection}
            {...props}
            className={classNames(styles.baseTable, className)}
            // className={className}
            rowClassName={rowClassName}
        />
    );
};

// => (
//     <Table
//         onChange={onChange}
//         scroll={{ x: true }}
//         columns={columns.filter(Boolean)}
//         dataSource={dataSource}
//         loading={loading}
//         rowKey={rowKey}
//         rowSelection={rowSelection}
//         // scroll={{ x: 'max-content' }}
//         {...props}
//         className={classNames(styles.baseTable, props.className)}
//         pagination={pagination ? { ...pagination, showSizeChanger: false, hideOnSinglePage: true } : false}
//     />
// );

export default BaseTable;
