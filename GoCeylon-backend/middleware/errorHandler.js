const errorHandler = (err, req, res, next) => {
    console.error('Error in errorHandler:', err); // Log the error

    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON' }); //Specific JSON parse error.
    }

    res.status(500).json({ error: 'An internal server error occurred' });
};

module.exports = errorHandler;