import React from 'react';
import { Spin } from 'antd';

const LoadingWrapper = ({ loading, size = 'large', children, className }) => (
    <Spin size={size} spinning={!!loading} className={className}>
        {children}
    </Spin>
);

export default LoadingWrapper;
