0210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ 
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ # 2. 리액 트를 다시 빌드합니다 (이제 에러 없이 단 몇 초 만에 성공합니다!)
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ npm run build

> ai-marketing-app@0.0.0 build
> vite build

You are using Node.js 18.20.8. Vite requires Node.js version 20.19+ or 22.12+. Please upgrade your Node.js version.
file:///project/work/dmcontents/ai-marketing-app/node_modules/vite/dist/node/cli.js:533
                                this.dispatchEvent(new CustomEvent(`command:${commandName}`, { detail: command }));
                                                       ^

ReferenceError: CustomEvent is not defined
    at CAC.parse (file:///project/work/dmcontents/ai-marketing-app/node_modules/vite/dist/node/cli.js:533:28)
    at file:///project/work/dmcontents/ai-marketing-app/node_modules/vite/dist/node/cli.js:834:5
    at ModuleJob.run (node:internal/modules/esm/module_job:195:25)
    at async ModuleLoader.import (node:internal/modules/esm/loader:337:24)

Node.js v18.20.8
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ 
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ # 3. 백엔 드 폴더로 이동하여 서버를 실행합니다.
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ cd backendds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app/backend$ uvicorn main:app --host 0.0.0.0 --port 9101 --workers 4
INFO:     Uvicorn running on http://0.0.0.0:9101 (Press CTRL+C to quit)
INFO:     Started parent process [11790]