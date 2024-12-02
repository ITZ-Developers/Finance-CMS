const handleApiResponse = (result, onCompleted, onError) => {
    const { success, responseData } = result;
    if (success && responseData.result) onCompleted(responseData);
    else onError(responseData);
};

export { handleApiResponse };
