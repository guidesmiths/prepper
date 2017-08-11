var assert = require('chai').assert
var get = require('lodash.get')
var has = require('lodash.has')
var lib = require('../..')
var Logger = lib.Logger
var Sequence = lib.handlers.Sequence
var Repo = lib.handlers.Repo
var KeyFilter = lib.handlers.KeyFilter
var Flatten = lib.handlers.Flatten
var Unflatten = lib.handlers.Unflatten

describe('Key Filter', function() {

    var repo
    var logger
    var flatten
    var unflatten

    beforeEach(function() {
        repo = new Repo()
        logger = new Logger()
        flatten = new Flatten()
        unflatten = new Unflatten()
    })

    afterEach(function() {
        repo.removeAllListeners().clear()
        logger.removeAllListeners()
        flatten.removeAllListeners()
        unflatten.removeAllListeners()
    })

    it('should exclude keys matching specified regular expressions', function() {
        logger.on('message', new Sequence([flatten, new KeyFilter({ exclude: [/password/i, /secret/i] }), unflatten, repo]).handle)
        logger.debug({ username: 'cressie176', password: 'bar', aws: { key: 123, secret: 'baz' } })

        var event = repo.first()
        assert.equal(get(event, 'username'), 'cressie176')
        assert.equal(get(event, 'aws.key'), 123)
        assert.isFalse(has(event, 'password'))
        assert.isFalse(has(event, 'secret'))
    })

    it('should exclude keys matching specified strings', function() {
        logger.on('message', new Sequence([flatten, new KeyFilter({ exclude: ['password', 'secret'] }), unflatten, repo]).handle)
        logger.debug({ username: 'cressie176', password: 'bar', aws: { key: 123, secret: 'baz' } })

        var event = repo.first()
        assert.equal(get(event, 'username'), 'cressie176')
        assert.equal(get(event, 'aws.key'), 123)
        assert.isFalse(has(event, 'password'))
        assert.isFalse(has(event, 'secret'))
    })

    it('should exclude keys matching function', function() {
        logger.on('message', new Sequence([flatten, new KeyFilter({ exclude: [function(key) {
            return (key === 'password' || key === 'secret')
        }]}), unflatten, repo]).handle)

        logger.debug({ username: 'cressie176', password: 'bar', aws: { key: 123, secret: 'baz' } })

        var event = repo.first()
        assert.equal(get(event, 'username'), 'cressie176')
        assert.equal(get(event, 'aws.key'), 123)
        assert.isFalse(has(event, 'password'))
        assert.isFalse(has(event, 'secret'))
    })

    it('should report excludes that are not Strings, Regular Expressions or Functions', function() {
        assert.throws(function() {
          return new KeyFilter({ exclude: [1] })
        }, /Predicates must be a string, regular expression or function/)
    })

    it('should include keys matching specified regular expressions', function() {
        logger.on('message', new Sequence([flatten, new KeyFilter({ include: [/username/, /aws\.key/] }), unflatten, repo]).handle)
        logger.debug({ username: 'cressie176', password: 'bar', aws: { key: 123, secret: 'baz' } })

        var event = repo.first()
        assert.equal(get(event, 'username'), 'cressie176')
        assert.equal(get(event, 'aws.key'), 123)
        assert.isFalse(has(event, 'password'))
        assert.isFalse(has(event, 'secret'))
    })

    it('should include keys matching specified strings', function() {
        logger.on('message', new Sequence([flatten, new KeyFilter({ include: ['username', 'aws.key'] }), unflatten, repo]).handle)
        logger.debug({ username: 'cressie176', password: 'bar', aws: { key: 123, secret: 'baz' } })

        var event = repo.first()
        assert.equal(get(event, 'username'), 'cressie176')
        assert.equal(get(event, 'aws.key'), 123)
        assert.isFalse(has(event, 'password'))
        assert.isFalse(has(event, 'secret'))
    })

    it('should include keys matching function', function() {
        logger.on('message', new Sequence([flatten, new KeyFilter({ include: [function(key) {
            return (key === 'username' || key === 'aws.key')
        }]}), unflatten, repo]).handle)

        logger.debug({ username: 'cressie176', password: 'bar', aws: { key: 123, secret: 'baz' } })

        var event = repo.first()
        assert.equal(get(event, 'username'), 'cressie176')
        assert.equal(get(event, 'aws.key'), 123)
        assert.isFalse(has(event, 'password'))
        assert.isFalse(has(event, 'secret'))
    })

    it('should report includes that are not Strings, Regular Expressions or Functions', function() {
        assert.throws(function() {
          return new KeyFilter({ include: [1] })
        }, /Predicates must be a string, regular expression or function/)
    })
})
