import styles from './index.module.scss';

import React, { useMemo } from 'react';

import { Form, Upload } from 'antd';
import ImgCrop from 'antd-img-crop';

import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import useFormField from '@hooks/useFormField';
import { showErrorMessage } from '@services/notifyService';

function CropImageField({
    label,
    fileList,
    disabled,
    name,
    valuePropName,
    accept,
    onChange,
    beforeUpload,
    showUploadList,
    aspect = 1,
    maxFile,
    imageUrl,
    loading,
    style,
    required,
    formItemProps,
    imgUploadedSizeAuto,
    ...props
}) {
    const { rules } = useFormField(props);

    const onUploadFile = ({ file, onSuccess, onError }) => {
        const { uploadFile } = props;
        uploadFile(file, onSuccess, onError);
    };

    const getContent = () => {
        if (imageUrl && !loading) {
            return (
                <div style={{ margin: 4 }}>
                    <img
                        style={{ maxWidth: '100%', objectFit: 'contain' }}
                        className="img-uploaded"
                        src={imageUrl}
                        alt="field-upload"
                    />
                </div>
            );
        } else if (showUploadList && fileList && fileList.length === maxFile) {
            return null;
        } else {
            return renderUploadButton();
        }
    };

    const renderUploadButton = () => {
        return (
            <div className="upload-wrapper">
                {!showUploadList && loading ? <LoadingOutlined /> : <PlusOutlined />}
                <div className="ant-upload-text">{loading ? 'Đang tải lên' : 'Tải lên'}</div>
            </div>
        );
    };

    const uploadClass = useMemo(() => {
        return ['avatar-uploader', imgUploadedSizeAuto && 'img-uploaded-size-auto'].filter(Boolean).join(' ');
    }, []);

    const handleBeforeUpload = (file) => {
        const isPNG = file.type === 'image/png';
        if (!isPNG) {
            showErrorMessage(`${file.name} is not a png file`);
        }
        return isPNG || Upload.LIST_IGNORE;
    };

    return (
        <Form.Item
            {...formItemProps}
            required={required}
            label={label}
            name={name}
            rules={rules}
            valuePropName={valuePropName}
        >
            {showUploadList ? (
                <ImgCrop aspect={aspect}>
                    <Upload
                        fileList={fileList}
                        disabled={disabled}
                        accept={accept}
                        name="field-upload"
                        listType="picture-card"
                        style={{ width: '100%' }}
                        customRequest={onUploadFile}
                        beforeUpload={beforeUpload ?? handleBeforeUpload}
                        onChange={onChange}
                        className={uploadClass}

                    >
                        {getContent()}
                    </Upload>
                </ImgCrop>
            ) : (
                <ImgCrop aspect={aspect}>
                    <Upload
                        disabled={disabled}
                        accept={accept}
                        valuePropName={valuePropName}
                        listType="picture-card"
                        style={{ width: '100%' }}
                        showUploadList={false}
                        customRequest={onUploadFile}
                        beforeUpload={beforeUpload}
                        onChange={onChange}
                        className={uploadClass}
                    >
                        {getContent()}
                    </Upload>
                </ImgCrop>
            )}
        </Form.Item>
    );
}

export default CropImageField;
