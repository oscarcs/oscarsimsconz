import { createServer } from 'vite';
import { writeFile } from 'node:fs/promises';

await writeFile(new URL('../src/config/is_prod.ts', import.meta.url), 'export default false;\n');
const servers = [];
async function close() {
    await Promise.all(servers.map(server => server.close()));
}
for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, async () => { await close(); process.exit(0); });
}
try {
    for (const mode of ['client', 'development']) {
        const server = await createServer({ mode });
        servers.push(server);
        await server.listen();
        server.printUrls();
    }
} catch (error) {
    await close();
    console.error(error);
    process.exitCode = 1;
}
