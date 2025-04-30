const esbuild = require("esbuild");

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: "esbuild-problem-matcher",
  setup(build) {
    build.onStart(() => {
      console.log(`[watch] build started`);
    });

    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        console.error(`❌ [ERROR] ${text}`);
        console.error(`    ${location.file}:${location.line}:${location.column}`);
      });
      console.log(`[watch] build finished`);
    });
  },
};

async function main() {
  const ctx = await esbuild.context({
    entryPoints: [
      "src/extension.ts"
    ],
    bundle: true,
    format: "cjs",
    minify: production,
    sourcemap: !production,
    outfile: "extension/out/extension.js",  // Changed outfile path to match vsce expectations
    external: ["vscode"],
    platform: "node",
    plugins: [esbuildProblemMatcherPlugin],
  });

  if (watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    ctx.dispose();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});