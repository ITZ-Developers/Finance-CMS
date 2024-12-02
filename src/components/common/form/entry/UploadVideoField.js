import { Dropdown, Form, Modal, Space, Input, Upload, Spin } from 'antd';
import React, { useState } from 'react';

import { FileAddOutlined, LinkOutlined, UploadOutlined } from '@ant-design/icons';
import useFetch from '@hooks/useFetch';
import apiConfig from '@constants/apiConfig';

import styles from './UploadField.module.scss';
import classNames from 'classnames';

import defaultUploadVideo from '@assets/images/defaul-upload-video.png';
function UploadVideoField({ required, label, name, formItemProps, objectName = '' }) {
    const checkFileLink = (_, value) => {
        if (value) {
            return Promise.resolve();
        }
        return Promise.reject(new Error('This field is required!'));
    };

    return (
        <Form.Item
            {...formItemProps}
            rules={[ { validator: checkFileLink } ]}
            required={required}
            label={label}
            name={name}
        >
            <VideoField objectName={objectName} />
        </Form.Item>
    );
}

function VideoField({ value = '', onChange, objectName = '' }) {
    const [ showModal, setShowModal ] = useState(false);
    const [ fileLink, setFileLink ] = useState(value);
    const { execute: executeUpFile } = useFetch(apiConfig.file.video);
    const [ errorMessage, setErrorMessage ] = useState('');
    const [ uploadLoading, setUploadLoading ] = useState(false);

    const uploadFile = ({ file, onSuccess, onError }) => {
        setUploadLoading(true);
        executeUpFile({
            data: {
                video: file,
            },
            onCompleted: (result) => {
                onChange(result.data.url);
                onSuccess();
                setUploadLoading(false);
            },
            onError: (error) => {
                onError();
                setErrorMessage('Error');
                setUploadLoading(false);
            },
        });
    };

    const uploadDropdownItems = [
        {
            key: '1',
            label: (
                <Upload accept=".mp4" showUploadList={false} customRequest={uploadFile}>
                    <Space>
                        <FileAddOutlined />
                        From File ...
                    </Space>
                </Upload>
            ),
        },
        {
            key: '2',
            label: (
                <Space onClick={() => setShowModal(true)}>
                    <LinkOutlined />
                    From Link ...
                </Space>
            ),
        },
    ];

    const renderContent = () => {
        if (uploadLoading) {
            return <Spin />;
        }
        if (errorMessage) {
            return <div style={{ color: 'red' }}>{errorMessage}</div>;
        }
        if (value) {
            return (
                <>
                    <div className={styles.imageText}>Update</div>
                    <img style={{ width: 102, height: 102 }} src={defaultUploadVideo} />
                </>
            );
        }
        return (
            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                <div>
                    <UploadOutlined style={{ fontSize: 16 }} />
                </div>
                <div style={{ fontSize: 12 }}>Upload {objectName}</div>
            </div>
        );
    };

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Dropdown trigger={[ 'click' ]} menu={{ items: uploadDropdownItems }}>
                    <div
                        className={classNames(
                            styles.uploadBtn,
                            errorMessage || value ? styles.border : styles.borderHover,
                        )}
                    >
                        {renderContent()}
                    </div>
                </Dropdown>
            </div>
            <Modal
                title={`Upload ${objectName}`}
                open={showModal}
                onOk={() => {
                    fileLink && onChange(fileLink);
                    setShowModal(false);
                }}
                onCancel={() => setShowModal(false)}
            >
                <div>Key in URL or Link</div>
                <Input value={fileLink} onChange={(e) => setFileLink(e.target.value)} />
            </Modal>
        </>
    );
}

export default UploadVideoField;
