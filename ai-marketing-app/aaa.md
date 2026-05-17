스크립트 실행
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 16555  100 16555    0     0  63918      0 --:--:-- --:--:-- --:--:-- 63918
=> Downloading nvm from git to '/home/ds_user1/.nvm'
=> Cloning into '/home/ds_user1/.nvm'...
remote: Enumerating objects: 428, done.
remote: Counting objects: 100% (428/428), done.
remote: Compressing objects: 100% (354/354), done.
remote: Total 428 (delta 60), reused 194 (delta 46), pack-reused 0 (from 0)
Receiving objects: 100% (428/428), 415.66 KiB | 5.94 MiB/s, done.
Resolving deltas: 100% (60/60), done.
* (HEAD detached at FETCH_HEAD)
  master
=> Compressing and cleaning up git repository

=> Appending nvm source string to /home/ds_user1/.bashrc
=> Appending bash_completion source string to /home/ds_user1/.bashrc
=> You currently have modules installed globally with `npm`. These will no
=> longer be linked to the active version of Node when you install a new node
=> with `nvm`; and they may (depending on how you construct your `$PATH`)
=> override the binaries of modules installed with `nvm`:

/usr/lib
├── corepack@0.32.0
├── n@9.2.3
└── yarn@1.22.22
=> If you wish to uninstall them at a later point (or re-install them under your
=> `nvm` Nodes), you can remove them from the system Node as follows:

     $ nvm use system
     $ npm uninstall -g a_module

=> Close and reopen your terminal to start using nvm or run the following to use it now:

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ 
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ # 현재 터 미널 창의 환경 설정 새로고침 (반드시 실행해야 nvm 명령어가 인식됩니다)
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ source ~/.bashrc
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ # Node.js 20 버전 설치
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ nvm install 20
Downloading and installing node v20.20.2...
Downloading https://nodejs.org/dist/v20.20.2/node-v20.20.2-linux-x64.tar.xz...
##################################################################################################### 100.0%
Computing checksum with sha256sum
Checksums matched!
Now using node v20.20.2 (npm v10.8.2)
Creating default alias: default -> 20 (-> v20.20.2)
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ 
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ # 설치한 20 버전을 기본 사용 버전으로 지정
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ nvm use 20Now using node v20.20.2 (npm v10.8.2)
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ nvm alias default 20
default -> 20 (-> v20.20.2)
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ 
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ # Node 버 전이 v20.x.x로 잘 바뀌었는지 확인!
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ node -v
v20.20.2
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ cd /project/work/dmcontents/ai-marketing-app
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ npm run build

> ai-marketing-app@0.0.0 build
> node build-shim.js build

file:///project/work/dmcontents/ai-marketing-app/node_modules/rolldown/dist/shared/binding-C9S351wt.mjs:507
                if (loadErrors.length > 0) throw new Error("Cannot find native binding. npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828). Please try `npm i` again after removing both package-lock.json and node_modules directory.", { cause: loadErrors.reduce((err, cur) => {
                                                 ^

Error: Cannot find native binding. npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828). Please try `npm i` again after removing both package-lock.json and node_modules directory.
    at file:///project/work/dmcontents/ai-marketing-app/node_modules/rolldown/dist/shared/binding-C9S351wt.mjs:507:36
    at file:///project/work/dmcontents/ai-marketing-app/node_modules/rolldown/dist/shared/binding-C9S351wt.mjs:9:49
    ... 2 lines matching cause stack trace ...
    at async ModuleLoader.import (node:internal/modules/esm/loader:606:24)
    at async CAC.<anonymous> (file:///project/work/dmcontents/ai-marketing-app/node_modules/vite/dist/node/cli.js:763:28) {
  [cause]: Error: Cannot find module '@rolldown/binding-linux-x64-gnu'
  Require stack:
  - /project/work/dmcontents/ai-marketing-app/node_modules/rolldown/dist/shared/binding-C9S351wt.mjs
      at Module._resolveFilename (node:internal/modules/cjs/loader:1207:15)
      ... 2 lines matching cause stack trace ...
      at require (node:internal/modules/helpers:182:18)
      at requireNative (file:///project/work/dmcontents/ai-marketing-app/node_modules/rolldown/dist/shared/binding-C9S351wt.mjs:277:21)
      at file:///project/work/dmcontents/ai-marketing-app/node_modules/rolldown/dist/shared/binding-C9S351wt.mjs:475:18
      at file:///project/work/dmcontents/ai-marketing-app/node_modules/rolldown/dist/shared/binding-C9S351wt.mjs:9:49
      at file:///project/work/dmcontents/ai-marketing-app/node_modules/rolldown/dist/shared/parse-Ch28GO2f.mjs:3:46
      at ModuleJob.run (node:internal/modules/esm/module_job:325:25)
      at async ModuleLoader.import (node:internal/modules/esm/loader:606:24) {
    code: 'MODULE_NOT_FOUND',
    requireStack: [
      '/project/work/dmcontents/ai-marketing-app/node_modules/rolldown/dist/shared/binding-C9S351wt.mjs'
    ],
    cause: Error: Cannot find module '../rolldown-binding.linux-x64-gnu.node'
    Require stack:
    - /project/work/dmcontents/ai-marketing-app/node_modules/rolldown/dist/shared/binding-C9S351wt.mjs
        at Module._resolveFilename (node:internal/modules/cjs/loader:1207:15)
        at Module._load (node:internal/modules/cjs/loader:1038:27)
        at Module.require (node:internal/modules/cjs/loader:1289:19)
        at require (node:internal/modules/helpers:182:18)
        at requireNative (file:///project/work/dmcontents/ai-marketing-app/node_modules/rolldown/dist/shared/binding-C9S351wt.mjs:272:12)
        at file:///project/work/dmcontents/ai-marketing-app/node_modules/rolldown/dist/shared/binding-C9S351wt.mjs:475:18
        at file:///project/work/dmcontents/ai-marketing-app/node_modules/rolldown/dist/shared/binding-C9S351wt.mjs:9:49
        at file:///project/work/dmcontents/ai-marketing-app/node_modules/rolldown/dist/shared/parse-Ch28GO2f.mjs:3:46
        at ModuleJob.run (node:internal/modules/esm/module_job:325:25)
        at async ModuleLoader.import (node:internal/modules/esm/loader:606:24) {
      code: 'MODULE_NOT_FOUND',
      requireStack: [
        '/project/work/dmcontents/ai-marketing-app/node_modules/rolldown/dist/shared/binding-C9S351wt.mjs'
      ]
    }
  }
}

Node.js v20.20.2
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app$ 