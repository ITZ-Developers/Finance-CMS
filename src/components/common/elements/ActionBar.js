import { Button, Col, Modal, Row } from 'antd';
import React, { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

import styles from './ActionBar.module.scss';
import HasPermission from './HasPermission';
import { defineMessages } from 'react-intl';

const message = defineMessages({
    create: 'Add new',
    bulkDeleteTitle: 'Are you sure you want to delete selected {objectName}?',
    yes: 'Yes',
    no: 'No',
});

function ActionBar({
    createLink,
    createPermission,
    selectedRows = [],
    onBulkDelete,
    objectName,
    location,
    type,
    style,
    keepCreateButton,
    buttons,
}) {
    const intl = useIntl();
    const onBulkDeleteButtonClick = () => {
        Modal.confirm({
            title: intl.formatMessage(message.bulkDeleteTitle, { objectName }),
            centered: true,
            okText: intl.formatMessage(message.yes),
            okType: 'danger',
            cancelText: intl.formatMessage(message.no),
            onOk: () => {
                onBulkDelete();
            },
        });
    };

    const renderButtons = useCallback(() => {
        const CreateButton = () => (
            <Col>
                <Link to={createLink} state={{ action: 'create', prevPath: location.pathname }}>
                    <HasPermission requiredPermissions={createPermission}>
                        <Button type="primary" style={style}>
                            <PlusOutlined /> {intl.formatMessage(message.create, { objectName })}
                        </Button>
                    </HasPermission>
                </Link>
            </Col>
        );
        if (!buttons) {
            return <CreateButton />;
        }

        return buttons.map((button) => (
            <Col key={button.linkTo}>
                <Link to={button.linkTo} state={{ prevPath: location.pathname }}>
                    {button.component}
                </Link>
            </Col>
        ));
    }, [buttons, createLink, createPermission]);

    return (
        <Row wrap justify="end" gutter={12} className={styles.actionBar}>
            <Col>
                {selectedRows.length > 0 && (
                    <HasPermission>
                        <Button icon={<DeleteOutlined />} onClick={onBulkDeleteButtonClick}>
                            Delete selected ({selectedRows.length})
                        </Button>
                    </HasPermission>
                )}
            </Col>
            {renderButtons()}
        </Row>
    );
}

export default ActionBar;
