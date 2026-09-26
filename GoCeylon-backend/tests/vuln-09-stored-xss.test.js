const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Location = require('../models/LocationModel');
const { tokenFor } = require('./helpers');

const adminToken = () => tokenFor(
    { _id: new mongoose.Types.ObjectId(), email: 'admin@example.com' },
    'admin'
);

const safeLocationFields = {
    name: 'Test attraction',
    google_map_url: 'https://maps.app.goo.gl/test',
    tags: JSON.stringify(['Historic']),
    points: JSON.stringify([])
};

describe('stored XSS protection for attraction descriptions', () => {
    it('requires an authenticated admin before accepting a location write', async () => {
        const res = await request(app)
            .post('/location')
            .field({ ...safeLocationFields, description: '<p>Safe</p>' });

        expect(res.status).toBe(401);
        expect(await Location.countDocuments()).toBe(0);
    });

    it('removes executable HTML while preserving supported rich text on create', async () => {
        const payload = [
            '<h2>Welcome</h2>',
            '<img src=x onerror="alert(1)">',
            '<script>alert(2)</script>',
            '<a href="javascript:alert(3)" onclick="alert(4)">bad link</a>',
            '<strong>Safe formatting</strong>'
        ].join('');

        const res = await request(app)
            .post('/location')
            .set('Authorization', adminToken())
            .field({ ...safeLocationFields, description: payload });

        expect(res.status).toBe(201);
        expect(res.body.location.description).toContain('<h2>Welcome</h2>');
        expect(res.body.location.description).toContain('<strong>Safe formatting</strong>');
        expect(res.body.location.description).not.toMatch(/<script|<img|onerror|onclick|javascript:/i);
    });

    it('sanitizes descriptions when an existing location is updated', async () => {
        const location = await Location.create({
            name: 'Existing attraction',
            description: '<p>Original</p>',
            image_url: [],
            google_map_url: 'https://maps.app.goo.gl/test',
            tags: ['Historic'],
            points: []
        });

        const res = await request(app)
            .put(`/location/${location._id}`)
            .set('Authorization', adminToken())
            .field({
                ...safeLocationFields,
                existingImages: JSON.stringify([]),
                description: '<p onmouseover="alert(1)">Updated</p><iframe src="https://evil.example"></iframe>'
            });

        expect(res.status).toBe(200);
        expect(res.body.location.description).toBe('<p>Updated</p>');
    });

    it('sanitizes legacy database content when it is read', async () => {
        const location = await Location.create({
            name: 'Legacy attraction',
            description: '<p>Legacy</p><svg onload="alert(1)"></svg>',
            image_url: [],
            google_map_url: 'https://maps.app.goo.gl/test',
            tags: ['Historic'],
            points: []
        });

        const res = await request(app).get(`/location/${location._id}`);

        expect(res.status).toBe(200);
        expect(res.body.description).toBe('<p>Legacy</p>');
    });
});
