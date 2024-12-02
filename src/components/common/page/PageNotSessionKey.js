import React, { Component } from 'react';
import notFoundSession from '@assets/images/session.png';

import styles from './PageNotSession.module.scss';
import { Button, Flex } from 'antd';
import ModalSession from '../form/entry/ModalSession';
import useDisclosure from '@hooks/useDisclosure';

const PageNotSessionKey = ({ setCheckKey }) => {
    const [openedModal, handlerModal] = useDisclosure(false);
    return (
        <>
            <Flex justify="center" align="center" vertical className={styles.pageNotSession}>
                <img alt="not-found-background" src={notFoundSession} />
                <span style={{ fontSize: 20, fontWeight: 700, marginLeft: 20, opacity: 0.7, marginBottom: 10 }}>
                    NO VALID SESSION KEY
                </span>
                <Button onClick={() => handlerModal.open()} htmlType="submit" type="primary" style={{ marginBottom: 10 }}>
                    Session Key
                </Button>
            </Flex>
            <ModalSession open={openedModal} close={() => handlerModal.close()} handlerModal={handlerModal} setCheckKey={setCheckKey}/>
        </>
    );
};

export default PageNotSessionKey;
