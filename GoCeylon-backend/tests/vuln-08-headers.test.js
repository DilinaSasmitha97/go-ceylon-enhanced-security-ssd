// VULN-08: Security misconfiguration - missing security headers, clickjacking, CORS
// (OWASP A05:2021; CWE-1021, CWE-693, CWE-200, CWE-942)
// Mirrors the ZAP baseline scan and curl checks from the report.

process.env.CORS_ORIGINS = 'http://localhost:5173,https://goceylon.example';

const request = require('supertest');
const app = require('../app');

const ALLOWED_ORIGIN = 'http://localhost:5173';
const EVIL_ORIGIN = 'https://evil.example';

describe('VULN-08 security headers', () => {
    let res;

    beforeAll(async () => {
        res = await request(app).get('/location');
    });

    it('does not reveal the framework via X-Powered-By', () => {
        expect(res.headers['x-powered-by']).toBeUndefined();
    });

    it('forbids framing (anti-clickjacking)', () => {
        expect(res.headers['x-frame-options']).toBe('DENY');
        expect(res.headers['content-security-policy']).toContain("frame-ancestors 'none'");
    });

    it('sends a restrictive Content-Security-Policy with fallback directives', () => {
        const csp = res.headers['content-security-policy'];
        expect(csp).toContain("default-src 'none'");
        expect(csp).toContain("base-uri 'none'");
        expect(csp).toContain("form-action 'none'");
    });

    it('stops MIME sniffing', () => {
        expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('sets a Permissions-Policy', () => {
        expect(res.headers['permissions-policy']).toBeDefined();
    });

    it('marks API responses as not cacheable', () => {
        expect(res.headers['cache-control']).toContain('no-store');
    });

    it('still lets the frontend load uploaded images cross-origin', async () => {
        const upload = await request(app).get('/uploads/does-not-exist.png');
        expect(upload.headers['cross-origin-resource-policy']).toBe('cross-origin');
        expect(upload.headers['x-content-type-options']).toBe('nosniff');
    });
});

describe('VULN-08 CORS', () => {
    it('refuses an unknown origin cleanly instead of crashing with a 500', async () => {
        const res = await request(app).get('/location').set('Origin', EVIL_ORIGIN);
        expect(res.status).toBe(200);
        expect(res.headers['access-control-allow-origin']).toBeUndefined();
        expect(res.text).not.toContain('Not allowed by CORS');
    });

    it('allows a configured frontend origin with credentials', async () => {
        const res = await request(app).get('/location').set('Origin', ALLOWED_ORIGIN);
        expect(res.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
        expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('reads the allowlist from CORS_ORIGINS (no hardcoded dev origins)', async () => {
        const prod = await request(app).get('/location').set('Origin', 'https://goceylon.example');
        expect(prod.headers['access-control-allow-origin']).toBe('https://goceylon.example');

        const hardcoded = await request(app).get('/location').set('Origin', 'http://localhost:3000');
        expect(hardcoded.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('limits preflight to the methods and headers the app uses', async () => {
        const res = await request(app)
            .options('/users/123')
            .set('Origin', ALLOWED_ORIGIN)
            .set('Access-Control-Request-Method', 'PUT')
            .set('Access-Control-Request-Headers', 'Authorization, Content-Type');
        expect(res.status).toBe(204);
        expect(res.headers['access-control-allow-methods']).toBe('GET,POST,PUT,DELETE');
        expect(res.headers['access-control-allow-headers']).toBe('Content-Type,Authorization');
    });
});
