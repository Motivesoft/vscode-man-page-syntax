const esbuild = require('esbuild');
const args = process.argv.slice(2);

const build = async () => {
  const ctx = await esbuild.context({
    entryPoints: ['src/extension.js'],
    bundle: true,
    outfile: 'out/extension.js',
    platform: 'node',
    sourcemap: !args.includes('--production'),
    minify: args.includes('--production'),
  });

  if (args.includes('--watch')) {
    await ctx.watch();
    console.log('Watching...');
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
};

build().catch(() => process.exit(1));
