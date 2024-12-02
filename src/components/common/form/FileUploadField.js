import { Button, Form, Upload, Icon, Tooltip, Flex } from 'antd';
import React, { useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import useFormField from '@hooks/useFormField';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined, FileOutlined } from '@ant-design/icons';
import { showSucsessMessage } from '@services/notifyService';
import { BaseTooltip } from './BaseTooltip';

const FileUploadField = (props) => {
    const {
        label,
        fileList,
        disabled,
        fieldName,
        accept,
        onChange,
        beforeUpload,
        t,
        filePath,
        labelUpload,
        setFileListArray,
        setIsChangedFormValues,
    } = props;
    const [fileName, setFileName] = useState(null);
    const navigate = useNavigate();

    const uploadFile = ({ file, onSuccess }) => {
        const { uploadFile } = this.props;
        if (uploadFile) {
            uploadFile(file, onSuccess);
        } else {
            setTimeout(() => {
                onSuccess('ok');
            }, 0);
        }
    };

    const onUploadFile = ({ file, onSuccess, onError }) => {
        const { uploadFile } = props;
        uploadFile(
            file,
            (onSuccess = (res) => {
                setFileName(file.name);
            }),
            onError,
        );
    };

    const { rules } = useFormField(props);

    const removeItem = (idToRemove) => {
        const newArray = fileList.filter((item) => item !== idToRemove);
        setFileListArray(newArray);
        setIsChangedFormValues(true);
        showSucsessMessage('Delete media successfully!!');
    };

    return (
        <Form.Item label={label} name={fieldName} rules={rules} valuePropName={fieldName}>
            <Flex align="start" vertical>
                <Upload
                    fileList={fileList}
                    disabled={disabled}
                    accept={accept}
                    customRequest={onUploadFile}
                    beforeUpload={beforeUpload}
                    onChange={onChange}
                    showUploadList={false}
                    filePath={filePath}
                >
                    <BaseTooltip title={'Upload Document'}>
                        <Button icon={<UploadOutlined />} type='link'/>
                    </BaseTooltip>
                </Upload>
                {/* {fileList &&
                    fileList.map((item, index) => {
                        return (
                            <Flex
                                key={item}
                                justify="space-between"
                                align="center"
                                style={{
                                    width: '168px',
                                    backgroundColor: '#f7f7f7',
                                    padding: '8px 8px 5px 8px',
                                    borderRadius: 5,
                                    marginBottom: 2,
                                }}
                            >
                                <Tooltip placement="bottom" title="Click to download">
                                    <Button
                                        type="link"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeItem(item);
                                        }}
                                        style={{ padding: 0, zIndex: 100 }}
                                    >
                                        <FileOutlined style={{ marginBottom: 10, fontSize: 16 }} />
                                        {<span style={{ marginLeft: 5, fontWeight: 500, opacity: 0.8 }}>{`Document ${index}`}</span>}
                                    </Button>
                                </Tooltip>
                                <Button
                                    type="link"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeItem(item);
                                    }}
                                    style={{ padding: 0, zIndex: 100, marginBottom: 5 }}
                                >
                                    <DeleteOutlined style={{ color: 'red' }} />
                                </Button>
                            </Flex>
                        );
                    })} */}
            </Flex>
        </Form.Item>
    );
};

export default FileUploadField;
