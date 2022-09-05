const app = require('../app.js');
const db = require('../db/connection.js');
const seed = require('../db/seeds/seed.js');
const testData = require('../db/data/test-data');
const request = require('supertest');

beforeEach(() => {
    return seed(testData);
});

afterAll(() => {
    return db.end();
});

describe('/api/topics', () => {
    describe('GET', () => {
        test('200: responds with an array of topic objects each with the properties of slug and description', () => {
            return request(app)
                .get('/api/topics')
                .expect(200)
                .then((res) => {
                    expect(Array.isArray(res.body.topics)).toBe(true);
                    expect(Object.keys(res.body)).toEqual(["topics"]);
                    expect(res.body.topics.length > 0).toBe(true);
                    res.body.topics.forEach(topic => {
                        expect(topic).toHaveProperty('slug', expect.any(String));
                        expect(topic).toHaveProperty('description', expect.any(String));
                    });
                })
        });
    });
    describe('GET', () => {
        test('404: client makes request with incorrect url', () => {
            return request(app)
                .get('/api/topic')
                .expect(404)
        });
    });
});