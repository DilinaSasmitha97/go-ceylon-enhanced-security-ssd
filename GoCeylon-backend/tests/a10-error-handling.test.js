// A10: Mishandling of exceptional conditions / information exposure through
// error messages (OWASP A10:2025 & A05:2021; CWE-209, CWE-550).
// Error responses must not reveal stack traces, file paths or database internals.

const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const app = require('../app');
const errorHandler = require('../middleware/errorHandler');
const Rfid = require('../models/RfidModel');
const { tokenFor } = require('./helpers');

const LEAK_PATTERNS = [
    /at .+\(.+:\d+:\d+\)/,      // stack trace frame
    /node_modules/,
    /[A-Z]:\\|\/home\//,        // file system paths
    /E11000|duplicate key/i,    // MongoDB duplicate-key internals
    /Cast to ObjectId failed/,  // Mongoose cast internals (reveals model names)
    /SyntaxError|Unexpected token|Unexpected end of JSON/,
];

const expectNoLeak = (res) => {
    for (const pattern of LEAK_PATTERNS) {
        expect(res.text).not.toMatch(pattern);
    }
};

const tourist = (email) => ({
    name: 'Leak Test',
    email,
    password: 'TouristPass123!',
    destination: 'Beach',
    traveling_with: 'Solo',
    accommodations: true,
    tour_guide: true,
});

describe('A10 central error handling', () => {
    it('answers malformed JSON with a generic JSON error, not a stack trace page', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .set('Content-Type', 'application/json')
            .send('{"email": "a@b.c", ');
        expect(res.status).toBe(400);
        expect(res.headers['content-type']).toMatch(/application\/json/);
        expectNoLeak(res);
    });

    it('answers unknown routes with a JSON 404', async () => {
        const res = await request(app).get('/this-route-does-not-exist');
        expect(res.status).toBe(404);
        expect(res.headers['content-type']).toMatch(/application\/json/);
        expect(res.body.message).toBe('Not found');
    });

    it('hides unexpected errors behind a generic 500 message', async () => {
        const probe = express();
        probe.get('/boom', () => {
            throw new Error('secret internal detail at C:\\app\\db.js:42:7');
        });
        probe.use(errorHandler);

        const res = await request(probe).get('/boom');
        expect(res.status).toBe(500);
        expect(res.text).not.toContain('secret internal detail');
        expectNoLeak(res);
    });
});

describe('A10 controller error messages', () => {
    it('does not reveal MongoDB duplicate-key details when an email is reused', async () => {
        await request(app).post('/users').send(tourist('dup@example.com'));
        const res = await request(app).post('/users').send(tourist('dup@example.com'));

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('A record with this value already exists');
        expectNoLeak(res);
    });

    it('does not reveal Mongoose cast errors for malformed ids', async () => {
        const admin = tokenFor({ _id: new mongoose.Types.ObjectId(), email: 'admin@goceylon.com' }, 'admin');
        const res = await request(app).get('/users/not-an-object-id').set('Authorization', admin);
        expect(res.status).toBe(500);
        expectNoLeak(res);
    });

    it('does not reveal cast errors on admin RFID lookups either', async () => {
        const admin = tokenFor({ _id: new mongoose.Types.ObjectId(), email: 'admin@goceylon.com' }, 'admin');
        const res = await request(app).get('/rfid/not-an-object-id').set('Authorization', admin);
        expect(res.body.success).toBe(false);
        expectNoLeak(res);
    });

    it('still returns helpful field validation messages', async () => {
        const res = await request(app).post('/users').send({ ...tourist('enum@example.com'), destination: 'Moon' });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/destination/);
        expectNoLeak(res);
    });

    it('keeps normal successful responses unchanged', async () => {
        await Rfid.create({
            rfidTagCode: 'RFID-A10',
            fullName: 'Test User',
            email: 'rfid@example.com',
            phoneNumber: '+94770000001',
            nationality: 'Sri Lankan',
            passportNumber: 'N1234567',
            walletAmount: 10,
            birthday: '1995-01-01',
            gender: 'Other',
            address: 'Colombo',
        });
        const admin = tokenFor({ _id: new mongoose.Types.ObjectId(), email: 'admin@goceylon.com' }, 'admin');
        const res = await request(app).get('/rfid').set('Authorization', admin);
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
    });
});
