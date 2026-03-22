import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // adapter-node is ideal for Linode/VPS deployment
    adapter: adapter({
      out: 'build'
    }),
    alias: {
      $components: 'src/lib/components',
      $stores: 'src/lib/stores',
      $types: 'src/lib/types'
    }
  }
};

export default config;
