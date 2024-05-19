/* global MochaBar mocha */

import '../../node_modules/mocha/mocha.js';

function setFavicon(href)
{
    document.querySelector('link[rel="icon"]').href = href;
}

mocha.setup({ checkLeaks: true, reporter: MochaBar, ui: 'bdd' });

await import('../all-async.spec.js');

const runner = mocha.run();
runner.on
(
    'fail',
    () =>
    {
        if (runner.failures === 1)
            setFavicon('browser-spec-runner-files/favicon-fail.ico');
    },
);
runner.on
(
    'end',
    () =>
    {
        if (!runner.failures)
            setFavicon('browser-spec-runner-files/favicon-pass.ico');
    },
);
