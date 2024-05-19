import assert                           from 'node:assert/strict';
import allAsync                         from '../src/index.js';
import { after, before, describe, it }  from 'mocha';

function commonTest(allAsyncSupplier)
{
    let allAsync = null;

    before
    (() => { allAsync = allAsyncSupplier(); });

    after
    (() => { allAsync = null; });

    it
    (
        'properties',
        () =>
        {
            assert.deepEqual
            (
                Object.getOwnPropertyDescriptors(allAsync),
                {
                    length:
                    {
                        configurable:   true,
                        enumerable:     false,
                        value:          2,
                        writable:       false,
                    },
                    name:
                    {
                        configurable:   true,
                        enumerable:     false,
                        writable:       false,
                        value:          'allAsync',
                    },
                },
            );
        },
    );

    it
    (
        'prototype',
        () =>
        {
            assert.equal(Reflect.getPrototypeOf(allAsync), Function.prototype);
        },
    );

    it
    (
        'non-constructibility',
        () =>
        {
            assert.throws(() => class extends allAsync { }, TypeError);
        },
    );
}

it
(
    'with an empty async iterable',
    async () =>
    {
        const asyncIterable = (async function * () { })();

        const actual = await allAsync(asyncIterable);
        assert.deepEqual(actual, []);
    },
);

it
(
    'with an empty iterable',
    async () =>
    {
        const iterable = [];

        const actual = await allAsync(iterable);
        assert.deepEqual(actual, []);
    },
);

it
(
    'with a non-empty async iterable',
    async () =>
    {
        let index = 0;
        const asyncIterator =
        {
            next(...args)
            {
                assert.equal(this, asyncIterator);
                assert.equal(args.length, 0);
                switch (index++)
                {
                case 0:
                    return { value: 'foo', done: false };
                case 1:
                    return { value: Promise.resolve('bar'), done: false };
                default:
                    return { done: true };
                }
            },
            return()
            { assert.fail(); },
        };
        const asyncIterable = { [Symbol.asyncIterator]: () => asyncIterator };

        const actual = await allAsync(asyncIterable);
        assert.deepEqual(actual, ['foo', 'bar']);
    },
);

it
(
    'with a non-empty iterable',
    async () =>
    {
        let index = 0;
        const iterator =
        {
            next(...args)
            {
                assert.equal(this, iterator);
                assert.equal(args.length, 0);
                switch (index++)
                {
                case 0:
                    return { value: 'foo', done: false };
                case 1:
                    return { value: Promise.resolve('bar'), done: false };
                default:
                    return { done: true };
                }
            },
            return()
            { assert.fail(); },
        };
        const iterable = { [Symbol.iterator]: () => iterator };

        const actual = await allAsync(iterable);
        assert.deepEqual(actual, ['foo', 'bar']);
    },
);

it
(
    'with an async iterable when a value rejects',
    async () =>
    {
        const error = { bar: 'baz' };
        let index = 0;
        const asyncIterator =
        {
            next(...args)
            {
                assert.equal(this, asyncIterator);
                assert.equal(args.length, 0);
                switch (index++)
                {
                case 0:
                    return { value: 'foo', done: false };
                case 1:
                    return { value: Promise.reject(error), done: false };
                default:
                    return { done: true };
                }
            },
            throw()
            { assert.fail(); },
        };
        const asyncIterable = { [Symbol.asyncIterator]: () => asyncIterator };

        await assert.rejects(allAsync(asyncIterable), error);
    },
);

it
(
    'with an iterable when a value rejects',
    async () =>
    {
        const error = { bar: 'baz' };
        let index = 0;
        const iterator =
        {
            next(...args)
            {
                assert.equal(this, iterator);
                assert.equal(args.length, 0);
                switch (index++)
                {
                case 0:
                    return { value: 'foo', done: false };
                case 1:
                    return { value: Promise.reject(error), done: false };
                default:
                    return { done: true };
                }
            },
            throw()
            { assert.fail(); },
        };
        const iterable = { [Symbol.iterator]: () => iterator };

        await assert.rejects(allAsync(iterable), error);
    },
);

it
(
    'with an async iterable when a result promise rejects',
    async () =>
    {
        const error = { bar: 'baz' };
        let index = 0;
        const asyncIterator =
        {
            next()
            {
                switch (index++)
                {
                case 0:
                    return { value: 'foo', done: false };
                default:
                    return Promise.reject(error);
                }
            },
        };
        const asyncIterable = { [Symbol.asyncIterator]: () => asyncIterator };

        await assert.rejects(allAsync(asyncIterable), error);
    },
);

it
(
    'with an async iterable when values resolve in reverse order',
    async () =>
    {
        let index = 0;
        let resolve_0;
        let resolve_1;
        const asyncIterator =
        {
            next()
            {
                switch (index++)
                {
                case 0:
                    {
                        const promise =
                        new Promise(localResolve => { resolve_0 = localResolve; });
                        return promise;
                    }
                case 1:
                    {
                        const promise =
                        new Promise(localResolve => { resolve_1 = localResolve; });
                        return { value: promise, done: false };
                    }
                case 2:
                    setTimeout
                    (
                        () =>
                        {
                            resolve_1('bar');
                            setTimeout
                            (() => { resolve_0({ value: 'foo', done: false }); });
                        },
                    );
                    return { value: 'baz', done: false };
                default:
                    return { done: true };
                }
            },
        };
        const asyncIterable = { [Symbol.asyncIterator]: () => asyncIterator };

        const actual = await allAsync(asyncIterable, 3);
        assert.deepEqual(actual, ['foo', 'bar', 'baz']);
    },
);

it
(
    'with an iterable when values resolve in reverse order',
    async () =>
    {
        let index = 0;
        let resolve;
        const iterator =
        {
            next()
            {
                switch (index++)
                {
                case 0:
                    {
                        const promise =
                        new Promise(localResolve => { resolve = localResolve; });
                        return { value: promise, done: false };
                    }
                case 1:
                    setTimeout
                    (() => { resolve('foo'); });
                    return { value: 'bar', done: false };
                default:
                    return { done: true };
                }
            },
        };
        const iterable = { [Symbol.iterator]: () => iterator };

        const actual = await allAsync(iterable, 2);
        assert.deepEqual(actual, ['foo', 'bar']);
    },
);

it
(
    'with an async iterable when a non-done result promise resolves after done',
    async () =>
    {
        let index = 0;
        let resolve;
        const asyncIterator =
        {
            next()
            {
                switch (index++)
                {
                case 0:
                    return { value: 'foo', done: false };
                case 1:
                    {
                        const promise =
                        new Promise(localResolve => { resolve = localResolve; });
                        return promise;
                    }
                case 2:
                    return { value: 'bar', done: false };
                default:
                    setTimeout(() => resolve({ done: true }));
                    return { done: true };
                }
            },
        };
        const asyncIterable = { [Symbol.asyncIterator]: () => asyncIterator };

        const actual = await allAsync(asyncIterable, 4);
        assert.deepEqual(actual, ['foo']);
    },
);

it
(
    'when a result is undefined',
    async () =>
    {
        const asyncIterator =
        { next() { } };
        const asyncIterable = { [Symbol.asyncIterator]: () => asyncIterator };

        await assert.rejects(allAsync(asyncIterable), TypeError);
    },
);

it
(
    'with an iterable when a result is a promise',
    async () =>
    {
        let index = 0;
        const iterator =
        {
            next()
            {
                switch (index++)
                {
                case 0:
                    return Promise.resolve({ value: 'foo', done: false });
                default:
                    return { done: true };
                }
            },
        };
        const iterable = { [Symbol.iterator]: () => iterator };

        const actual = await allAsync(iterable);
        assert.deepEqual(actual, [undefined]);
    },
);

it
(
    'with an async iterable when a result\'s `done` is a promise',
    async () =>
    {
        const asyncIterator =
        { next: () => ({ value: 'foo', done: Promise.resolve(false) }) };
        const asyncIterable = { [Symbol.asyncIterator]: () => asyncIterator };

        const actual = await allAsync(asyncIterable);
        assert.deepEqual(actual, []);
    },
);

it
(
    'with an iterable when a result\'s `done` is a promise',
    async () =>
    {
        const iterator =
        { next: () => ({ value: 'foo', done: Promise.resolve(false) }) };
        const iterable = { [Symbol.iterator]: () => iterator };

        const actual = await allAsync(iterable);
        assert.deepEqual(actual, []);
    },
);

it
(
    'with an argument that is neither iterable or async iterable',
    async () =>
    {
        await assert.rejects(allAsync({ }), TypeError);
    },
);

it
(
    'with infinite count',
    async () =>
    {
        await assert.rejects(allAsync([], Infinity), TypeError);
    },
);

it
(
    'with zero count',
    async () =>
    {
        await assert.rejects(allAsync([], 0), TypeError);
    },
);

it
(
    'with non-integer count',
    async () =>
    {
        await assert.rejects(allAsync([], 1.5), TypeError);
    },
);

it
(
    'with non-numeric count',
    async () =>
    {
        await assert.rejects(allAsync([], '1'), TypeError);
    },
);

describe
(
    'when `Promise.withResolvers` is not available',
    () =>
    {
        const { withResolvers } = Promise;
        if (withResolvers == null) return;

        let allAsync = null;

        before
        (
            async () =>
            {
                Promise.withResolvers = null;
                try
                {
                    const namespace = await import('../src/all-async.js#no-promise-with-Resolvers');
                    allAsync = namespace.default;
                }
                finally
                {
                    Promise.withResolvers = withResolvers;
                }
            },
        );

        after
        (() => { allAsync = null; });

        it
        (
            'when all promises resolve',
            async () =>
            {
                const iterable = [Promise.resolve('foo')];

                const actual = await allAsync.call(Promise, iterable);
                assert.deepEqual(actual, ['foo']);
            },
        );

        it
        (
            'when some promises reject',
            async () =>
            {
                const error = { bar: 'baz' };
                const iterable = [Promise.reject(error)];

                await assert.rejects(allAsync.call(Promise, iterable), error);
            },
        );
    },
);

describe('Bound `allAsync`', () => commonTest(() => allAsync));

describe
(
    '`Promise.allAsync`',
    () =>
    {
        before
        (
            async () =>
            { await import('../src/global.js'); },
        );

        after
        (() => { delete Promise.allAsync; });

        commonTest(() => Promise.allAsync);

        it
        (
            'descriptor',
            () =>
            {
                const descriptor = Reflect.getOwnPropertyDescriptor(Promise, 'allAsync');

                assert.deepEqual
                (
                    descriptor,
                    {
                        configurable:   true,
                        enumerable:     false,
                        value:          Promise.allAsync,
                        writable:       true,
                    },
                );
            },
        );

        it
        (
            'called on a thenable constructor with a valid argument',
            async () =>
            {
                let ctorCount = 0;

                class Thenable extends Promise
                {
                    constructor(...args)
                    {
                        ctorCount++;
                        super(...args);
                    }
                }

                const thenable = Thenable.allAsync([]);
                assert(thenable instanceof Thenable);
                assert.equal(ctorCount, 1);
                await thenable;
                assert.equal(ctorCount, 2);
            },
        );

        it
        (
            'called on a thenable constructor with an invalid argument',
            async () =>
            {
                class Thenable extends Promise { }

                const thenable = Thenable.allAsync(42);
                assert(thenable instanceof Thenable);
                await assert.rejects(thenable, TypeError);
            },
        );

        it
        (
            'called on a non-thenable constructor',
            () =>
            {
                class NonThenable { }

                assert.throws(() => Promise.allAsync.call(NonThenable), TypeError);
            },
        );

        it
        (
            'called on a non-constructor',
            () =>
            {
                const NonConstructor = () => { };
                NonConstructor.resolve = Promise.resolve.bind(Promise);

                assert.throws(() => Promise.allAsync.call(NonConstructor, []), TypeError);
            },
        );
    },
);
