import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Match the application's @/* alias when testing real TypeScript modules in Node.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const url = new URL(`../${specifier.slice(2)}`, import.meta.url);
      if (existsSync(fileURLToPath(`${url}.ts`))) {
        return nextResolve(`${url}.ts`, context);
      }
      return nextResolve(url.href, context);
    }
    return nextResolve(specifier, context);
  },
});
