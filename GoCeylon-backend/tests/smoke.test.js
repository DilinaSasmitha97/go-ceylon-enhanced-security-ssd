const request = require('supertest');
const app = require('../app');

describe('test infrastructure', () => {
    it('serves the app without a real database or open port', async () => {
        const res = await request(app).get('/location');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ locations: [] });
    });
});
