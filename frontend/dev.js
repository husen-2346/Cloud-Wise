import { createServer } from 'vite';

const server = await createServer({
  server: {
    fs: {
      strict: false,
    },
  },
});

await server.listen();
server.printUrls();
server.bindCLIShortcuts({ print: true });
