import { Table } from 'antd';
import React, { useEffect, useMemo, useState, Suspense, lazy } from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import styles from './BaseTable.module.scss';
import classNames from 'classnames';
import AutoSizer from 'react-virtualized-auto-sizer';

// Dữ liệu mẫu

// Cột của bảng
const data = Array.from({ length: 1000 }).map((_, index) => ({
    key: index,
    name: `Item ${index}`,
    age: 20 + (index % 10),
    address: `Address ${index}`,
}));
const columns = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: 400,
    },
    {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
        width: 400,
    },
    {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
        width: 400,
    },
];

// const VirtualRender = ({ columns, dataSource, width, height }) => {
//     const [columnWidths, setColumnWidths] = useState([]);
//     const LazyColumn = lazy(() => import('@modules/transaction/index'));

//     useEffect(() => {
//         const totalFlex = columns.reduce((total, column) => total + (column.flex || 1), 0);
//         const newColumnWidths = columns.map((column) => (width / totalFlex) * (column.flex || 1));
//         setColumnWidths(newColumnWidths);
//     }, [width, columns]);

//     const getColumnWidth = (index) => columnWidths[index];
//     const getRowHeight = () => 50;

//     const renderVirtualList = ({ columnIndex, rowIndex, style }) => {
//         const column = columns[columnIndex];
//         const data = dataSource[rowIndex];

//         if (columnIndex === columns.length - 1) {
//             // Render last column using lazy loading
//             return (
//                 <Suspense fallback={<div style={style}>Loading...</div>}>
//                     <LazyColumn
//                         column={column}
//                         data={data}
//                         style={style}
//                     />
//                 </Suspense>
//             );
//         }

//         return (
//             <div
//                 className="virtual-table-cell"
//                 style={{
//                     ...style,
//                     boxSizing: 'border-box',
//                     padding: 8,
//                     borderBottom: '1px solid #f0f0f0',
//                     background: columnIndex % 2 ? 'white' : '#fafafa',
//                 }}
//             >
//                 {data[column.dataIndex]}
//             </div>
//         );
//     };

//     return (
//         <Grid
//             columnCount={columns.length}
//             columnWidth={getColumnWidth}
//             height={height}
//             rowCount={dataSource.length}
//             rowHeight={getRowHeight}
//             width={width}
//         >
//             {renderVirtualList}
//         </Grid>
//     );
// };

const VirtualRender = (props) => {
    const { columns = [], scroll = {}, dataSource = [] } = props;

    const widthColumnCount = columns.length;
    const mergedColumns = columns.map((column) => ({
        ...column,
        width: column.width || 150,
    }));
    const width = mergedColumns.reduce((sum, column) => sum + column.width, 0);

    const renderVirtualList = ({ ...rest }) => {
        if (dataSource.length == 0 || columns.length == 0)
            return null;

        return (
            <Grid
                columnCount={widthColumnCount}
                columnWidth={(index) => mergedColumns[index].width}
                height={scroll.y || 600}
                rowCount={dataSource.length}
                rowHeight={() => 50}
                width={width}
                {...rest}
            >
                {({ columnIndex, rowIndex, style }) => (
                    <div
                        className="virtual-table-cell"
                        style={{
                            ...style,
                            boxSizing: 'border-box',
                            padding: 8,
                            borderBottom: '1px solid #f0f0f0',
                        }}
                    >
                        {dataSource[rowIndex] && dataSource[rowIndex][mergedColumns[columnIndex].dataIndex]}
                    </div>
                )}
            </Grid>
        );
    };

    return renderVirtualList(props);
};

const VirtualTable = ({
    data,
    onChange,
    rowSelection,
    columns = [],
    columnAction,
    loading,
    pagination,
    rowKey = (record) => record.id,
    ...props
}) => (
    <Table
        columns={columns}
        dataSource={data}
        // scroll={{ y: 600 }}
        pagination={false}
        loading={loading}
        components={{
            body: (props) => <VirtualRender {...props} dataSource={data} columns={columns} scroll={{ y: 1600 }} />,
        }}
        className={classNames(styles.baseTable)}
        onChange={onChange}
        rowKey={rowKey}
        rowSelection={rowSelection}
    />
);

// const VirtualTable = ({
//     data,
//     onChange,
//     rowSelection,
//     columns = [],
//     columnAction,
//     loading,
//     pagination,
//     rowKey = (record) => record.id,
//     ...props
// }) => {
//     const lengthColumns = columns.length;
//     const rowHeight = 50;
//     const maxVisibleRows = 17;
//     const tableHeight = rowHeight * maxVisibleRows;
//     const columnData = useMemo(() => {
//         return [...columns, columnAction];
//     }, [columnAction]);
//     return (
//         <Table
//             loading={loading}
//             columns={columns.filter(Boolean)}
//             dataSource={data}
//             components={{
//                 body: (props) => {
//                     return (
//                         <VirtualRender
//                             {...props}
//                             columns={columns}
//                             dataSource={data}
//                             // width={window.innerWidth}
//                             // height={tableHeight}
//                         />
//                     );
//                 },
//             }}
//             className={classNames(styles.baseTable)}
//             onChange={onChange}
//             rowKey={rowKey}
//             rowSelection={rowSelection}
//             {...props}
//             pagination={pagination ? { ...pagination, showSizeChanger: false, hideOnSinglePage: true } : false}
//         />
//     );
// };

export default VirtualTable;
