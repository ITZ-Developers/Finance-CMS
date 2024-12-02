import React from 'react';

import Loading from '@components/common/loading';
import AppLoading from '@modules/main/AppLoading';
import AppRoutes from '@routes/routes';

const App = () => (
    <React.Suspense fallback={<Loading show />}>
        <AppLoading />
        <AppRoutes />
    </React.Suspense>
);

export default App;
