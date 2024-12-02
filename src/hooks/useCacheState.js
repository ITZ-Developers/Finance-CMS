import { selectCacheByName } from "@selectors/cache";
import { cacheActions } from "@store/actions";

const { useEffect, useState, useRef } = require("react");
const { useDispatch, useSelector } = require("react-redux");

const useCacheState = (defaultData, name, options) => {
    const refData = useRef();
    const dispatch = useDispatch();
    const cacheData = useSelector(selectCacheByName(name));
    const { useCache, cache } = options || {};
    const [ data, setData ] = useState(useCache ? cacheData || defaultData : defaultData);

    const forceCache = () => {
        dispatch(cacheActions.cacheByName({ name, data }));
    };

    useEffect(() => {
        refData.current = data;
    }, [ data ]);

    useEffect(() => {
        return function cleanup() {
            cache && dispatch(cacheActions.cacheByName({ name, data: refData.current }));
        };
    }, []);

    return [ data, setData, forceCache ];
};

export default useCacheState;
