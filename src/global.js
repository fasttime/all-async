import allAsync from './all-async.js';

Reflect.defineProperty
(
    Promise,
    'allAsync',
    { configurable: true, enumerable: false, value: allAsync, writable: true },
);
