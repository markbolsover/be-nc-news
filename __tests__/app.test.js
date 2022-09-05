const app = require('../app.js');
const db = require('../db/connection.js');
const seed = require('../db/seeds/seed.js');
const testData = require('..db/data/test-data');
const request = require('supertest');

beforeEach(() => {
    return seed(testData);
});

afterAll(() => {
    return db.end();
});

describe('', () => {
    describe('', () => {
        test('', () => {
        });
    });
});