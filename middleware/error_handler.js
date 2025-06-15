
const errorHandler = (err, req, res, next) => {
    const status_code = err.status_code || 500; // if the error doesn't come with a status code, I've set the default to be 500

    const message = err.message || 'Something went wrong on the server.';

    console.error(`[${new Date().toISOString()}] ERROR: ${status_code} - ${message}`);
    if (status_code === 500) {
        console.error(err.stack);
    }

    res.status(status_code).json({
        status: 'error',
        message: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;