declare function allAsync<T>
(
    this:       PromiseConstructor,
    iterable:   Iterable<T | PromiseLike<T>> | AsyncIterable<T | PromiseLike<T>>,
    count:      number,
):
Promise<Awaited<T>[]>;

export default allAsync;
