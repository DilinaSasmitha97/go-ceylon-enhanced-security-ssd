// Central error handler (A10): logs the full error on the server and answers the
// client with a generic JSON message - never a stack trace, file path or raw error text.
const errorHandler = (err, req, res, next) => {
    console.error('Error in errorHandler:', err); // Log the error

    // Headers already sent: let Express close the connection
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON' }); //Specific JSON parse error.
    }

    // Other client errors raised by middleware (e.g. 413 payload too large) keep their status code
    if (err.status >= 400 && err.status < 500) {
        return res.status(err.status).json({ error: 'Invalid request' });
    }

    res.status(500).json({ error: 'An internal server error occurred' });
};

module.exports = errorHandler;
