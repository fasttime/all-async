#!/usr/bin/env node

import { copyFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { rollup } from 'rollup';

async function bundleGlobal()
{
    const globalBundle = await rollup({ input: join(srcDir, 'global.js') });
    await globalBundle.write({ file: join(distDir, 'global.cjs'), format: 'iife' });
}

async function bundleIndex()
{
    const indexBundle = await rollup({ input: join(srcDir, 'index.js') });
    const promises =
    [
        indexBundle.write({ file: join(distDir, 'index.cjs'), format: 'cjs' }),
        indexBundle.write({ file: join(distDir, 'index.js'), format: 'esm' }),
    ];
    await promises;
}

const srcDir = join(import.meta.dirname, '..', 'src');
const distDir = join(import.meta.dirname, '..', 'dist');
await mkdir(distDir, { recursive: true });
const promises =
[
    bundleGlobal(),
    bundleIndex(),
    copyFile(join(srcDir, 'global.d.ts'), join(distDir, 'global.d.ts')),
    copyFile(join(srcDir, 'index.d.ts'), join(distDir, 'index.d.ts')),
];
await Promise.all(promises);
