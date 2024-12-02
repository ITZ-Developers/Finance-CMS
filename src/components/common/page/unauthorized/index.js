import React from 'react';
import { FormattedMessage } from 'react-intl';

const PageUnauthorized = () => {
    return (
        <div>
            <FormattedMessage key="message" defaultMessage="You are not allowed to access this page" />
        </div>
    );
};

export default PageUnauthorized;
