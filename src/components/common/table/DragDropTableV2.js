import { DndContext } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';
import './DragDropTableV2.scss';
import { MenuOutlined } from '@ant-design/icons';
import BaseTable from './BaseTable';

const DraggableRow = ({ children, ...props }) => {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
        id: props['data-row-key'],
    });
    const style = {
        ...props.style,
        transform: CSS.Transform.toString(
            transform && {
                ...transform,
                scaleY: 1,
            },
        ),
        transition,
        ...(isDragging
            ? {
                position: 'relative',
                zIndex: 9999,
            }
            : {}),
    };
    return (
        <tr {...props} ref={setNodeRef} style={style} {...attributes}>
            {React.Children.map(children, (child) => {
                if (child.key === 'sort') {
                    return React.cloneElement(child, {
                        children: (
                            <MenuOutlined
                                ref={setActivatorNodeRef}
                                style={{
                                    touchAction: 'none',
                                    cursor: 'move',
                                }}
                                {...listeners}
                            />
                        ),
                    });
                }
                return child;
            })}
        </tr>
    );
};

const DragDropTableV2 = ({
    dataSource,
    onDragEnd,
    onChange,
    rowSelection,
    columns,
    loading,
    pagination,
    rowKey = (record) => record.id,
    ...props
}) => {
    return (
        <DndContext onDragEnd={({ active, over }) => onDragEnd(active, over)}>
            <SortableContext
                // rowKey array
                items={dataSource.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
            >
                <BaseTable
                    components={{
                        body: {
                            row: DraggableRow,
                        },
                    }}
                    rowSelection={rowSelection}
                    loading={loading}
                    pagination={pagination}
                    onChange={onChange}
                    rowKey={rowKey}
                    columns={columns}
                    dataSource={dataSource}
                    scroll={null}
                    {...props}
                />
            </SortableContext>
        </DndContext>
    );
};
export default DragDropTableV2;
