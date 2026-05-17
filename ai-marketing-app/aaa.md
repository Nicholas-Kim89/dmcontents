Setting up gpg-wks-client (2.2.19-3ubuntu2.5) ...
Setting up gnupg (2.2.19-3ubuntu2.5) ...
Processing triggers for libc-bin (2.31-0ubuntu9.12) ...
/sbin/ldconfig.real: File /lib/x86_64-linux-gnu/libcuda.so is empty, not checked.
/sbin/ldconfig.real: File /lib/x86_64-linux-gnu/libcuda.so.1 is empty, not checked.
/sbin/ldconfig.real: File /lib/x86_64-linux-gnu/libcuda.so.465.19.01 is empty, not checked.
/sbin/ldconfig.real: File /lib/x86_64-linux-gnu/libcuda.so.535.230.02 is empty, not checked.
/sbin/ldconfig.real: File /lib/x86_64-linux-gnu/libcudadebugger.so.1 is empty, not checked.
/sbin/ldconfig.real: File /lib/x86_64-linux-gnu/libcudadebugger.so.535.230.02 is empty, not checked.
/sbin/ldconfig.real: File /lib/x86_64-linux-gnu/libnvidia-allocator.so.1 is empty, not checked.
/sbin/ldconfig.real: File /lib/x86_64-linux-gnu/libnvidia-allocator.so.535.230.02 is empty, not checked.
/sbin/ldconfig.real: File /lib/x86_64-linux-gnu/libnvidia-cfg.so.1 is empty, not checked.
/sbin/ldconfig.real: File /lib/x86_64-linux-gnu/libnvidia-cfg.so.535.230.02 is empty, not checked.
/sbin/ldconfig.real: File /lib/x86_64-linux-gnu/libnvidia-ml.so.1 is empty, not checked.
/sbin/ldconfig.real: File /lib/x86_64-linux-gnu/libnvidia-ml.so.535.230.02 is empty, not checked.
/sbin/ldconfig.real: File /lib/x86_64-linux-gnu/libnvidia-nvvm.so.4 is empty, not checked.
/sbin/ldconfig.real: File /lib/x86_64-linux-gnu/libnvidia-nvvm.so.535.230.02 is empty, not checked.
/sbin/ldconfig.real: File /lib/x86_64-linux-gnu/libnvidia-opencl.so.1 is empty, not checked.
/sbin/ldconfig.real: File /lib/x86_64-linux-gnu/libnvidia-opencl.so.535.230.02 is empty, not checked.
/sbin/ldconfig.real: File /lib/x86_64-linux-gnu/libnvidia-pkcs11-openssl3.so.535.230.02 is empty, not checked.
/sbin/ldconfig.real: File /lib/x86_64-linux-gnu/libnvidia-pkcs11.so.535.230.02 is empty, not checked.
/sbin/ldconfig.real: File /lib/x86_64-linux-gnu/libnvidia-ptxjitcompiler.so.1 is empty, not checked.
/sbin/ldconfig.real: File /lib/x86_64-linux-gnu/libnvidia-ptxjitcompiler.so.465.19.01 is empty, not checked.
/sbin/ldconfig.real: File /lib/x86_64-linux-gnu/libnvidia-ptxjitcompiler.so.535.230.02 is empty, not checked.
Processing triggers for ca-certificates (20240203~20.04.1) ...
Updating certificates in /etc/ssl/certs...
0 added, 0 removed; done.
Running hooks in /etc/ca-certificates/update.d...

done.
done.
Get:1 https://deb.nodesource.com/node_20.x nodistro InRelease [12.1 kB]
Get:2 https://deb.nodesource.com/node_20.x nodistro/main amd64 Packages [14.7 kB]                                                       
Hit:3 http://security.ubuntu.com/ubuntu focal-security InRelease                                                                        
Hit:4 http://archive.ubuntu.com/ubuntu focal InRelease                                                                  
Hit:5 http://archive.ubuntu.com/ubuntu focal-updates InRelease                                    
Hit:6 http://ppa.launchpad.net/deadsnakes/ppa/ubuntu focal InRelease
Hit:7 http://archive.ubuntu.com/ubuntu focal-backports InRelease    
Hit:8 https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2004/x86_64  InRelease
Fetched 26.8 kB in 1s (20.6 kB/s)
Reading package lists... Done
Building dependency tree       
Reading state information... Done
135 packages can be upgraded. Run 'apt list --upgradable' to see them.
2026-05-18 01:59:12 - Repository configured successfully.
2026-05-18 01:59:12 - To install Node.js, run: apt install nodejs -y
2026-05-18 01:59:12 - You can use N|solid Runtime as a node.js alternative
2026-05-18 01:59:12 - To install N|solid Runtime, run: apt install nsolid -y 

ds_user1@pjt20210247-aer2025090001-dp-74c8c8d5f-zb54g:/project/work/dmcontents/ai-marketing-app$ sudo apt-get install -y nodejs
Reading package lists... Done
Building dependency tree       
Reading state information... Done
The following packages will be upgraded:
  nodejs
1 upgraded, 0 newly installed, 0 to remove and 134 not upgraded.
Need to get 32.2 MB of archives.
After this operation, 68.5 MB of additional disk space will be used.
Get:1 https://deb.nodesource.com/node_20.x nodistro/main amd64 nodejs amd64 20.20.2-1nodesource1 [32.2 MB]
Fetched 32.2 MB in 1s (31.7 MB/s) 
debconf: unable to initialize frontend: Dialog
debconf: (No usable dialog-like program is installed, so the dialog based frontend cannot be used. at /usr/share/perl5/Debconf/FrontEnd/Dialog.pm line 76, <> line 1.)
debconf: falling back to frontend: Readline
(Reading database ... 46391 files and directories currently installed.)
Preparing to unpack .../nodejs_20.20.2-1nodesource1_amd64.deb ...
Detected old npm client, removing...
Unpacking nodejs (20.20.2-1nodesource1) over (16.20.2-1nodesource1) ...
Setting up nodejs (20.20.2-1nodesource1) ...
ds_user1@pjt20210247-aer2025090001-dp-74c8c8d5f-zb54g:/project/work/dmcontents/ai-marketing-app$ # 1. 프론트엔드 폴더로 이동하여 최적화 빌드 실행
ds_user1@pjt20210247-aer2025090001-dp-74c8c8d5f-zb54g:/project/work/dmcontents/ai-marketing-app$ cd /project/work/dmcontents/ai-marketing-app
ds_user1@pjt20210247-aer2025090001-dp-74c8c8d5f-zb54g:/project/work/dmcontents/ai-marketing-app$ npm run build

> ai-marketing-app@0.0.0 build
> vite build

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
ds_user1@pjt20210247-aer2025090001-dp-74c8c8d5f-zb54g:/project/work/dmcontents/ai-marketing-app$ 