const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('User routes API integration/e2e', () => {
  let mongod;
  let app;
  let authToken;
  const creds = {
    username: 'Codex Tester',
    email: `test-${Date.now()}@example.com`,
    password: 'TestPass123!',
  };

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.NODE_ENV = 'test';
    app = require('../app');
    await new Promise((resolve) => mongoose.connection.once('open', resolve));
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
  });

  test('health endpoint reflects database state', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, db: expect.any(String) });
  });

  test('registers a new user and returns a JWT', async () => {
    const res = await request(app).post('/api/users/register').send(creds);
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    authToken = res.body.token;
  });

  test('allows the user to login', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: creds.email, password: creds.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    authToken = res.body.token;
  });

  test('logs a fitness entry and retrieves it', async () => {
    const payload = {
      activityType: 'Running',
      duration: 30,
      caloriesBurned: 350,
      distance: 5,
    };

    const postRes = await request(app)
      .post('/api/users/fitness')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload);
    expect(postRes.status).toBe(200);
    expect(postRes.body.fitnessData).toHaveLength(1);

    const getRes = await request(app)
      .get('/api/users/fitness')
      .set('Authorization', `Bearer ${authToken}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.fitnessData).toHaveLength(1);
    expect(getRes.body.fitnessData[0].activityType).toBe('Running');
  });

  test('logs a meal and returns calorie totals', async () => {
    const mealRes = await request(app)
      .post('/api/users/meal')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        mealType: 'Breakfast',
        foodItems: [{ foodName: 'Banana', calories: 105 }],
      });
    expect(mealRes.status).toBe(200);
    expect(mealRes.body.meals).toHaveLength(1);

    const getMeals = await request(app)
      .get('/api/users/meals')
      .set('Authorization', `Bearer ${authToken}`);
    expect(getMeals.status).toBe(200);
    expect(getMeals.body.meals[0].foodItems[0].calories).toBe(105);
  });

  test('provides nutrition estimates via fallback data', async () => {
    const res = await request(app)
      .get('/api/users/food-calories')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ query: 'Apple (1 medium)' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      name: expect.stringMatching(/apple/i),
      caloriesPerServing: expect.any(Number),
    });
  });
});
