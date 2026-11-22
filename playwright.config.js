import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
  testDir:'./tests/browser',timeout:45000,fullyParallel:true,
  use:{launchOptions:{args:['--enable-unsafe-swiftshader']},baseURL:'http://127.0.0.1:5173',screenshot:'only-on-failure',trace:'retain-on-failure'},
  projects:[{name:'desktop',use:{viewport:{width:1365,height:900}}},{name:'mobile',use:{...devices['Pixel 7']}},{name:'reduced-motion',use:{viewport:{width:390,height:844},reducedMotion:'reduce'}}],
  webServer:{command:'npm run dev -- --host 127.0.0.1',url:'http://127.0.0.1:5173',reuseExistingServer:!process.env.CI}
});
