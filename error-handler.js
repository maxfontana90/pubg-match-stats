module.exports = errorHandler;

function errorHandler(message) {
    return (err) => {
        let errMsg = message;
        if (err.status === 429) {
            errMsg = `Too Many Requests. Please wait a minute.`;
        }
        throw new Error(errMsg);
    };
}