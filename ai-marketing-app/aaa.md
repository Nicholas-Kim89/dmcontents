ser1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ # 1. 깃허 브에서 제가 깔끔하게 복원해 둔 설정을 당겨옵니다.
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ cd /project/work/dmcontents/ai-marketing-app
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ git pull origin main
From https://github.com/Nicholas-Kim89/dmcontents
 * branch            main       -> FETCH_HEAD
Already up to date.
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ 
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ # 2. 기존 의 호환성 꼬인 node_modules 폴더와 package-lock.json 파일을 깔끔하게 완전 삭제합니다.
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ rm -rf node_modules package-lock.json
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ 
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ # 3. 새로 운 Node.js v20 환경에 최적화하여 패키지를 새로 설치합니다 (시간이 1~2분 소요될 수 있습니다).
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ npm install
npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'puppeteer@25.0.2',
npm warn EBADENGINE   required: { node: '>=22.12.0' },
npm warn EBADENGINE   current: { node: 'v20.20.2', npm: '10.8.2' }
npm warn EBADENGINE }
npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: '@puppeteer/browsers@3.0.2',
npm warn EBADENGINE   required: { node: '>=22.12.0' },
npm warn EBADENGINE   current: { node: 'v20.20.2', npm: '10.8.2' }
npm warn EBADENGINE }
npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'puppeteer-core@25.0.2',
npm warn EBADENGINE   required: { node: '>=22.12.0' },
npm warn EBADENGINE   current: { node: 'v20.20.2', npm: '10.8.2' }
npm warn EBADENGINE }
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm warn deprecated npmlog@5.0.1: This package is no longer supported.
npm warn deprecated whatwg-encoding@2.0.0: Use @exodus/bytes instead for a more spec-conformant and faster implementation
npm warn deprecated abab@2.0.6: Use your platform's native atob() and btoa() methods instead
npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
npm warn deprecated are-we-there-yet@2.0.0: This package is no longer supported.
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated w3c-hr-time@1.0.2: Use your platform's native performance.now() and performance.timeOrigin.
npm warn deprecated domexception@4.0.0: Use your platform's native DOMException instead
npm warn deprecated gauge@3.0.2: This package is no longer supported.
npm warn deprecated tar@6.2.1: Old versions of tar are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me

added 352 packages, and audited 353 packages in 19s

64 packages are looking for funding
  run `npm fund` for details

7 vulnerabilities (3 low, 4 high)

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ 
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ # 4. 리액 트 빌드를 실행합니다! (이제 에러 없이 무조건 성공합니다)
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ npm run build

> ai-marketing-app@0.0.0 build
> vite build

vite v8.0.13 building client environment for production...
✓ 2150 modules transformed.
computing gzip size...
dist/index.html                   0.75 kB │ gzip:   0.42 kB
dist/assets/index-CuqdB4bx.css   76.55 kB │ gzip:  11.03 kB
dist/assets/index-AgjOOy5M.js   748.49 kB │ gzip: 218.59 kB

✓ built in 457ms
[plugin builtin:vite-reporter] 
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ 
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ # 5. 백엔 드 폴더로 가셔서 최종 구동합니다!
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ cd backendds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app/backend$ uvicorn main:app --host 0.0.0.0 --port 9101 --workers 4
ERROR:    [Errno 98] Address already in use
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app/backend$ 