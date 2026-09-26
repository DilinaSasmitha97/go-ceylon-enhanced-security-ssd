const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const { rateLimit } = require('express-rate-limit');

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_COUNT = 6;
const MAX_INPUT_PIXELS = 40_000_000;
const MAX_OUTPUT_DIMENSION = 4096;
const uploadDirectory = path.join(__dirname, '..', 'uploads');
const allowedClaimedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const allowedDecodedFormats = new Set(['jpeg', 'png', 'webp']);

const uploadRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many upload attempts. Please try again later.' }
});

const clientError = (message, status = 400) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

// MIME headers are only a fast preliminary check. Sharp performs the security-
// relevant validation by decoding the actual bytes in persistImages below.
const rawUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: MAX_IMAGE_COUNT,
        fields: 50,
        fieldSize: 1024 * 1024
    },
    fileFilter: (req, file, callback) => {
        if (!allowedClaimedMimeTypes.has(file.mimetype)) {
            return callback(clientError('Unsupported image type', 415));
        }
        callback(null, true);
    }
});

const handleMulter = (multerMiddleware) => (req, res, next) => {
    multerMiddleware(req, res, (error) => {
        if (!error) return next();

        if (!error.status) {
            error.status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
        }
        next(error);
    });
};

const uploadedFiles = (req) => {
    if (req.file) return [req.file];
    if (!req.files) return [];
    if (Array.isArray(req.files)) return req.files;
    return Object.values(req.files).flat();
};

const persistImages = async (req, res, next) => {
    const files = uploadedFiles(req);
    const writtenPaths = [];

    try {
        await fs.mkdir(uploadDirectory, { recursive: true });

        for (const file of files) {
            const image = sharp(file.buffer, {
                animated: false,
                failOn: 'warning',
                limitInputPixels: MAX_INPUT_PIXELS
            });
            const metadata = await image.metadata();

            if (!allowedDecodedFormats.has(metadata.format) || !metadata.width || !metadata.height) {
                throw clientError('File content is not a supported image', 415);
            }
            if (metadata.pages && metadata.pages > 1) {
                throw clientError('Animated or multi-page images are not supported', 415);
            }

            // Re-encoding removes attacker-supplied metadata and any trailing/polyglot
            // payload. Every persisted file has a server-controlled name and format.
            const safeBuffer = await image
                .rotate()
                .resize({
                    width: MAX_OUTPUT_DIMENSION,
                    height: MAX_OUTPUT_DIMENSION,
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({ quality: 85 })
                .toBuffer();

            const filename = `${crypto.randomUUID()}.webp`;
            const absolutePath = path.join(uploadDirectory, filename);
            await fs.writeFile(absolutePath, safeBuffer, { flag: 'wx' });
            writtenPaths.push(absolutePath);

            delete file.buffer;
            file.filename = filename;
            file.path = path.posix.join('uploads', filename);
            file.mimetype = 'image/webp';
            file.size = safeBuffer.length;
        }

        let responseFinished = false;
        const removeWrittenFiles = () => {
            Promise.all(writtenPaths.map((filePath) => fs.unlink(filePath).catch(() => {})));
        };
        res.once('finish', () => {
            responseFinished = true;
            if (res.statusCode >= 400) removeWrittenFiles();
        });
        res.once('close', () => {
            if (!responseFinished) removeWrittenFiles();
        });

        next();
    } catch (error) {
        await Promise.all(writtenPaths.map((filePath) => fs.unlink(filePath).catch(() => {})));
        if (!error.status) error.status = 415;
        next(error);
    }
};

const singleImage = (fieldName) => [
    handleMulter(rawUpload.single(fieldName)),
    persistImages
];

const imageArray = (fieldName, maxCount) => [
    handleMulter(rawUpload.array(fieldName, maxCount)),
    persistImages
];

const imageFields = (fields) => [
    handleMulter(rawUpload.fields(fields)),
    persistImages
];

module.exports = {
    MAX_FILE_SIZE,
    uploadRateLimit,
    singleImage,
    imageArray,
    imageFields
};
