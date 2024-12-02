import { Dropdown, Form, Modal, Space, Input, Upload, Spin, Image } from 'antd';
import React, { useState } from 'react';
import ImgCrop from 'antd-img-crop';

import { FileAddOutlined, LinkOutlined, UploadOutlined } from '@ant-design/icons';
import useFetch from '@hooks/useFetch';
import apiConfig from '@constants/apiConfig';

import styles from './UploadField.module.scss';
import classNames from 'classnames';
import CropImageLink from '../CropImageField/CropImageLink';
import useNotification from '@hooks/useNotification';

function UploadImageField({ required, label, name, formItemProps, aspect, objectName = '' }) {
    const checkFileLink = (_, value) => {
        if (value) {
            return Promise.resolve();
        }
        return Promise.reject(new Error('This field is required!'));
    };

    return (
        <Form.Item
            {...formItemProps}
            required={required}
            label={label}
            name={name}
            rules={[
                {
                    validator: checkFileLink,
                },
            ]}
        >
            <ImageField objectName={objectName} aspect={aspect} />
        </Form.Item>
    );
}

function ImageField({ value = '', onChange, objectName = '', aspect }) {
    const [ showModal, setShowModal ] = useState(false);
    const [ fileLink, setFileLink ] = useState();
    const { execute: executeUpFile } = useFetch(apiConfig.file.image);
    const [ uploadLoading, setUploadLoading ] = useState(false);
    const [ errorMessage, setErrorMessage ] = useState('');
    const [ showCropImageLink, setShowCropimageLink ] = useState(false);
    const notification = useNotification();

    const uploadError = () => {
        setErrorMessage('Error');
        notification({ type: 'error', message: 'Upload image error' });
        setUploadLoading(false);
    };

    const uploadFile = ({ file, onSuccess, onError }) => {
        setUploadLoading(true);
        executeUpFile({
            data: {
                image: file,
            },
            onCompleted: (result) => {
                setErrorMessage('');
                onChange(result.data.url);
                onSuccess();
                setUploadLoading(false);
            },
            onError: (error) => {
                onError();
                uploadError();
            },
        });
    };

    const uploadFileLink = (file) => {
        setShowCropimageLink(false);
        executeUpFile({
            data: {
                image: file,
            },
            onCompleted: (result) => {
                setErrorMessage('');
                onChange(result.data.url);
                setUploadLoading(false);
            },
            onError: () => {
                uploadError();
            },
        });
    };

    const uploadDropdownItems = [
        {
            key: '1',
            label: (
                <ImgCrop aspect={aspect}>
                    <Upload accept=".jpg, .jpeg, .png" showUploadList={false} customRequest={uploadFile}>
                        <Space>
                            <FileAddOutlined />
                            From File ...
                        </Space>
                    </Upload>
                </ImgCrop>
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
                    <img style={{ width: '100%', height: '100%', objectFit: 'contain' }} src={value} />
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
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Dropdown trigger={[ 'click' ]} menu={{ items: uploadDropdownItems }}>
                    <div
                        className={classNames(
                            styles.uploadBtn,
                            errorMessage || value ? styles.border : styles.borderHover,
                        )}
                        style={{ padding: 8 }}
                    >
                        {renderContent()}
                    </div>
                </Dropdown>
            </div>
            <Modal
                title={`Upload ${objectName}`}
                open={showModal}
                onOk={() => {
                    setUploadLoading(true);
                    fileLink && setShowCropimageLink(true);
                    setShowModal(false);
                }}
                onCancel={() => setShowModal(false)}
            >
                <div>Key in URL or Link</div>
                <Input value={fileLink} onChange={(e) => setFileLink(e.target.value)} />
            </Modal>

            <CropImageLink
                aspect={aspect}
                url={fileLink}
                show={showCropImageLink}
                onCompleted={uploadFileLink}
                onError={() => {
                    uploadError();
                    setShowCropimageLink(false);
                }}
                onModalCancel={() => {
                    setShowCropimageLink(false);
                    setUploadLoading(false);
                }}
            />
        </>
    );
}

export default UploadImageField;
