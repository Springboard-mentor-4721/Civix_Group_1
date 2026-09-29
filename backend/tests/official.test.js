const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Petition = require('../src/models/petition.model');
const OfficialResponse = require('../src/models/official-response.model');

let mongoServer;
let citizenUser;
let citizenToken;
let officialUser;
let officialToken;
let otherOfficialUser;
let otherOfficialToken;
let bengaluruPetition1;
let bengaluruPetition2;
let mysuruPetition;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_jwt_secret_key_milestone_4_official';
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
  await OfficialResponse.deleteMany({});

  // 1. Citizen
  const citizenRes = await request(app).post('/api/auth/register').send({
    name: 'Citizen Jane',
    email: 'citizen.jane@civix.org',
    password: 'Password123!',
    role: 'citizen',
    location: { city: 'Bengaluru', state: 'Karnataka', pincode: '560001' }
  });
  citizenUser = citizenRes.body.data.user;
  citizenToken = citizenRes.body.data.token;

  // 2. Official in Bengaluru
  const officialRes = await request(app).post('/api/auth/register').send({
    name: 'Officer Bengaluru',
    email: 'officer.blr@gov.org',
    password: 'Password123!',
    role: 'official',
    location: { city: 'Bengaluru', state: 'Karnataka' }
  });
  officialUser = officialRes.body.data.user;
  officialToken = officialRes.body.data.token;

  // 3. Official in Mysuru
  const otherOfficialRes = await request(app).post('/api/auth/register').send({
    name: 'Officer Mysuru',
    email: 'officer.mys@gov.org',
    password: 'Password123!',
    role: 'official',
    location: { city: 'Mysuru', state: 'Karnataka' }
  });
  otherOfficialUser = otherOfficialRes.body.data.user;
  otherOfficialToken = otherOfficialRes.body.data.token;

  // 4. Petitions
  const p1Res = await request(app)
    .post('/api/petitions')
    .set('Authorization', `Bearer ${citizenToken}`)
    .send({
      title: 'Fix Severe Potholes on MG Road Bengaluru',
      description: 'The MG Road stretch near the metro station has numerous deep potholes hazardous for two-wheelers.',
      category: 'Infrastructure',
      location: { city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
      targetSignatures: 150
    });
  bengaluruPetition1 = p1Res.body.data.petition;

  const p2Res = await request(app)
    .post('/api/petitions')
    .set('Authorization', `Bearer ${citizenToken}`)
    .send({
      title: 'Install Air Quality Sensors in Whitefield Bengaluru',
      description: 'Industrial and vehicular emissions require continuous public monitoring in Whitefield.',
      category: 'Environment',
      location: { city: 'Bengaluru', state: 'Karnataka', pincode: '560066' },
      targetSignatures: 200
    });
  bengaluruPetition2 = p2Res.body.data.petition;

  const p3Res = await request(app)
    .post('/api/petitions')
    .set('Authorization', `Bearer ${citizenToken}`)
    .send({
      title: 'Heritage Lake Restoration in Mysuru',
      description: 'Karanji Lake requires desilting and water quality improvements before the monsoon season.',
      category: 'Environment',
      location: { city: 'Mysuru', state: 'Karnataka', pincode: '570010' },
      targetSignatures: 300
    });
  mysuruPetition = p3Res.body.data.petition;
});

describe('Civix Milestone 4: Official Dashboard & Petition Responses API Tests', () => {
  describe('1. Official Petition Locality Dashboard (GET /api/official/petitions)', () => {
    it('should allow authorized official to view petitions in their locality by default', async () => {
      const res = await request(app)
        .get('/api/official/petitions')
        .set('Authorization', `Bearer ${officialToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.petitions).toHaveLength(2);
      expect(res.body.data.petitions.map((p) => p.title)).toContain(
        'Fix Severe Potholes on MG Road Bengaluru'
      );
      expect(res.body.data.petitions.map((p) => p.title)).toContain(
        'Install Air Quality Sensors in Whitefield Bengaluru'
      );
      expect(res.body.data.officialJurisdiction.city).toBe('Bengaluru');
    });

    it('should allow official to filter petitions by specific city override', async () => {
      const res = await request(app)
        .get('/api/official/petitions?city=Mysuru')
        .set('Authorization', `Bearer ${officialToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.petitions).toHaveLength(1);
      expect(res.body.data.petitions[0].title).toBe('Heritage Lake Restoration in Mysuru');
    });

    it('should filter official dashboard by category and status', async () => {
      const res = await request(app)
        .get('/api/official/petitions?category=Environment')
        .set('Authorization', `Bearer ${officialToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.petitions).toHaveLength(1);
      expect(res.body.data.petitions[0].title).toBe(
        'Install Air Quality Sensors in Whitefield Bengaluru'
      );
    });

    it('should search official dashboard by keyword', async () => {
      const res = await request(app)
        .get('/api/official/petitions?search=potholes')
        .set('Authorization', `Bearer ${officialToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.petitions).toHaveLength(1);
      expect(res.body.data.petitions[0].title).toBe('Fix Severe Potholes on MG Road Bengaluru');
    });

    it('should reject citizen access to official dashboard with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/official/petitions')
        .set('Authorization', `Bearer ${citizenToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/access denied/i);
    });

    it('should reject unauthenticated access with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/official/petitions');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Official Response to Petitions (POST /api/official/petitions/:id/response)', () => {
    it('should allow official to submit a response and update petition status to under_review', async () => {
      const res = await request(app)
        .post(`/api/official/petitions/${bengaluruPetition1._id}/response`)
        .set('Authorization', `Bearer ${officialToken}`)
        .send({
          comment: 'We have dispatched an inspection team to MG Road to assess road repair urgency.',
          status: 'under_review',
          department: 'Public Works Department (PWD)',
          officialTitle: 'Executive Road Engineer'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.officialResponse).toBeDefined();
      expect(res.body.data.officialResponse.comment).toMatch(/inspection team/i);
      expect(res.body.data.officialResponse.previousStatus).toBe('active');
      expect(res.body.data.officialResponse.newStatus).toBe('under_review');
      expect(res.body.data.officialResponse.department).toBe('Public Works Department (PWD)');
      expect(res.body.data.petition.status).toBe('under_review');

      // Verify DB persistence
      const inDb = await Petition.findById(bengaluruPetition1._id);
      expect(inDb.status).toBe('under_review');

      const responseInDb = await OfficialResponse.findOne({ petition: bengaluruPetition1._id });
      expect(responseInDb).not.toBeNull();
      expect(responseInDb.official.toString()).toBe(officialUser._id);
    });

    it('should allow official to submit multiple status transitions over time', async () => {
      // 1. Move to under_review
      await request(app)
        .post(`/api/official/petitions/${bengaluruPetition1._id}/response`)
        .set('Authorization', `Bearer ${officialToken}`)
        .send({
          comment: 'Petition acknowledged and assigned to zone engineer.',
          status: 'under_review'
        });

      // 2. Move to closed with resolution
      const res2 = await request(app)
        .post(`/api/official/petitions/${bengaluruPetition1._id}/response`)
        .set('Authorization', `Bearer ${officialToken}`)
        .send({
          comment: 'Pothole asphalt filling completed on MG Road stretch.',
          status: 'closed'
        });

      expect(res2.status).toBe(201);
      expect(res2.body.data.officialResponse.previousStatus).toBe('under_review');
      expect(res2.body.data.officialResponse.newStatus).toBe('closed');
      expect(res2.body.data.petition.status).toBe('closed');

      // Check responses count
      const historyRes = await request(app)
        .get(`/api/official/petitions/${bengaluruPetition1._id}/responses`)
        .set('Authorization', `Bearer ${officialToken}`);

      expect(historyRes.status).toBe(200);
      expect(historyRes.body.data.totalResponses).toBe(2);
    });

    it('should reject citizen attempt to submit official response (403)', async () => {
      const res = await request(app)
        .post(`/api/official/petitions/${bengaluruPetition1._id}/response`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({
          comment: 'Attempting official response as citizen',
          status: 'under_review'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/access denied/i);
    });

    it('should reject response with empty or too short comment (400)', async () => {
      const res = await request(app)
        .post(`/api/official/petitions/${bengaluruPetition1._id}/response`)
        .set('Authorization', `Bearer ${officialToken}`)
        .send({
          comment: 'Hi',
          status: 'under_review'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toMatch(/between 5 and 2000 characters/i);
    });

    it('should reject response for non-existent petition ID (404)', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/official/petitions/${fakeId}/response`)
        .set('Authorization', `Bearer ${officialToken}`)
        .send({
          comment: 'Valid comment for non-existent petition',
          status: 'under_review'
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/petition not found/i);
    });
  });

  describe('3. Official Status Update & Direct Route Aliasing', () => {
    it('should allow official to update status via PATCH /api/official/petitions/:id/status', async () => {
      const res = await request(app)
        .patch(`/api/official/petitions/${bengaluruPetition2._id}/status`)
        .set('Authorization', `Bearer ${officialToken}`)
        .send({
          status: 'under_review',
          comment: 'Procurement initiated for 10 air quality sensor units.'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.petition.status).toBe('under_review');
      expect(res.body.data.officialResponse.comment).toMatch(/Procurement initiated/i);
    });

    it('should support response history retrieval through /api/petitions/:id/responses', async () => {
      await request(app)
        .post(`/api/official/petitions/${bengaluruPetition1._id}/response`)
        .set('Authorization', `Bearer ${officialToken}`)
        .send({
          comment: 'Official response via main official endpoint',
          status: 'under_review'
        });

      const res = await request(app)
        .get(`/api/petitions/${bengaluruPetition1._id}/responses`)
        .set('Authorization', `Bearer ${citizenToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalResponses).toBe(1);
      expect(res.body.data.responses[0].comment).toMatch(/Official response/i);
      expect(res.body.data.responses[0].official.name).toBe('Officer Bengaluru');
    });
  });
});
