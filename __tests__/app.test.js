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
        test('404: client makes request with invalid url', () => {
            return request(app)
                .get('/api/topic')
                .expect(404)
                .then((res) => {
                    expect(res.body.msg).toBe('route not found');
                });
        });
    });
});

describe('/api/articles', () => {
    describe('GET', () => {
        test('200: responds with an article object with the correct properties', () => {
            return request(app)
                .get('/api/articles/5')
                .expect(200)
                .then((res) => {
                    expect(res.body.article).toHaveProperty('article_id', expect.any(Number));
                    expect(res.body.article).toHaveProperty('title', 'UNCOVERED: catspiracy to bring down democracy');
                    expect(res.body.article).toHaveProperty('topic', 'cats');
                    expect(res.body.article).toHaveProperty('author', 'rogersop');
                    expect(res.body.article).toHaveProperty('body', 'Bastet walks amongst us, and the cats are taking arms!');
                    expect(res.body.article).toHaveProperty('created_at', '2020-08-03T13:14:00.000Z');
                    expect(res.body.article).toHaveProperty('votes', 0);
                });
        });
        test('404: client makes request for an id that does not exist', () => {
            return request(app)
                .get('/api/articles/9999')
                .expect(404)
                .then((res) => {
                    expect(res.body.msg).toBe('article not found');
                });
        });
        test('400: client makes an invalid request, wrong parameter type - using string instead of a number', () => {
            return request(app)
                .get('/api/articles/Living in the shadow of a great man')
                .expect(400)
                .then((res) => {
                    expect(res.body.msg).toBe('bad request');
                });
        });
    });
});