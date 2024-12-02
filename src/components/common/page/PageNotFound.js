import React, { Component } from 'react';
import notFoundImage from '@assets/images/bg_404.png';

import styles from './PageNotFound.module.scss';

class PageNotFound extends Component {
    render() {
        return (
            <div className={styles.pageNotFound}>
                <img alt="not-found-background" src={notFoundImage} />
            </div>
        );
    }
}

export default PageNotFound;
