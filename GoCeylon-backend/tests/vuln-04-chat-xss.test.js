jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn(() => ({
        getGenerativeModel: jest.fn(() => ({
            startChat: jest.fn(() => ({
                sendMessage: jest.fn(async () => ({
                    response: {
                        text: () => '<img src=x onerror="alert(1)">'
                    }
                }))
            }))
        }))
    }))
}));

const request = require('supertest');
const app = require('../app');

describe('chat XSS response handling', () => {
    it('returns model output as JSON rather than an HTML response', async () => {
        const res = await request(app)
            .post('/api/chat/chat')
            .send({ message: 'Tell me about Sri Lanka' });

        expect(res.status).toBe(200);
        expect(res.type).toBe('application/json');
        expect(res.body.response).toBe('<img src=x onerror="alert(1)">');
    });

    it('rejects malformed history instead of reflecting arbitrary request objects', async () => {
        const res = await request(app)
            .post('/api/chat/chat')
            .send({ message: 'Hello', history: '<script>alert(1)</script>' });

        expect(res.status).toBe(400);
        expect(res.type).toBe('application/json');
        expect(res.body).toEqual({ error: 'History must be an array' });
    });

    it('limits message length before calling the model', async () => {
        const res = await request(app)
            .post('/api/chat/chat')
            .send({ message: 'a'.repeat(2001) });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: 'Message is too long' });
    });
});
