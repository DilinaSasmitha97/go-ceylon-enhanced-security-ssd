// A10: turn an exception into a message that is safe to send to API clients.
// The full error (stack trace, database/collection/index names, query values)
// is only written to the server log; the client gets a short, generic message.

const publicError = (err, fallback) => {
    console.error(`${fallback}:`, err);

    // Field-level schema messages such as "Name is required" help the user and reveal nothing internal
    if (err && err.name === 'ValidationError' && err.errors) {
        return Object.values(err.errors).map((e) => e.message).join(', ');
    }
    if (err && err.name === 'CastError') {
        return 'Invalid identifier';
    }
    if (err && err.code === 11000) {
        return 'A record with this value already exists';
    }
    return fallback;
};

module.exports = { publicError };
