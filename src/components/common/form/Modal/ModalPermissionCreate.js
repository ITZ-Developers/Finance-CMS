import { Button, Card, Col, Form, Modal, Row } from 'antd';
import React from 'react';
import { BaseForm } from '../BaseForm';
import AutoCompleteField from '../AutoCompleteField';
import useFetch from '@hooks/useFetch';
import apiConfig from '@constants/apiConfig';
import { PermissionKind } from '@constants';
import { showErrorMessage, showSucsessMessage } from '@services/notifyService';

const ModalPermissionCreate = (props) => {
    const { open, close, title, name, label, apiGetList, getList } = props;
    const [form] = Form.useForm();

    const queryParameters = new URLSearchParams(window.location.search);
    const keyInformationGroupId = queryParameters.get('keyInformationGroupId');
    const transactionGroupId = queryParameters.get('transactionGroupId');
    const projectId = queryParameters.get('projectId');
    const organizationId = queryParameters.get('organizationId');
    const serviceGroupId = queryParameters.get('serviceGroupId');

    const { execute: createKeyInformationPermission } = useFetch(apiConfig.keyInformationPermission.create);
    const { execute: createGroupTransactionPermission } = useFetch(apiConfig.transactionPermission.create);
    const { execute: createProjectPermission } = useFetch(apiConfig.taskPermission.create);
    const { execute: createOrganizationPermission } = useFetch(apiConfig.organizationPermission.create);
    const { execute: createServicePermission } = useFetch(apiConfig.servicePermission.create);

    const handleSubmit = (values) => {
        if (keyInformationGroupId) {
            createKeyInformationPermission({
                data: {
                    ...values,
                    permissionKind: PermissionKind.GROUP,
                    keyInformationGroupId,
                },
                onCompleted: (res) => {
                    showSucsessMessage(res.message);
                    getList();
                },
                onError: (err) => {
                    showErrorMessage(err.message);
                },
            });
        } else if (transactionGroupId) {
            createGroupTransactionPermission({
                data: {
                    ...values,
                    permissionKind: PermissionKind.GROUP,
                    transactionGroupId,
                },
                onCompleted: (res) => {
                    showSucsessMessage(res.message);
                    getList();
                },
                onError: (err) => {
                    showErrorMessage(err.message);
                },
            });
        } else if (projectId) {
            createProjectPermission({
                data: {
                    ...values,
                    permissionKind: PermissionKind.GROUP,
                    projectId,
                },
                onCompleted: (res) => {
                    showSucsessMessage(res.message);
                    getList();
                },
                onError: (err) => {
                    showErrorMessage(err.message);
                },
            });
        } else if (organizationId) {
            createOrganizationPermission({
                data: {
                    ...values,
                    organizationId,
                },
                onCompleted: (res) => {
                    showSucsessMessage(res.message);
                    getList();
                },
                onError: (err) => {
                    showErrorMessage(err.message);
                },
            });
        } else if (serviceGroupId) {
            createServicePermission({
                data: {
                    ...values,
                    permissionKind: PermissionKind.GROUP,
                    serviceGroupId,
                },
                onCompleted: (res) => {
                    showSucsessMessage(res.message);
                    getList();
                },
                onError: (err) => {
                    showErrorMessage(err.message);
                },
            });
        }
        close();
        form.resetFields();
    };

    const handleCancel = () => {
        close();
        form.resetFields();
    };

    return (
        <Modal title={<span>{title}</span>} open={open} onCancel={handleCancel} footer={null}>
            <BaseForm
                form={form}
                onFinish={(values) => {
                    handleSubmit(values);
                }}
            >
                <div className="card-form" style={{ width: '60%' }}>
                    <Row gutter={10}>
                        <Col span={24}>
                            {keyInformationGroupId && (
                                <AutoCompleteField
                                    required
                                    name={name}
                                    label={label}
                                    apiConfig={apiGetList}
                                    mappingOptions={(item) => ({ value: item.id, label: item.fullName })}
                                    searchParams={(text) => ({ fullName: text })}
                                    initialSearchParams={{
                                        ignoreKeyInformationGroupId: keyInformationGroupId,
                                    }}
                                />
                            )}

                            {transactionGroupId && (
                                <AutoCompleteField
                                    required
                                    name={name}
                                    label={label}
                                    apiConfig={apiGetList}
                                    mappingOptions={(item) => ({ value: item.id, label: item.fullName })}
                                    searchParams={(text) => ({ fullName: text })}
                                    initialSearchParams={{
                                        ignoreTransactionGroupId: transactionGroupId,
                                    }}
                                />
                            )}

                            {projectId && (
                                <AutoCompleteField
                                    required
                                    name={name}
                                    label={label}
                                    apiConfig={apiGetList}
                                    mappingOptions={(item) => ({ value: item.id, label: item.fullName })}
                                    searchParams={(text) => ({ fullName: text })}
                                    initialSearchParams={{
                                        ignoreProjectId: projectId,
                                    }}
                                />
                            )}

                            {organizationId && (
                                <AutoCompleteField
                                    required
                                    name={name}
                                    label={label}
                                    apiConfig={apiGetList}
                                    mappingOptions={(item) => ({ value: item.id, label: item.fullName })}
                                    searchParams={(text) => ({ fullName: text })}
                                    initialSearchParams={{
                                        ignoreOrganizationId: organizationId,
                                    }}
                                />
                            )}

                            {serviceGroupId && (
                                <AutoCompleteField
                                    required
                                    name={name}
                                    label={label}
                                    apiConfig={apiGetList}
                                    mappingOptions={(item) => ({ value: item.id, label: item.fullName })}
                                    searchParams={(text) => ({ fullName: text })}
                                    initialSearchParams={{
                                        ignoreServiceGroupId: serviceGroupId,
                                    }}
                                />
                            )}
                        </Col>
                    </Row>
                    <Row justify={'end'}>
                        <Button key="submit" htmlType="submit" type="primary" style={{ marginLeft: 5 }}>
                            {'Add'}
                        </Button>
                    </Row>
                </div>
            </BaseForm>
        </Modal>
    );
};

export default ModalPermissionCreate;
