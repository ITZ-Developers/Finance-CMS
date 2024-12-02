import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigationType } from "react-router-dom";

import { navigateTypeEnum } from "@constants";

const AppNavigate = () => {
    const navigateType = useNavigationType();
    const location = useLocation();

    useEffect(() => {
        if (navigateType !== navigateTypeEnum.POP) {
            window.scrollTo(0, 0);
        }
    }, [ location.pathname, navigateType ]);

    return <Outlet />;
};

export default AppNavigate;
