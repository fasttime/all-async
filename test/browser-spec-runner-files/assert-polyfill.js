class AssertionError extends Error
{
    constructor(message = '', data = { })
    {
        if ('actual' in data)
            message += `\nActual:   ${format(data.actual)}`;
        if ('expected' in data)
            message += `\nExpected: ${format(data.expected)}`;
        super(message);
    }
}

function assertError(expected, actual)
{
    if (typeof expected === 'function')
    {
        if (actual instanceof expected)
            return;
        throw new AssertionError
        (
            `The error is expected to be an instance of "${expected.name}". Received "${
            actual.name}".`,
        );
    }
    else
    {
        if (expected === undefined || expected === actual)
            return;
        throw new AssertionError('Unexpected error caught.', { actual, expected });
    }
}

function deepEqual(actual, expected)
{
    if (!isDeepStrictEqual(actual, expected))
    {
        throw new AssertionError
        ('Expected values to be deeply strictly equal.', { actual, expected });
    }
}

function equal(actual, expected)
{
    if (!Object.is(actual, expected))
    {
        throw new AssertionError
        ('Expected values to be strictly equal.', { actual, expected });
    }
}

function fail()
{
    throw new AssertionError('Failed.');
}

function format(value)
{
    if (typeof value === 'string')
        return JSON.stringify(value);
    if (Array.isArray(value))
        return `[${value.map(format).join(', ')}]`;
    if (value && typeof value === 'object')
    {
        const keys = Reflect.ownKeys(value).sort();
        return `{ ${keys.map(key => `${key}: ${format(value[key])}`).join(', ')} }`;
    }
    return `${value}`;
}

function isDeepStrictEqual(value1, value2)
{
    if (Array.isArray(value1) && Array.isArray(value2))
    {
        const { length } = value1;
        if (value2.length !== length)
            return false;
        for (let index = 0; index < length; index++)
        {
            if (!isDeepStrictEqual(value1[index], value2[index]))
                return false;
        }
        return true;
    }
    else if (value1 && typeof value1 === 'object' && value2 && typeof value2 === 'object')
    {
        if (!Object.is(Reflect.getPrototypeOf(value1), Reflect.getPrototypeOf(value2)))
            return false;
        const keys = new Set([...Reflect.ownKeys(value1), Reflect.ownKeys(value2)]);
        for (const key of keys)
        {
            if (!isDeepStrictEqual(value1[key], value2[key]))
                return false;
        }
        return true;
    }
    return value1 === value2;
}

async function rejects(promise, expected)
{
    try
    {
        await promise;
    }
    catch (actual)
    {
        return assertError(expected, actual);
    }
    throw new AssertionError('Missing expected rejection.');
}

function strict(value)
{
    if (!value) throw new AssertionError('Failed.');
}

function throws(fn, expected)
{
    try
    {
        fn();
    }
    catch (actual)
    {
        return assertError(expected, actual);
    }
    throw new AssertionError('Missing expected exception.');
}

Object.assign(strict, { deepEqual, equal, fail, rejects, throws });

export default strict;
