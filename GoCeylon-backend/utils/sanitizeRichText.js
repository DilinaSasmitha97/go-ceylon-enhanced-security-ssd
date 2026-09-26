const sanitizeHtml = require('sanitize-html');

// Keep only the formatting supported by the attraction description editor.
// Everything executable (scripts, event handlers, iframes, unsafe URL schemes,
// styles, and unknown elements/attributes) is removed before persistence.
const sanitizeRichText = (value) => sanitizeHtml(
    typeof value === 'string' ? value : '',
    {
        allowedTags: [
            'p', 'br', 'strong', 'em', 'u', 's',
            'h1', 'h2', 'h3', 'ol', 'ul', 'li',
            'blockquote', 'pre', 'code', 'a'
        ],
        allowedAttributes: {
            a: ['href', 'title', 'target', 'rel']
        },
        allowedSchemes: ['http', 'https', 'mailto'],
        allowProtocolRelative: false,
        transformTags: {
            a: (tagName, attribs) => ({
                tagName,
                attribs: {
                    ...attribs,
                    rel: 'noopener noreferrer'
                }
            })
        }
    }
);

module.exports = sanitizeRichText;
