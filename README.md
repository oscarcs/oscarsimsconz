# oscarsims.co.nz

Use Node.js 22.12+ (the project pins the Node 22 line).

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173. The single dev command starts the Hono app on
port 5173 and Vite's client asset server on port 5174. Both ports must be free;
Ctrl-C stops both servers. Local HTTP supports WebGPU on loopback origins.

```sh
npm run typecheck
npm run build
```

The CSS parser override keeps Tailwind Typography's transitive parser on a
patched release until Typography updates its dependency range.

### Deploy

```sh
npm run deploy
```

### Globe performance

With `npm run dev` running, open
http://127.0.0.1:5174/benchmarks/globe.html?size=504&dpr=2 to profile a
504 CSS-pixel globe with a Retina-sized output buffer. This development-only
harness warms up 60 frames, then measures 240 angles over a full rotation. It
reports GPU timestamps when available, CPU submission time, and completion
latency. It waits for GPU completion between frames, so its frame cadence is
not an unrestricted FPS benchmark. Use `dpr=1` for standard resolution or
`size=340&dpr=2` for the mobile-sized workload; the latter still runs on your
computer's GPU, not on mobile hardware. The benchmark requires WebGPU.

The globe uses a 2×2 supersampled target with a linear downsample and no
temporal jitter/history. Reduced-motion mode draws a single static frame.
