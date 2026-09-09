const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Petition = require('../src/models/petition.model');
const Poll = require('../src/models/poll.model');
const Vote = require('../src/models/vote.model');

let mongoServer;
let citizen1;
let token1;
let citizen2;
let token2;
let citizen3;
let token3;
let officialUser;
let officialToken;
let testPetition;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_jwt_secret_key_milestone_3';
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
  await Poll.deleteMany({});
  await Vote.deleteMany({});

  // Setup citizen 1
  const citizen1Res = await request(app).post('/api/auth/register').send({
    name: 'Citizen One',
    email: 'citizen1@civix.org',
    password: 'Password123!',
    role: 'citizen',
    location: { city: 'Bengaluru', state: 'Karnataka', pincode: '560001' }
  });
  citizen1 = citizen1Res.body.data.user;
  token1 = citizen1Res.body.data.token;

  // Setup citizen 2
  const citizen2Res = await request(app).post('/api/auth/register').send({
    name: 'Citizen Two',
    email: 'citizen2@civix.org',
    password: 'Password123!',
    role: 'citizen',
    location: { city: 'Bengaluru', state: 'Karnataka', pincode: '560002' }
  });
  citizen2 = citizen2Res.body.data.user;
  token2 = citizen2Res.body.data.token;

  // Setup citizen 3
  const citizen3Res = await request(app).post('/api/auth/register').send({
    name: 'Citizen Three',
    email: 'citizen3@civix.org',
    password: 'Password123!',
    role: 'citizen',
    location: { city: 'Mysuru', state: 'Karnataka', pincode: '570001' }
  });
  citizen3 = citizen3Res.body.data.user;
  token3 = citizen3Res.body.data.token;

  // Setup official
  const officialRes = await request(app).post('/api/auth/register').send({
    name: 'Official Officer',
    email: 'officer@gov.org',
    password: 'Password123!',
    role: 'official',
    location: { city: 'Bengaluru', state: 'Karnataka' }
  });
  officialUser = officialRes.body.data.user;
  officialToken = officialRes.body.data.token;

  // Setup a test petition
  const petitionRes = await request(app)
    .post('/api/petitions')
    .set('Authorization', `Bearer ${token1}`)
    .send({
      title: 'Construct Solar-Powered Bus Shelters in Koramangala',
      description: 'Public transit commuters require sheltered waiting areas with solar lighting and phone charging stations.',
      category: 'Transportation',
      location: { city: 'Bengaluru', state: 'Karnataka', pincode: '560034' },
      targetSignatures: 200
    });
  testPetition = petitionRes.body.data.petition;
});

describe('Civix Milestone 3: Polls, Public Voting & Live Sentiment Tracking API Tests', () => {
  const validPollPayload = {
    title: 'Should the city implement a 24/7 bus lane on Outer Ring Road?',
    description: 'We are gathering citizen opinions on dedicated bus transit corridors to reduce traffic congestion.',
    category: 'Transportation',
    options: [
      'Yes, 24/7 dedicated lane',
      'Yes, but peak hours only',
      'No, it will increase car traffic'
    ],
    location: {
      city: 'Bengaluru',
      state: 'Karnataka',
      address: 'Outer Ring Road Corridor',
      pincode: '560103'
    }
  };

  describe('1. Poll Creation (POST /api/polls)', () => {
    it('should successfully create a new poll when authenticated with valid data', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const res = await request(app)
        .post('/api/polls')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          ...validPollPayload,
          endDate: futureDate,
          relatedPetition: testPetition._id
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.poll).toBeDefined();
      expect(res.body.data.poll.title).toBe(validPollPayload.title);
      expect(res.body.data.poll.category).toBe('Transportation');
      expect(res.body.data.poll.options).toHaveLength(3);
      expect(res.body.data.poll.options[0].text).toBe('Yes, 24/7 dedicated lane');
      expect(res.body.data.poll.options[0].votesCount).toBe(0);
      expect(res.body.data.poll.totalVotes).toBe(0);
      expect(res.body.data.poll.status).toBe('active');
      expect(res.body.data.poll.createdBy._id).toBe(citizen1._id);
      expect(res.body.data.poll.relatedPetition._id).toBe(testPetition._id);
    });

    it('should reject poll creation without authentication token (401)', async () => {
      const res = await request(app)
        .post('/api/polls')
        .send(validPollPayload);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/authentication token is required/i);
    });

    it('should reject poll creation with missing required fields (400)', async () => {
      const res = await request(app)
        .post('/api/polls')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          description: 'Missing title, category, options, location'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      const fields = res.body.errors.map((e) => e.field);
      expect(fields).toContain('title');
      expect(fields).toContain('category');
      expect(fields).toContain('options');
      expect(fields).toContain('location');
    });

    it('should reject poll creation with fewer than 2 options (400)', async () => {
      const res = await request(app)
        .post('/api/polls')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          ...validPollPayload,
          options: ['Single Option Only']
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toMatch(/at least 2 options/i);
    });

    it('should reject poll creation with empty or whitespace option text (400)', async () => {
      const res = await request(app)
        .post('/api/polls')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          ...validPollPayload,
          options: ['Valid Option 1', '   ']
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toMatch(/cannot be empty/i);
    });

    it('should reject poll creation with invalid category (400)', async () => {
      const res = await request(app)
        .post('/api/polls')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          ...validPollPayload,
          category: 'NonExistentCategory'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toMatch(/category must be one of/i);
    });

    it('should reject poll creation with end date in the past (400)', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const res = await request(app)
        .post('/api/polls')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          ...validPollPayload,
          endDate: pastDate
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toMatch(/future/i);
    });
  });

  describe('2. Get All Polls (GET /api/polls)', () => {
    beforeEach(async () => {
      // Create 3 sample polls
      await request(app)
        .post('/api/polls')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'Solar Panels in Public Parks',
          description: 'Proposal to install solar panels in Cubbon Park.',
          category: 'Environment',
          options: ['Support', 'Oppose', 'Need more info'],
          location: { city: 'Bengaluru', state: 'Karnataka' }
        });

      await request(app)
        .post('/api/polls')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          title: 'New Metro Line Extension to Whitefield',
          description: 'Feasibility survey on expanding metro line Phase 3.',
          category: 'Transportation',
          options: ['Immediate Priority', 'Medium Priority', 'Low Priority'],
          location: { city: 'Bengaluru', state: 'Karnataka' }
        });

      const closedRes = await request(app)
        .post('/api/polls')
        .set('Authorization', `Bearer ${token3}`)
        .send({
          title: 'Clean River Campaign in Mysuru',
          description: 'Survey on heritage river cleanup drive.',
          category: 'Sanitation',
          options: ['Yes', 'No'],
          location: { city: 'Mysuru', state: 'Karnataka' }
        });

      // Close third poll
      await Poll.findByIdAndUpdate(closedRes.body.data.poll._id, { status: 'closed' });
    });

    it('should retrieve list of active polls with pagination defaults', async () => {
      const res = await request(app).get('/api/polls');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.polls).toHaveLength(2);
      expect(res.body.data.pagination.total).toBe(2);
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(10);
    });

    it('should search polls by keyword in title and description', async () => {
      const res = await request(app).get('/api/polls?search=solar');

      expect(res.status).toBe(200);
      expect(res.body.data.polls).toHaveLength(1);
      expect(res.body.data.polls[0].title).toBe('Solar Panels in Public Parks');
    });

    it('should filter polls by category', async () => {
      const res = await request(app).get('/api/polls?category=Transportation');

      expect(res.status).toBe(200);
      expect(res.body.data.polls).toHaveLength(1);
      expect(res.body.data.polls[0].category).toBe('Transportation');
    });

    it('should filter polls by location city', async () => {
      const res = await request(app).get('/api/polls?city=Bengaluru');

      expect(res.status).toBe(200);
      expect(res.body.data.polls).toHaveLength(2);
    });

    it('should filter polls by status (including closed polls)', async () => {
      const res = await request(app).get('/api/polls?status=closed');

      expect(res.status).toBe(200);
      expect(res.body.data.polls).toHaveLength(1);
      expect(res.body.data.polls[0].title).toBe('Clean River Campaign in Mysuru');
    });

    it('should paginate poll listings correctly', async () => {
      const res = await request(app).get('/api/polls?limit=1&page=2');

      expect(res.status).toBe(200);
      expect(res.body.data.polls).toHaveLength(1);
      expect(res.body.data.pagination.page).toBe(2);
      expect(res.body.data.pagination.limit).toBe(1);
      expect(res.body.data.pagination.totalPages).toBe(2);
    });
  });

  describe('3. Current User Polls (GET /api/polls/my)', () => {
    it('should retrieve polls created by authenticated user', async () => {
      await request(app)
        .post('/api/polls')
        .set('Authorization', `Bearer ${token1}`)
        .send(validPollPayload);

      const res = await request(app)
        .get('/api/polls/my')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.polls).toHaveLength(1);
      expect(res.body.data.polls[0].createdBy._id).toBe(citizen1._id);
    });

    it('should reject unauthenticated request for /my polls (401)', async () => {
      const res = await request(app).get('/api/polls/my');
      expect(res.status).toBe(401);
    });
  });

  describe('4. Get Poll By ID (GET /api/polls/:id)', () => {
    let createdPoll;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/polls')
        .set('Authorization', `Bearer ${token1}`)
        .send(validPollPayload);
      createdPoll = res.body.data.poll;
    });

    it('should retrieve single poll details with options and vote counts', async () => {
      const res = await request(app).get(`/api/polls/${createdPoll._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.poll._id).toBe(createdPoll._id);
      expect(res.body.data.poll.options).toHaveLength(3);
      expect(res.body.data.poll.createdBy.name).toBe('Citizen One');
    });

    it('should return 404 for non-existent poll ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/polls/${nonExistentId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/poll not found/i);
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app).get('/api/polls/invalid-id-format');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toMatch(/invalid poll id format/i);
    });
  });

  describe('5. Voting on Polls (POST /api/polls/:id/vote)', () => {
    let pollId;
    let option1Id;
    let option2Id;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/polls')
        .set('Authorization', `Bearer ${token1}`)
        .send(validPollPayload);
      pollId = res.body.data.poll._id;
      option1Id = res.body.data.poll.options[0]._id;
      option2Id = res.body.data.poll.options[1]._id;
    });

    it('should allow authenticated user to vote for a valid option', async () => {
      const res = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ optionId: option1Id });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/vote recorded successfully/i);
      expect(res.body.data.vote).toBeDefined();
      expect(res.body.data.vote.optionId).toBe(option1Id);
      expect(res.body.data.poll.totalVotes).toBe(1);
      expect(res.body.data.poll.options[0].votesCount).toBe(1);
      expect(res.body.data.results.options[0].percentage).toBe(100);

      // Verify Vote document persisted in MongoDB
      const voteInDb = await Vote.findOne({ poll: pollId, user: citizen1._id });
      expect(voteInDb).not.toBeNull();
      expect(voteInDb.optionId.toString()).toBe(option1Id.toString());
    });

    it('should reject unauthenticated vote attempt (401)', async () => {
      const res = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .send({ optionId: option1Id });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject vote with invalid option ID format (400)', async () => {
      const res = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ optionId: 'not-a-mongo-id' });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].message).toMatch(/invalid option id format/i);
    });

    it('should reject vote with non-existent option ID for that poll (400)', async () => {
      const randomOptionId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ optionId: randomOptionId });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/selected option does not exist/i);
    });

    it('should reject duplicate vote from the same user (400)', async () => {
      // First vote
      await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ optionId: option1Id });

      // Second vote attempt by same user
      const duplicateRes = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ optionId: option2Id });

      expect(duplicateRes.status).toBe(400);
      expect(duplicateRes.body.success).toBe(false);
      expect(duplicateRes.body.message).toMatch(/already voted on this poll/i);

      // Verify totalVotes did not increase
      const poll = await Poll.findById(pollId);
      expect(poll.totalVotes).toBe(1);
      expect(poll.options[0].votesCount).toBe(1);
      expect(poll.options[1].votesCount).toBe(0);
    });

    it('should correctly record votes from multiple distinct users and calculate sentiment', async () => {
      // User 1 votes for option 1
      await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ optionId: option1Id });

      // User 2 votes for option 1
      await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ optionId: option1Id });

      // User 3 votes for option 2
      const res3 = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${token3}`)
        .send({ optionId: option2Id });

      expect(res3.status).toBe(200);
      expect(res3.body.data.poll.totalVotes).toBe(3);
      expect(res3.body.data.results.options[0].votesCount).toBe(2);
      expect(res3.body.data.results.options[0].percentage).toBe(66.7);
      expect(res3.body.data.results.options[1].votesCount).toBe(1);
      expect(res3.body.data.results.options[1].percentage).toBe(33.3);
      expect(res3.body.data.results.options[2].votesCount).toBe(0);
      expect(res3.body.data.results.options[2].percentage).toBe(0);
    });

    it('should reject voting on a closed poll (400)', async () => {
      // Close the poll
      await Poll.findByIdAndUpdate(pollId, { status: 'closed' });

      const res = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ optionId: option1Id });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/cannot vote on a closed poll/i);
    });
  });

  describe('6. Poll Results & Live Sentiment Dashboard (GET /api/polls/:id/results)', () => {
    let pollId;
    let option1Id;
    let option2Id;
    let option3Id;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/polls')
        .set('Authorization', `Bearer ${token1}`)
        .send(validPollPayload);
      pollId = res.body.data.poll._id;
      option1Id = res.body.data.poll.options[0]._id;
      option2Id = res.body.data.poll.options[1]._id;
      option3Id = res.body.data.poll.options[2]._id;
    });

    it('should return initial results with 0 total votes and 0% for all options', async () => {
      const res = await request(app).get(`/api/polls/${pollId}/results`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.results.totalVotes).toBe(0);
      expect(res.body.data.results.options).toHaveLength(3);
      expect(res.body.data.results.options[0].percentage).toBe(0);
      expect(res.body.data.results.options[1].percentage).toBe(0);
      expect(res.body.data.results.options[2].percentage).toBe(0);
    });

    it('should return updated results with live percentages after votes are recorded', async () => {
      // Citizen 1 votes Option 1
      await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ optionId: option1Id });

      // Citizen 2 votes Option 2
      await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ optionId: option2Id });

      // Citizen 3 votes Option 1
      await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${token3}`)
        .send({ optionId: option1Id });

      // Official user votes Option 1
      await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${officialToken}`)
        .send({ optionId: option1Id });

      const res = await request(app).get(`/api/polls/${pollId}/results`);

      expect(res.status).toBe(200);
      expect(res.body.data.results.totalVotes).toBe(4);
      expect(res.body.data.results.options[0].votesCount).toBe(3);
      expect(res.body.data.results.options[0].percentage).toBe(75.0);
      expect(res.body.data.results.options[1].votesCount).toBe(1);
      expect(res.body.data.results.options[1].percentage).toBe(25.0);
      expect(res.body.data.results.results || res.body.data.results.options[2].votesCount).toBe(0);
      expect(res.body.data.results.options[2].percentage).toBe(0);
    });

    it('should allow viewing results for closed polls', async () => {
      // Citizen 1 votes
      await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ optionId: option1Id });

      // Close the poll
      await Poll.findByIdAndUpdate(pollId, { status: 'closed' });

      const res = await request(app).get(`/api/polls/${pollId}/results`);

      expect(res.status).toBe(200);
      expect(res.body.data.results.status).toBe('closed');
      expect(res.body.data.results.totalVotes).toBe(1);
      expect(res.body.data.results.options[0].votesCount).toBe(1);
    });

    it('should return 404 for results on non-existent poll ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/polls/${nonExistentId}/results`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('7. Poll Status Management & Deletion (PATCH /api/polls/:id/status, DELETE /api/polls/:id)', () => {
    let pollId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/polls')
        .set('Authorization', `Bearer ${token1}`)
        .send(validPollPayload);
      pollId = res.body.data.poll._id;
    });

    it('should allow poll creator to close the poll', async () => {
      const res = await request(app)
        .patch(`/api/polls/${pollId}/status`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ status: 'closed' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.poll.status).toBe('closed');
    });

    it('should allow official user to update poll status', async () => {
      const res = await request(app)
        .patch(`/api/polls/${pollId}/status`)
        .set('Authorization', `Bearer ${officialToken}`)
        .send({ status: 'closed' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.poll.status).toBe('closed');
    });

    it('should reject status update from unauthorized non-creator citizen (403)', async () => {
      const res = await request(app)
        .patch(`/api/polls/${pollId}/status`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ status: 'closed' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not authorized to update this poll/i);
    });

    it('should allow creator to delete poll before any votes are cast', async () => {
      const res = await request(app)
        .delete(`/api/polls/${pollId}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deleted).toBe(true);

      const pollInDb = await Poll.findById(pollId);
      expect(pollInDb).toBeNull();
    });

    it('should prevent deleting a poll that has already received votes (400)', async () => {
      const poll = await Poll.findById(pollId);
      const optionId = poll.options[0]._id;

      // Cast a vote
      await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ optionId });

      // Attempt deletion
      const res = await request(app)
        .delete(`/api/polls/${pollId}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/cannot delete a poll that has already received votes/i);
    });

    it('should reject poll deletion by unauthorized user (403)', async () => {
      const res = await request(app)
        .delete(`/api/polls/${pollId}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not authorized to delete this poll/i);
    });
  });
});
