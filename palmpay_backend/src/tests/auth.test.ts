import request from 'supertest';
import app from '../app';
import prisma from '../config/database';

describe('Auth API', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        phoneNumber: '1112223333',
        pin: '1234'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.phoneNumber).toBe(userData.phoneNumber);
      expect(response.body.data.token).toBeDefined();
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        phoneNumber: '1112223333',
        pin: '1234'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.token).toBeDefined();
    });
  });
});