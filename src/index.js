import unboundAllAsync from './all-async.js';

const allAsync = unboundAllAsync.bind(Promise);
Reflect.defineProperty(allAsync, 'name', { value: 'allAsync' });

export default allAsync;
