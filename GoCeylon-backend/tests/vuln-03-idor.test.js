// VULN-03: Insecure Direct Object Reference (OWASP A01:2021, CWE-639 / CWE-915)
// Each test mirrors one of the ZAP Requester attacks from the report.

jest.mock('nodemailer', () => ({
    createTransport: () => ({ sendMail: jest.fn().mockResolvedValue({}) }),
}));

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Tourist = require('../models/UserModel');
const Guide = require('../models/GuideModel');
const Booking = require('../models/BookingModel');
const Rfid = require('../models/RfidModel');
const { tokenFor } = require('./helpers');

const touristData = (name, email) => ({
    name,
    email,
    password: 'TouristPass123!',
    destination: 'Beach',
    traveling_with: 'Solo',
    accommodations: true,
    tour_guide: true,
});

let alice, bob, guide, bobBooking;
let aliceToken, bobToken, guideToken, adminToken;

beforeEach(async () => {
    alice = await Tourist.create(touristData('Alice Smith', 'tourist1@gmail.com'));
    bob = await Tourist.create(touristData('Bob Johnson', 'tourist2@gmail.com'));
    guide = await Guide.create({
        g_name: 'Kasun Perera',
        g_dob: new Date('1990-01-01'),
        email: 'guide@goceylon.com',
        password: 'GuidePass123!',
        language: ['English'],
        gender: 'Male',
        price: 50,
        location: [new mongoose.Types.ObjectId()],
        contact_number: '+94770000000',
        image: 'guide.jpg',
    });
    bobBooking = await Booking.create({
        b_date: '2026-10-15',
        b_time: '09:00',
        b_location: 'Sigiriya',
        b_user: bob._id,
        b_guide: guide._id,
        price: 50,
    });

    aliceToken = tokenFor(alice, 'tourist');
    bobToken = tokenFor(bob, 'tourist');
    guideToken = tokenFor(guide, 'guide');
    adminToken = tokenFor({ _id: new mongoose.Types.ObjectId(), email: 'admin@goceylon.com' }, 'admin');
});

describe('VULN-03 /users', () => {
    it('rejects reading a profile without a token (attack 1)', async () => {
        const res = await request(app).get(`/users/${bob._id}`);
        expect(res.status).toBe(401);
    });

    it("forbids a tourist from reading another tourist's profile", async () => {
        const res = await request(app).get(`/users/${bob._id}`).set('Authorization', aliceToken);
        expect(res.status).toBe(403);
    });

    it('lets a tourist read their own profile', async () => {
        const res = await request(app).get(`/users/${alice._id}`).set('Authorization', aliceToken);
        expect(res.status).toBe(200);
        expect(res.body.email).toBe('tourist1@gmail.com');
    });

    it('forbids a tourist from listing every user (attack 2)', async () => {
        const res = await request(app).get('/users').set('Authorization', aliceToken);
        expect(res.status).toBe(403);
    });

    it('lets an admin list users and read any profile', async () => {
        expect((await request(app).get('/users').set('Authorization', adminToken)).status).toBe(200);
        expect((await request(app).get(`/users/${bob._id}`).set('Authorization', adminToken)).status).toBe(200);
    });

    it("forbids a tourist from editing another tourist's profile (attack 3)", async () => {
        const res = await request(app)
            .put(`/users/${bob._id}`)
            .set('Authorization', aliceToken)
            .send({ name: 'Hacked by Alice' });
        expect(res.status).toBe(403);
        expect((await Tourist.findById(bob._id)).name).toBe('Bob Johnson');
    });

    it('lets a tourist edit their own profile', async () => {
        const res = await request(app)
            .put(`/users/${alice._id}`)
            .set('Authorization', aliceToken)
            .send({ name: 'Alice Updated' });
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Alice Updated');
    });

    it("forbids a tourist from deleting another tourist's account (attack 8)", async () => {
        const res = await request(app).delete(`/users/${bob._id}`).set('Authorization', aliceToken);
        expect(res.status).toBe(403);
        expect(await Tourist.findById(bob._id)).not.toBeNull();
    });
});

describe('VULN-03 /booking', () => {
    const newBooking = () => ({
        b_date: '2026-11-01',
        b_time: '10:00',
        b_location: 'Galle Fort',
        b_user: String(bob._id),
        b_guide: String(guide._id),
        price: 50,
        status: 'confirmed',
    });

    it('rejects creating a booking without a token (attack 4)', async () => {
        const res = await request(app).post('/booking').send(newBooking());
        expect(res.status).toBe(401);
    });

    it('books for the logged-in tourist, ignoring b_user and status in the body', async () => {
        const res = await request(app).post('/booking').set('Authorization', aliceToken).send(newBooking());
        expect(res.status).toBe(201);
        expect(String(res.body.booking.b_user)).toBe(String(alice._id));
        expect(res.body.booking.status).toBe('pending');
    });

    it("rejects reading a user's bookings without a token (attack 5)", async () => {
        const res = await request(app).get(`/booking/user/${bob._id}`);
        expect(res.status).toBe(401);
    });

    it("forbids a tourist from reading another tourist's bookings", async () => {
        const res = await request(app).get(`/booking/user/${bob._id}`).set('Authorization', aliceToken);
        expect(res.status).toBe(403);
    });

    it('lets a tourist read their own bookings', async () => {
        const res = await request(app).get(`/booking/user/${bob._id}`).set('Authorization', bobToken);
        expect(res.status).toBe(200);
        expect(res.body.bookings).toHaveLength(1);
    });

    it('restricts listing every booking to admins', async () => {
        expect((await request(app).get('/booking')).status).toBe(401);
        expect((await request(app).get('/booking').set('Authorization', aliceToken)).status).toBe(403);
        expect((await request(app).get('/booking').set('Authorization', adminToken)).status).toBe(200);
    });

    it("forbids a tourist from reading another tourist's booking by id", async () => {
        const res = await request(app).get(`/booking/${bobBooking._id}`).set('Authorization', aliceToken);
        expect(res.status).toBe(403);
    });

    it('lets the booking owner and the assigned guide read the booking', async () => {
        expect((await request(app).get(`/booking/${bobBooking._id}`).set('Authorization', bobToken)).status).toBe(200);
        expect((await request(app).get(`/booking/${bobBooking._id}`).set('Authorization', guideToken)).status).toBe(200);
    });

    it("forbids a tourist from updating another tourist's booking (attack 6)", async () => {
        const res = await request(app)
            .put(`/booking/update/${bobBooking._id}`)
            .set('Authorization', aliceToken)
            .send({ price: 0, status: 'confirmed' });
        expect(res.status).toBe(403);
    });

    it('ignores price, status and owner changes from the booking owner (mass assignment)', async () => {
        const res = await request(app)
            .put(`/booking/update/${bobBooking._id}`)
            .set('Authorization', bobToken)
            .send({ b_date: '2026-12-01', price: 0, status: 'confirmed', b_user: String(alice._id) });
        expect(res.status).toBe(200);

        const saved = await Booking.findById(bobBooking._id);
        expect(saved.b_date).toBe('2026-12-01');
        expect(saved.price).toBe(50);
        expect(saved.status).toBe('pending');
        expect(String(saved.b_user)).toBe(String(bob._id));
    });

    it("forbids a tourist from deleting another tourist's booking", async () => {
        const res = await request(app).delete(`/booking/delete/${bobBooking._id}`).set('Authorization', aliceToken);
        expect(res.status).toBe(403);
        expect(await Booking.findById(bobBooking._id)).not.toBeNull();
    });

    it("forbids a tourist from downloading another tourist's receipt", async () => {
        const res = await request(app).get(`/booking/receipt/${bobBooking._id}`).set('Authorization', aliceToken);
        expect(res.status).toBe(403);
    });
});

describe('VULN-03 /rfid', () => {
    let card;

    beforeEach(async () => {
        card = await Rfid.create({
            rfidTagCode: 'RFID-0001',
            fullName: 'Bob Johnson',
            email: 'tourist2@gmail.com',
            phoneNumber: '+94771234567',
            nationality: 'British',
            passportNumber: 'P12345678',
            walletAmount: 100,
            birthday: '1990-05-10',
            gender: 'Male',
            address: '12 Galle Road, Colombo',
        });
    });

    it('rejects reading RFID records (passport data) without a token (attack 7)', async () => {
        expect((await request(app).get('/rfid')).status).toBe(401);
        expect((await request(app).get(`/rfid/${card._id}`)).status).toBe(401);
    });

    it('forbids tourists from reading RFID records', async () => {
        expect((await request(app).get('/rfid').set('Authorization', aliceToken)).status).toBe(403);
    });

    it('lets an admin read RFID records', async () => {
        expect((await request(app).get('/rfid').set('Authorization', adminToken)).status).toBe(200);
    });
});
