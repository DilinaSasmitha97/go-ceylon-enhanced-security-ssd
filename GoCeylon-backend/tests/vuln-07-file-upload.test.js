const fs = require('fs/promises');
const path = require('path');
const request = require('supertest');
const mongoose = require('mongoose');
const sharp = require('sharp');
const app = require('../app');
const Location = require('../models/LocationModel');
const { MAX_FILE_SIZE } = require('../middleware/imageUploadMiddleware');
const { tokenFor } = require('./helpers');

const uploadDirectory = path.join(__dirname, '..', 'uploads');
const filesToDelete = [];

const token = (userType) => tokenFor(
    { _id: new mongoose.Types.ObjectId(), email: `${userType}@example.com` },
    userType
);

const locationFields = {
    name: 'Upload test attraction',
    description: '<p>Safe description</p>',
    google_map_url: 'https://maps.app.goo.gl/test',
    tags: JSON.stringify(['Historic']),
    points: JSON.stringify([])
};

const validPng = () => sharp({
    create: {
        width: 4,
        height: 4,
        channels: 3,
        background: { r: 20, g: 120, b: 80 }
    }
}).png().toBuffer();

afterEach(async () => {
    await Promise.all(filesToDelete.splice(0).map((file) => fs.unlink(file).catch(() => {})));
});

describe('VULN-07 unrestricted file upload protection', () => {
    it('authenticates business uploads before parsing files', async () => {
        const image = await validPng();
        const res = await request(app)
            .post('/api/business/create')
            .attach('images', image, { filename: 'business.png', contentType: 'image/png' });

        expect(res.status).toBe(401);
    });

    it('rejects a forged image MIME type by inspecting the actual bytes', async () => {
        const res = await request(app)
            .post('/location')
            .set('Authorization', token('admin'))
            .field(locationFields)
            .attach('images', Buffer.from('<script>alert(1)</script>'), {
                filename: 'attack.png',
                contentType: 'image/png'
            });

        expect(res.status).toBe(415);
        expect(await Location.countDocuments()).toBe(0);
    });

    it('applies actual-content validation to the public guide registration upload', async () => {
        const res = await request(app)
            .post('/guides')
            .attach('photo', Buffer.from('not an image'), {
                filename: 'guide.jpg',
                contentType: 'image/jpeg'
            });

        expect(res.status).toBe(415);
    });

    it('rejects files larger than the five-megabyte limit', async () => {
        const res = await request(app)
            .post('/location')
            .set('Authorization', token('admin'))
            .field(locationFields)
            .attach('images', Buffer.alloc(MAX_FILE_SIZE + 1), {
                filename: 'oversized.png',
                contentType: 'image/png'
            });

        expect(res.status).toBe(413);
        expect(await Location.countDocuments()).toBe(0);
    });

    it('re-encodes a valid image and assigns a random server-side filename', async () => {
        const image = await validPng();
        const res = await request(app)
            .post('/location')
            .set('Authorization', token('admin'))
            .field(locationFields)
            .attach('images', image, { filename: '../../chosen-name.png', contentType: 'image/png' });

        expect(res.status).toBe(201);
        const publicUrl = res.body.location.image_url[0];
        const filename = publicUrl.split('/').pop();
        expect(filename).toMatch(/^[0-9a-f-]{36}\.webp$/);
        expect(filename).not.toContain('chosen-name');

        const savedPath = path.join(uploadDirectory, filename);
        filesToDelete.push(savedPath);
        const savedImage = await fs.readFile(savedPath);
        const metadata = await sharp(savedImage).metadata();
        expect(metadata.format).toBe('webp');
        expect(metadata.width).toBe(4);
        expect(metadata.height).toBe(4);
    });

    it('does not publicly serve disallowed legacy file extensions', async () => {
        const filename = `${new mongoose.Types.ObjectId()}.html`;
        const savedPath = path.join(uploadDirectory, filename);
        filesToDelete.push(savedPath);
        await fs.writeFile(savedPath, '<script>alert(1)</script>');

        const res = await request(app).get(`/uploads/${filename}`);

        expect(res.status).toBe(404);
    });

    it('removes a processed image when downstream record validation fails', async () => {
        const before = new Set((await fs.readdir(uploadDirectory)).filter((name) => name.endsWith('.webp')));
        const image = await validPng();

        const res = await request(app)
            .post('/guides')
            .attach('photo', image, { filename: 'valid.png', contentType: 'image/png' });

        expect(res.status).toBe(400);
        await new Promise((resolve) => setTimeout(resolve, 50));
        const after = new Set((await fs.readdir(uploadDirectory)).filter((name) => name.endsWith('.webp')));
        expect(after).toEqual(before);
    });
});
