> ai-marketing-app@0.0.0 build
> node build-shim.js build

You are using Node.js 18.20.8. Vite requires Node.js version 20.19+ or 22.12+. Please upgrade your Node.js version.
file:///project/work/dmcontents/ai-marketing-app/node_modules/rolldown/dist/shared/rolldown-build-BVD3dIdE.mjs:9
import { formatWithOptions, styleText } from "node:util";
                            ^^^^^^^^^
SyntaxError: The requested module 'node:util' does not provide an export named 'styleText'
    at ModuleJob._instantiate (node:internal/modules/esm/module_job:123:21)
    at async ModuleJob.run (node:internal/modules/esm/module_job:191:5)
    at async ModuleLoader.import (node:internal/modules/esm/loader:337:24)
    at async CAC.<anonymous> (file:///project/work/dmcontents/ai-marketing-app/node_modules/vite/dist/node/cli.js:763:28)

Node.js v18.20.8
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ 
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ # 3. 백엔 드 폴더로 이동하여 uvicorn 서버를 실행합니다.
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ cd backendds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app/backend$ uvicorn main:app --host 0.0.0.0 --port 9101 --workers 4
INFO:     Uvicorn running on http://0.0.0.0:9101 (Press CTRL+C t