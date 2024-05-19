const { allAsync } =
{
    allAsync(iterable, count)
    {
        if (!isConstructor(this))
            throw TypeError('`allAsync` called on non-constructor.');
        const { resolve } = this;
        if (typeof resolve !== 'function')
            throw TypeError('`this.resolve` is not callable.');
        const promise = doAllAsync(iterable, count);
        return Reflect.apply(resolve, this, [promise]);
    },
};

let createPromiseWithResolvers;
{
    const { withResolvers } = Promise;
    createPromiseWithResolvers =
    withResolvers ?
    withResolvers.bind(Promise) :
    () =>
    {
        let resolve;
        let reject;
        const promise =
        new Promise
        (
            (localResolve, localReject) =>
            {
                resolve = localResolve;
                reject  = localReject;
            },
        );
        return { resolve, reject, promise };
    };
}

async function doAllAsync(iterable, count = 1)
{
    if (!Number.isInteger(count) || count < 1)
        throw TypeError('count must be a positive integer');

    let getIteratorResult;
    {
        const getAsyncIterator = iterable[Symbol.asyncIterator];
        if (getAsyncIterator === undefined || getAsyncIterator === null)
        {
            const iterator = iterable[Symbol.iterator]();
            getIteratorResult =
            () =>
            {
                const { value, done } = iterator.next();
                const result = { value, done };
                return result;
            };
        }
        else
        {
            const asyncIterator = Reflect.apply(getAsyncIterator, iterable, []);
            getIteratorResult = () => asyncIterator.next();
        }
    }

    const result = [];
    let length = Infinity;
    let currentIndex = 0;
    let resolve;
    let reject;
    let pendingCount = 0;

    async function consume(index)
    {
        try
        {
            const { value, done } = await getIteratorResult();
            if (done)
            { if (length > index) length = index; }
            else
                result[index] = await value;
        }
        catch (error)
        {
            reject(error);
            return;
        }
        pendingCount--;
        resolve();
    }

    while (length === Infinity || pendingCount)
    {
        const promiseWithResolvers = createPromiseWithResolvers();
        ({ resolve, reject } = promiseWithResolvers);
        if (length === Infinity)
        {
            while (pendingCount < count)
            {
                pendingCount++;
                consume(currentIndex++);
            }
        }
        await promiseWithResolvers.promise;
    }
    result.length = length;
    return result;
}

function isConstructor(arg)
{
    if (typeof arg === 'function')
    {
        try
        {
            void class extends arg { };
            return true;
        }
        catch
        { }
    }
    return false;
}

export default allAsync;
