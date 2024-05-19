interface PromiseConstructor
{
    allAsync<T>
    (iterable: Iterable<T | PromiseLike<T>> | AsyncIterable<T | PromiseLike<T>>, count: number):
    Promise<Awaited<T>[]>;
}
