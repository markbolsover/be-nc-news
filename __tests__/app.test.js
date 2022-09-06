const app = require('../app.js');
const db = require('../db/connection.js');
const seed = require('../db/seeds/seed.js');
const testData = require('../db/data/test-data');
const request = require('supertest');
const { convertTimestampToDate } = require('../db/seeds/utils.js');

beforeEach(() => {
    return seed(testData);
});

afterAll(() => {
    return db.end();
});

describe('general error handling', () => {
    describe('GET', () => {
        test('404: client makes request with invalid url', () => {
            return request(app)
                .get('/invalidurl')
                .expect(404)
                .then((res) => {
                    expect(res.body.msg).toBe('route not found');
                });
        });
    });
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
        test('400: client makes an invalid request using wrong parameter type - string instead of number', () => {
            return request(app)
                .get('/api/articles/Living in the shadow of a great man')
                .expect(400)
                .then((res) => {
                    expect(res.body.msg).toBe('bad request');
                });
        });
    });
    describe('PATCH', () => {
        test('201: updates votes in the selected article by the correct amount when vote is positive', () => {
            const updatedArticle = convertTimestampToDate({
                "article_id": 3,
                "title": "Eight pug gifs that remind me of mitch",
                "topic": "mitch",
                "author": "icellusedkars",
                "body": "some gifs",
                "created_at": 1604394720000,
                "votes": 50,
            });
            return request(app)
                .patch('/api/articles/3')
                .send({ "inc_votes": 50 })
                .expect(201)
                .then(() => {
                    return db
                        .query('SELECT * FROM articles WHERE article_id=3;')
                        .then((result) => {
                            expect(result.rows[0]).toEqual(updatedArticle);
                        });
                });
        });
        test('201: updates votes in the selected article by the correct amount when vote is negative', () => {
            const updatedArticle = convertTimestampToDate({
                "article_id": 3,
                "title": "Eight pug gifs that remind me of mitch",
                "topic": "mitch",
                "author": "icellusedkars",
                "body": "some gifs",
                "created_at": 1604394720000,
                "votes": -50,
            });
            return request(app)
                .patch('/api/articles/3')
                .send({ "inc_votes": -50 })
                .expect(201)
                .then(() => {
                    return db
                        .query('SELECT * FROM articles WHERE article_id=3;')
                        .then((result) => {
                            expect(result.rows[0]).toEqual(updatedArticle);
                        });
                });
        });
        test('201: responds with the updated article when vote is positive', () => {
            return request(app)
                .patch('/api/articles/3')
                .send({ "inc_votes": 50 })
                .expect(201)
                .then((res) => {
                    expect(res.body.article).toHaveProperty('article_id', expect.any(Number));
                    expect(res.body.article).toHaveProperty('title', 'Eight pug gifs that remind me of mitch');
                    expect(res.body.article).toHaveProperty('topic', 'mitch');
                    expect(res.body.article).toHaveProperty('author', 'icellusedkars');
                    expect(res.body.article).toHaveProperty('body', 'some gifs');
                    expect(res.body.article).toHaveProperty('created_at', '2020-11-03T09:12:00.000Z');
                    expect(res.body.article).toHaveProperty('votes', 50);
                });
        });
        test('201: responds with the updated article when vote is negative', () => {
            return request(app)
                .patch('/api/articles/3')
                .send({ "inc_votes": -50 })
                .expect(201)
                .then((res) => {
                    expect(res.body.article).toHaveProperty('article_id', expect.any(Number));
                    expect(res.body.article).toHaveProperty('title', 'Eight pug gifs that remind me of mitch');
                    expect(res.body.article).toHaveProperty('topic', 'mitch');
                    expect(res.body.article).toHaveProperty('author', 'icellusedkars');
                    expect(res.body.article).toHaveProperty('body', 'some gifs');
                    expect(res.body.article).toHaveProperty('created_at', '2020-11-03T09:12:00.000Z');
                    expect(res.body.article).toHaveProperty('votes', -50);
                });
        });
        test('400: request is in wrong format', () => {
            return request(app)
                .patch('/api/articles/3')
                .send({ "inc_vote": 50 })
                .expect(400)
                .then((response) => {
                    expect(response.body.msg).toBe('bad request');
                });
        });
        test('400: request value is not a number', () => {
            return request(app)
                .patch('/api/articles/3')
                .send({ "inc_vote": 'fifty' })
                .expect(400)
                .then((response) => {
                    expect(response.body.msg).toBe('bad request');
                });
        });
        test('404: client makes request for an id that does not exist', () => {
            return request(app)
                .patch('/api/articles/9999')
                .send({ "inc_votes": 50 })
                .expect(404)
                .then((res) => {
                    expect(res.body.msg).toBe('article not found');
                });
        });
    });
});

describe('/api/users', () => {
    describe('GET', () => {
        test('200: responds with an array of user objects each with the properties of username, name and avatar url', () => {
            return request(app)
                .get('/api/users')
                .expect(200)
                .then((res) => {
                    expect(Array.isArray(res.body.users)).toBe(true);
                    expect(Object.keys(res.body)).toEqual(["users"]);
                    expect(res.body.users.length > 0).toBe(true);
                    res.body.users.forEach(user => {
                        expect(user).toHaveProperty('username', expect.any(String));
                        expect(user).toHaveProperty('name', expect.any(String));
                        expect(user).toHaveProperty('avatar_url', expect.any(String));
                    });
                });
        });
    });
});