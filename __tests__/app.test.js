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
    describe('ANY', () => {
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

describe('/api/users', () => {
    describe('GET', () => {
        test('200: responds with an array of user objects each with the properties of username, name and avatar url', () => {
            return request(app)
                .get('/api/users')
                .expect(200)
                .then((res) => {
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

describe('/api/articles', () => {
    describe('GET', () => {
        test('200: responds with an article object with the correct properties and comment count for the given id', () => {
            return request(app)
                .get('/api/articles/5')
                .expect(200)
                .then((res) => {
                    expect(res.body.article).toHaveProperty('article_id', 5);
                    expect(res.body.article).toHaveProperty('title', 'UNCOVERED: catspiracy to bring down democracy');
                    expect(res.body.article).toHaveProperty('topic', 'cats');
                    expect(res.body.article).toHaveProperty('author', 'rogersop');
                    expect(res.body.article).toHaveProperty('body', 'Bastet walks amongst us, and the cats are taking arms!');
                    expect(res.body.article).toHaveProperty('created_at', '2020-08-03T13:14:00.000Z');
                    expect(res.body.article).toHaveProperty('votes', 0);
                    expect(res.body.article).toHaveProperty('comment_count', 2);
                });
        });
        test('200: responds with an array of article objects with the correct properties and data types', () => {
            return request(app)
                .get('/api/articles')
                .expect(200)
                .then((res) => {
                    expect(res.body.articles.length).toBeGreaterThan(0);
                    res.body.articles.forEach((article) => {
                        expect(article).toHaveProperty('author', expect.any(String));
                        expect(article).toHaveProperty('title', expect.any(String));
                        expect(article).toHaveProperty('article_id', expect.any(Number));
                        expect(article).toHaveProperty('topic', expect.any(String));
                        expect(article).toHaveProperty('created_at', expect.any(String));
                        expect(article).toHaveProperty('votes', expect.any(Number));
                        expect(article).toHaveProperty('comment_count', expect.any(Number));
                    });
                });
        });
        test('200: responds with an empty array when topic filter is valid but has no related articles yet', () => {
            return request(app)
                .get('/api/articles?topic=paper')
                .expect(200)
                .then((res) => {
                    expect(res.body.articles).toEqual([]);
                });
        });
        test('200: responds with an array of article objects sorted by date created in descending order', () => {
            return request(app)
                .get('/api/articles')
                .expect(200)
                .then((res) => {
                    expect(res.body.articles).toBeSortedBy('created_at', { descending: true });
                });
        });
        test('200: articles can be filtered by topic', () => {
            return request(app)
                .get('/api/articles?topic=mitch')
                .expect(200)
                .then((res) => {
                    expect(res.body.articles.length).toBeGreaterThan(0);
                    res.body.articles.forEach((article) => {
                        expect(article.topic).toBe('mitch');
                    });
                });
        });
        test('200: responds with an array of comment objects for the given id with the correct properties and data types', () => {
            return request(app)
                .get('/api/articles/5/comments')
                .expect(200)
                .then((res) => {
                    expect(res.body.comments.length).toBeGreaterThan(0);
                    res.body.comments.forEach((comment) => {
                        expect(comment).toHaveProperty('comment_id', expect.any(Number));
                        expect(comment).toHaveProperty('votes', expect.any(Number));
                        expect(comment).toHaveProperty('created_at', expect.any(String));
                        expect(comment).toHaveProperty('author', expect.any(String));
                        expect(comment).toHaveProperty('body', expect.any(String));
                    });
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
        test('404: client makes request for a topic that does not exist', () => {
            return request(app)
                .get('/api/articles?topic=dogs')
                .expect(404)
                .then((res) => {
                    expect(res.body.msg).toBe('topic not found');
                });
        });
        test('404: client makes request for comments for an id that does not exist', () => {
            return request(app)
                .get('/api/articles/9999/comments')
                .expect(404)
                .then((res) => {
                    expect(res.body.msg).toBe('article not found');
                });
        });
        test('400: client makes a request for comments for an invalid article id - string instead of number', () => {
            return request(app)
                .get('/api/articles/dogs/comments')
                .expect(400)
                .then((res) => {
                    expect(res.body.msg).toBe('bad request');
                });
        });
        test('404: client makes a request for a valid article but it has no comments', () => {
            return request(app)
                .get('/api/articles/2/comments')
                .expect(404)
                .then((res) => {
                    expect(res.body.msg).toBe('the selected article does not have any comments');
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
                    expect(res.body.article).toHaveProperty('article_id', 3);
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
                    expect(res.body.article).toHaveProperty('article_id', 3);
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
    describe('POST', () => {
        test('201: adds a comment to comments with the correct article id and responds with the added comment', () => {
            const comment = {
                "username": "icellusedkars",
                "body": "Needs more pug gifs",
            };
            return request(app)
                .post('/api/articles/3/comments')
                .send(comment)
                .expect(201)
                .then((res) => {
                    expect(res.body.comment).toHaveProperty('comment_id', expect.any(Number));
                    expect(res.body.comment).toHaveProperty('body', 'Needs more pug gifs');
                    expect(res.body.comment).toHaveProperty('votes', expect.any(Number));
                    expect(res.body.comment).toHaveProperty('author', 'icellusedkars');
                    expect(res.body.comment).toHaveProperty('article_id', 3);
                    expect(res.body.comment).toHaveProperty('created_at', expect.any(String));
                    return db
                        .query('SELECT * FROM comments WHERE comment_id=19;')
                })
                .then((result) => {
                    expect(result.rows[0].comment_id).toEqual(19);
                    expect(result.rows[0].body).toEqual('Needs more pug gifs');
                    expect(result.rows[0].votes).toEqual(0);
                    expect(result.rows[0].author).toEqual('icellusedkars');
                    expect(result.rows[0].article_id).toEqual(3);
                    expect(result.rows[0].created_at).toEqual(expect.any(Object));
                });
        });
        test('400: request is in wrong format - wrong object keys in request', () => {
            const comment = {
                "author": "icellusedkars",
                "body": 9,
                "created_at": 1586179020000,
            };
            return request(app)
                .post('/api/articles/3/comments')
                .send(comment)
                .expect(400)
                .then((response) => {
                    expect(response.body.msg).toBe('bad request');
                });
        });
        test('400: request is in wrong format - number instead of string', () => {
            const comment = {
                "username": "icellusedkars",
                "body": 9,
            };
            return request(app)
                .post('/api/articles/3/comments')
                .send(comment)
                .expect(400)
                .then((response) => {
                    expect(response.body.msg).toBe('bad request');
                });
        });
        test('404: client makes request for an id that does not exist', () => {
            const comment = {
                "username": "icellusedkars",
                "body": "Needs more pug gifs",
            };
            return request(app)
                .post('/api/articles/9999/comments')
                .send(comment)
                .expect(404)
                .then((res) => {
                    expect(res.body.msg).toBe('article not found');
                });
        });
    });
});

