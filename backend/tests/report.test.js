const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Petition = require('../src/models/petition.model');
const Signature = require('../src/models/signature.model');
const Poll = require('../src/models/poll.model');
const Vote = require('../src/models/vote.model');
const OfficialResponse = require('../src/models/official-response.model');

let mongoServer;
let citizenToken;
let officialToken;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_jwt_secret_key_milestone_4_report';
  process.env.JWT_EXPIRES_IN = '1h';

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
  await Petition.deleteMany({});
  await Signature.deleteMany({});
  await Poll.deleteMany({});
  await Vote.deleteMany({});
  await OfficialResponse.deleteMany({});

  // Setup citizen
  const citizenRes = await request(app).post('/api/auth/register').send({
    name: 'Citizen Report User',
    email: 'reporter.citizen@civix.org',
    password: 'Password123!',
    role: 'citizen',
    location: { city: 'Bengaluru', state: 'Karnataka' }
  });
  citizenToken = citizenRes.body.data.token;
  const citizenUser = citizenRes.body.data.user;

  // Setup official
  const officialRes = await request(app).post('/api/auth/register').send({
    name: 'Official Reporter',
    email: 'reporter.official@gov.org',
    password: 'Password123!',
    role: 'official',
    location: { city: 'Bengaluru', state: 'Karnataka' }
  });
  officialToken = officialRes.body.data.token;
  const officialUser = officialRes.body.data.user;

  // Seed sample petition in current month
  const p1 = await Petition.create({
    title: 'Clean Up Bellandur Lake Foam and Inflows',
    description: 'Comprehensive civic action to prevent untreated effluents from entering the water body.',
    category: 'Environment',
    location: { city: 'Bengaluru', state: 'Karnataka' },
    creator: citizenUser._id,
    status: 'under_review',
    signaturesCount: 5
  });

  // Seed signature
  await Signature.create({
    petition: p1._id,
    user: citizenUser._id
  });

  // Seed poll
  const poll = await Poll.create({
    title: 'Should public transport be free on ozone-alert days?',
    category: 'Transportation',
    options: [
      { text: 'Yes', votesCount: 2 },
      { text: 'No', votesCount: 1 }
    ],
    totalVotes: 3,
    location: { city: 'Bengaluru', state: 'Karnataka' },
    createdBy: citizenUser._id,
    status: 'active'
  });

  // Seed votes
  await Vote.create({
    poll: poll._id,
    user: citizenUser._id,
    optionId: poll.options[0]._id
  });

  // Seed official response
  await OfficialResponse.create({
    petition: p1._id,
    official: officialUser._id,
    comment: 'Environmental board has started testing water samples.',
    previousStatus: 'active',
    newStatus: 'under_review',
    department: 'State Pollution Control Board'
  });
});

describe('Civix Milestone 4: Monthly Civic Engagement Reports & CSV Export API Tests', () => {
  describe('1. Monthly Report Generation (GET /api/reports/monthly)', () => {
    it('should generate monthly report with default current month/year metrics', async () => {
      const res = await request(app).get('/api/reports/monthly');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();

      const { period, summary, petitions, polls, officialResponses } = res.body.data;
      expect(period.month).toBeDefined();
      expect(period.year).toBeDefined();

      expect(summary.totalPetitions).toBe(1);
      expect(summary.totalSignatures).toBe(1);
      expect(summary.totalPolls).toBe(1);
      expect(summary.totalVotes).toBe(1);
      expect(summary.totalOfficialResponses).toBe(1);
      expect(summary.totalEngagementActivities).toBe(5);

      expect(petitions.byStatus.under_review).toBe(1);
      expect(petitions.byCategory.Environment).toBe(1);
      expect(petitions.byCity.Bengaluru).toBe(1);

      expect(polls.byCategory.Transportation).toBe(1);
      expect(polls.byStatus.active).toBe(1);

      expect(officialResponses.byNewStatus.under_review).toBe(1);
    });

    it('should filter monthly report by month and year query parameters', async () => {
      const now = new Date();
      const currentMonth = now.getUTCMonth() + 1;
      const currentYear = now.getUTCFullYear();

      const res = await request(app).get(
        `/api/reports/monthly?month=${currentMonth}&year=${currentYear}`
      );

      expect(res.status).toBe(200);
      expect(res.body.data.summary.totalPetitions).toBe(1);

      // Query past period with no activity
      const pastRes = await request(app).get(
        `/api/reports/monthly?month=1&year=2020`
      );

      expect(pastRes.status).toBe(200);
      expect(pastRes.body.data.summary.totalEngagementActivities).toBe(0);
      expect(pastRes.body.data.summary.totalPetitions).toBe(0);
    });

    it('should filter monthly report by locality city', async () => {
      const res1 = await request(app).get('/api/reports/monthly?city=Bengaluru');
      expect(res1.status).toBe(200);
      expect(res1.body.data.summary.totalPetitions).toBe(1);

      const res2 = await request(app).get('/api/reports/monthly?city=Delhi');
      expect(res2.status).toBe(200);
      expect(res2.body.data.summary.totalPetitions).toBe(0);
    });

    it('should reject invalid month (e.g. month=13) with 400 Bad Request', async () => {
      const res = await request(app).get('/api/reports/monthly?month=13');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toMatch(/between 1 and 12/i);
    });

    it('should reject invalid year (e.g. year=1995) with 400 Bad Request', async () => {
      const res = await request(app).get('/api/reports/monthly?year=1995');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toMatch(/between 2000 and 2100/i);
    });
  });

  describe('2. Exportable Monthly Report as CSV (GET /api/reports/monthly/export)', () => {
    it('should stream downloadable CSV report with proper headers and content', async () => {
      const res = await request(app).get('/api/reports/monthly/export');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/csv/i);
      expect(res.headers['content-disposition']).toMatch(/attachment; filename="civic-engagement-report-/i);

      const csvContent = res.text;
      expect(csvContent).toContain('Civix Digital Civic Engagement Monthly Report');
      expect(csvContent).toContain('EXECUTIVE SUMMARY');
      expect(csvContent).toContain('Total Petitions Created');
      expect(csvContent).toContain('PETITIONS BY STATUS');
      expect(csvContent).toContain('PETITIONS BY CATEGORY');
      expect(csvContent).toContain('Environment');
      expect(csvContent).toContain('POLLS BY STATUS & CATEGORY');
      expect(csvContent).toContain('OFFICIAL RESPONSES BY RESOLUTION STATUS');
    });

    it('should allow filtering the exported CSV by month and year', async () => {
      const now = new Date();
      const currentMonth = now.getUTCMonth() + 1;
      const currentYear = now.getUTCFullYear();

      const res = await request(app).get(
        `/api/reports/monthly/export?month=${currentMonth}&year=${currentYear}`
      );

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/csv/i);
      expect(res.text).toContain(`"Period",`);
    });
  });
});
