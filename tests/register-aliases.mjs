import { registerHooks } from 'node:module';

registerHooks({
    resolve(specifier, context, nextResolve) {
        const resolved = specifier.startsWith('@/')
            ? new URL(`../src/${specifier.slice(2)}`, import.meta.url).href
            : specifier;
        return nextResolve(resolved, context);
    },
});
