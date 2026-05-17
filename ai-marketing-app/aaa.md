Requirement already satisfied: anyio<5.0.0,>=4.8.0 in /home/ds_user1/.local/lib/python3.11/site-packages (from google-genai->-r requirements.txt (line 1)) (4.10.0)
Requirement already satisfied: google-auth<3.0.0,>=2.14.1 in /home/ds_user1/.local/lib/python3.11/site-packages (from google-genai->-r requirements.txt (line 1)) (2.40.3)
Requirement already satisfied: httpx<1.0.0,>=0.28.1 in /home/ds_user1/.local/lib/python3.11/site-packages (from google-genai->-r requirements.txt (line 1)) (0.28.1)
Requirement already satisfied: pydantic<3.0.0,>=2.9.0 in /home/ds_user1/.local/lib/python3.11/site-packages (from google-genai->-r requirements.txt (line 1)) (2.12.4)
Requirement already satisfied: requests<3.0.0,>=2.28.1 in /usr/local/lib/python3.11/dist-packages (from google-genai->-r requirements.txt (line 1)) (2.32.3)
Requirement already satisfied: tenacity<9.2.0,>=8.2.3 in /home/ds_user1/.local/lib/python3.11/site-packages (from google-genai->-r requirements.txt (line 1)) (9.1.2)
Requirement already satisfied: websockets<15.1.0,>=13.0.0 in /home/ds_user1/.local/lib/python3.11/site-packages (from google-genai->-r requirements.txt (line 1)) (15.0.1)
Requirement already satisfied: typing-extensions<5.0.0,>=4.11.0 in /home/ds_user1/.local/lib/python3.11/site-packages (from google-genai->-r requirements.txt (line 1)) (4.15.0)
Collecting starlette>=0.46.0 (from fastapi->-r requirements.txt (line 2))
  Downloading starlette-1.0.0-py3-none-any.whl.metadata (6.3 kB)
Requirement already satisfied: typing-inspection>=0.4.2 in /home/ds_user1/.local/lib/python3.11/site-packages (from fastapi->-r requirements.txt (line 2)) (0.4.2)
Collecting annotated-doc>=0.0.2 (from fastapi->-r requirements.txt (line 2))
  Downloading annotated_doc-0.0.4-py3-none-any.whl.metadata (6.6 kB)
Requirement already satisfied: click>=7.0 in /usr/local/lib/python3.11/dist-packages (from uvicorn->-r requirements.txt (line 3)) (8.1.7)
Requirement already satisfied: h11>=0.8 in /home/ds_user1/.local/lib/python3.11/site-packages (from uvicorn->-r requirements.txt (line 3)) (0.16.0)
Collecting langchain-core<2.0.0,>=1.4.0 (from langchain->-r requirements.txt (line 6))
  Downloading langchain_core-1.4.0-py3-none-any.whl.metadata (4.5 kB)
Collecting langgraph (from -r requirements.txt (line 8))
  Downloading langgraph-1.2.0-py3-none-any.whl.metadata (8.0 kB)
Collecting filetype<2.0.0,>=1.2.0 (from langchain-google-genai->-r requirements.txt (line 7))
  Downloading filetype-1.2.0-py2.py3-none-any.whl.metadata (6.5 kB)
Collecting google-genai (from -r requirements.txt (line 1))
  Downloading google_genai-1.75.0-py3-none-any.whl.metadata (52 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 52.7/52.7 kB 5.3 MB/s eta 0:00:00
Collecting google-auth<3.0.0,>=2.48.1 (from google-auth[requests]<3.0.0,>=2.48.1->google-genai->-r requirements.txt (line 1))
  Downloading google_auth-2.53.0-py3-none-any.whl.metadata (5.5 kB)
Requirement already satisfied: distro<2,>=1.7.0 in /home/ds_user1/.local/lib/python3.11/site-packages (from google-genai->-r requirements.txt (line 1)) (1.9.0)
Requirement already satisfied: sniffio in /usr/local/lib/python3.11/dist-packages (from google-genai->-r requirements.txt (line 1)) (1.3.1)
Collecting langgraph-checkpoint<5.0.0,>=4.1.0 (from langgraph->-r requirements.txt (line 8))
  Downloading langgraph_checkpoint-4.1.0-py3-none-any.whl.metadata (5.2 kB)
Collecting langgraph-prebuilt<1.2.0,>=1.1.0 (from langgraph->-r requirements.txt (line 8))
  Downloading langgraph_prebuilt-1.1.0-py3-none-any.whl.metadata (5.2 kB)
Collecting langgraph-sdk<0.4.0,>=0.3.0 (from langgraph->-r requirements.txt (line 8))
  Downloading langgraph_sdk-0.3.14-py3-none-any.whl.metadata (1.7 kB)
Requirement already satisfied: xxhash>=3.5.0 in /home/ds_user1/.local/lib/python3.11/site-packages (from langgraph->-r requirements.txt (line 8)) (3.5.0)
Collecting XlsxWriter>=0.5.7 (from python-pptx->-r requirements.txt (line 9))
  Downloading xlsxwriter-3.2.9-py3-none-any.whl.metadata (2.7 kB)
Collecting lxml>=3.1.0 (from python-pptx->-r requirements.txt (line 9))
  Downloading lxml-6.1.0-cp311-cp311-manylinux_2_26_x86_64.manylinux_2_28_x86_64.whl.metadata (4.0 kB)
Requirement already satisfied: bcrypt>=3.1.0 in /home/ds_user1/.local/lib/python3.11/site-packages (from passlib[bcrypt]->-r requirements.txt (line 13)) (4.3.0)
Collecting ecdsa!=0.15 (from python-jose[cryptography]->-r requirements.txt (line 14))
  Downloading ecdsa-0.19.2-py2.py3-none-any.whl.metadata (29 kB)
Requirement already satisfied: rsa!=4.1.1,!=4.4,<5.0,>=4.0 in /home/ds_user1/.local/lib/python3.11/site-packages (from python-jose[cryptography]->-r requirements.txt (line 14)) (4.9.1)
Requirement already satisfied: pyasn1>=0.5.0 in /home/ds_user1/.local/lib/python3.11/site-packages (from python-jose[cryptography]->-r requirements.txt (line 14)) (0.6.1)
Collecting cryptography>=3.4.0 (from python-jose[cryptography]->-r requirements.txt (line 14))
  Downloading cryptography-48.0.0-cp311-abi3-manylinux_2_28_x86_64.whl.metadata (4.3 kB)
Requirement already satisfied: idna>=2.8 in /usr/local/lib/python3.11/dist-packages (from anyio<5.0.0,>=4.8.0->google-genai->-r requirements.txt (line 1)) (3.7)
Collecting cffi>=2.0.0 (from cryptography>=3.4.0->python-jose[cryptography]->-r requirements.txt (line 14))
  Downloading cffi-2.0.0-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.whl.metadata (2.6 kB)
Requirement already satisfied: six>=1.9.0 in /usr/local/lib/python3.11/dist-packages (from ecdsa!=0.15->python-jose[cryptography]->-r requirements.txt (line 14)) (1.16.0)
Requirement already satisfied: pyasn1-modules>=0.2.1 in /home/ds_user1/.local/lib/python3.11/site-packages (from google-auth<3.0.0,>=2.48.1->google-auth[requests]<3.0.0,>=2.48.1->google-genai->-r requirements.txt (line 1)) (0.4.2)
Requirement already satisfied: certifi in /usr/local/lib/python3.11/dist-packages (from httpx<1.0.0,>=0.28.1->google-genai->-r requirements.txt (line 1)) (2024.6.2)
Requirement already satisfied: httpcore==1.* in /home/ds_user1/.local/lib/python3.11/site-packages (from httpx<1.0.0,>=0.28.1->google-genai->-r requirements.txt (line 1)) (1.0.9)
Requirement already satisfied: jsonpatch<2.0.0,>=1.33.0 in /home/ds_user1/.local/lib/python3.11/site-packages (from langchain-core<2.0.0,>=1.4.0->langchain->-r requirements.txt (line 6)) (1.33)
Collecting langchain-protocol>=0.0.14 (from langchain-core<2.0.0,>=1.4.0->langchain->-r requirements.txt (line 6))
  Downloading langchain_protocol-0.0.15-py3-none-any.whl.metadata (2.4 kB)
Requirement already satisfied: langsmith<1.0.0,>=0.3.45 in /home/ds_user1/.local/lib/python3.11/site-packages (from langchain-core<2.0.0,>=1.4.0->langchain->-r requirements.txt (line 6)) (0.4.23)
Requirement already satisfied: packaging>=23.2.0 in /usr/local/lib/python3.11/dist-packages (from langchain-core<2.0.0,>=1.4.0->langchain->-r requirements.txt (line 6)) (24.0)
Requirement already satisfied: pyyaml<7.0.0,>=5.3.0 in /usr/local/lib/python3.11/dist-packages (from langchain-core<2.0.0,>=1.4.0->langchain->-r requirements.txt (line 6)) (6.0.1)
Collecting uuid-utils<1.0,>=0.12.0 (from langchain-core<2.0.0,>=1.4.0->langchain->-r requirements.txt (line 6))
  Downloading uuid_utils-0.15.0-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (6.5 kB)
Collecting ormsgpack>=1.12.0 (from langgraph-checkpoint<5.0.0,>=4.1.0->langgraph->-r requirements.txt (line 8))
  Downloading ormsgpack-1.12.2-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (3.2 kB)
Collecting orjson>=3.11.5 (from langgraph-sdk<0.4.0,>=0.3.0->langgraph->-r requirements.txt (line 8))
  Downloading orjson-3.11.9-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (41 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 42.0/42.0 kB 5.3 MB/s eta 0:00:00
Requirement already satisfied: annotated-types>=0.6.0 in /home/ds_user1/.local/lib/python3.11/site-packages (from pydantic<3.0.0,>=2.9.0->google-genai->-r requirements.txt (line 1)) (0.7.0)
Requirement already satisfied: pydantic-core==2.41.5 in /home/ds_user1/.local/lib/python3.11/site-packages (from pydantic<3.0.0,>=2.9.0->google-genai->-r requirements.txt (line 1)) (2.41.5)
Requirement already satisfied: charset-normalizer<4,>=2 in /usr/local/lib/python3.11/dist-packages (from requests<3.0.0,>=2.28.1->google-genai->-r requirements.txt (line 1)) (3.3.2)
Requirement already satisfied: urllib3<3,>=1.21.1 in /usr/local/lib/python3.11/dist-packages (from requests<3.0.0,>=2.28.1->google-genai->-r requirements.txt (line 1)) (2.2.1)
Requirement already satisfied: pycparser in /usr/local/lib/python3.11/dist-packages (from cffi>=2.0.0->cryptography>=3.4.0->python-jose[cryptography]->-r requirements.txt (line 14)) (2.22)
Requirement already satisfied: jsonpointer>=1.9 in /usr/local/lib/python3.11/dist-packages (from jsonpatch<2.0.0,>=1.33.0->langchain-core<2.0.0,>=1.4.0->langchain->-r requirements.txt (line 6)) (2.4)
Requirement already satisfied: requests-toolbelt>=1.0.0 in /home/ds_user1/.local/lib/python3.11/site-packages (from langsmith<1.0.0,>=0.3.45->langchain-core<2.0.0,>=1.4.0->langchain->-r requirements.txt (line 6)) (1.0.0)
Requirement already satisfied: zstandard>=0.23.0 in /home/ds_user1/.local/lib/python3.11/site-packages (from langsmith<1.0.0,>=0.3.45->langchain-core<2.0.0,>=1.4.0->langchain->-r requirements.txt (line 6)) (0.24.0)
Downloading fastapi-0.136.1-py3-none-any.whl (117 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 117.7/117.7 kB 5.8 MB/s eta 0:00:00
Downloading langchain-1.3.1-py3-none-any.whl (114 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 114.3/114.3 kB 4.9 MB/s eta 0:00:00
Downloading langchain_google_genai-4.2.2-py3-none-any.whl (67 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 67.6/67.6 kB 5.7 MB/s eta 0:00:00
Downloading google_genai-1.75.0-py3-none-any.whl (793 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 793.7/793.7 kB 8.0 MB/s eta 0:00:00
Downloading langgraph-1.2.0-py3-none-any.whl (234 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 234.3/234.3 kB 12.3 MB/s eta 0:00:00
Downloading python_pptx-1.0.2-py3-none-any.whl (472 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 472.8/472.8 kB 12.2 MB/s eta 0:00:00
Downloading python_docx-1.2.0-py3-none-any.whl (252 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 253.0/253.0 kB 12.1 MB/s eta 0:00:00
Downloading pypdf-6.11.0-py3-none-any.whl (338 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 338.8/338.8 kB 14.7 MB/s eta 0:00:00
Downloading python_multipart-0.0.28-py3-none-any.whl (29 kB)
Downloading aiosmtplib-5.1.0-py3-none-any.whl (27 kB)
Downloading annotated_doc-0.0.4-py3-none-any.whl (5.3 kB)
Downloading cryptography-48.0.0-cp311-abi3-manylinux_2_28_x86_64.whl (4.7 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 4.7/4.7 MB 29.3 MB/s eta 0:00:00
Downloading ecdsa-0.19.2-py2.py3-none-any.whl (150 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 150.8/150.8 kB 43.1 MB/s eta 0:00:00
Downloading filetype-1.2.0-py2.py3-none-any.whl (19 kB)
Downloading google_auth-2.53.0-py3-none-any.whl (246 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 246.1/246.1 kB 43.7 MB/s eta 0:00:00
Downloading langchain_core-1.4.0-py3-none-any.whl (548 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 548.1/548.1 kB 44.3 MB/s eta 0:00:00
Downloading langgraph_checkpoint-4.1.0-py3-none-any.whl (56 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 56.0/56.0 kB 21.1 MB/s eta 0:00:00
Downloading langgraph_prebuilt-1.1.0-py3-none-any.whl (41 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 41.0/41.0 kB 15.8 MB/s eta 0:00:00
Downloading langgraph_sdk-0.3.14-py3-none-any.whl (97 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 97.0/97.0 kB 40.2 MB/s eta 0:00:00
Downloading lxml-6.1.0-cp311-cp311-manylinux_2_26_x86_64.manylinux_2_28_x86_64.whl (5.2 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 5.2/5.2 MB 53.8 MB/s eta 0:00:00
Downloading starlette-1.0.0-py3-none-any.whl (72 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 72.7/72.7 kB 5.4 MB/s eta 0:00:00
Downloading xlsxwriter-3.2.9-py3-none-any.whl (175 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 175.3/175.3 kB 52.0 MB/s eta 0:00:00
Downloading passlib-1.7.4-py2.py3-none-any.whl (525 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 525.6/525.6 kB 60.8 MB/s eta 0:00:00
Downloading python_jose-3.5.0-py2.py3-none-any.whl (34 kB)
Downloading cffi-2.0.0-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.whl (215 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 215.6/215.6 kB 68.8 MB/s eta 0:00:00
Downloading langchain_protocol-0.0.15-py3-none-any.whl (7.0 kB)
Downloading orjson-3.11.9-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (133 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 134.0/134.0 kB 48.8 MB/s eta 0:00:00
Downloading ormsgpack-1.12.2-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (212 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 212.4/212.4 kB 68.0 MB/s eta 0:00:00
Downloading uuid_utils-0.15.0-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (326 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 326.5/326.5 kB 57.1 MB/s eta 0:00:00
Installing collected packages: passlib, filetype, XlsxWriter, uuid-utils, python-multipart, pypdf, ormsgpack, orjson, lxml, langchain-protocol, ecdsa, cffi, annotated-doc, aiosmtplib, starlette, python-pptx, python-jose, python-docx, cryptography, langgraph-sdk, google-auth, fastapi, langchain-core, langgraph-checkpoint, google-genai, langgraph-prebuilt, langchain-google-genai, langgraph, langchain
  Attempting uninstall: ormsgpack
    Found existing installation: ormsgpack 1.10.0
    Uninstalling ormsgpack-1.10.0:
      Successfully uninstalled ormsgpack-1.10.0
  Attempting uninstall: orjson
    Found existing installation: orjson 3.11.3
    Uninstalling orjson-3.11.3:
      Successfully uninstalled orjson-3.11.3
  Attempting uninstall: langgraph-sdk
    Found existing installation: langgraph-sdk 0.2.5
    Uninstalling langgraph-sdk-0.2.5:
      Successfully uninstalled langgraph-sdk-0.2.5
  Attempting uninstall: google-auth
    Found existing installation: google-auth 2.40.3
    Uninstalling google-auth-2.40.3:
      Successfully uninstalled google-auth-2.40.3
  Attempting uninstall: langchain-core
    Found existing installation: langchain-core 0.3.75
    Uninstalling langchain-core-0.3.75:
      Successfully uninstalled langchain-core-0.3.75
  Attempting uninstall: langgraph-checkpoint
    Found existing installation: langgraph-checkpoint 2.1.1
    Uninstalling langgraph-checkpoint-2.1.1:
      Successfully uninstalled langgraph-checkpoint-2.1.1
  Attempting uninstall: google-genai
    Found existing installation: google-genai 1.51.0
    Uninstalling google-genai-1.51.0:
      Successfully uninstalled google-genai-1.51.0
  Attempting uninstall: langgraph-prebuilt
    Found existing installation: langgraph-prebuilt 0.6.4
    Uninstalling langgraph-prebuilt-0.6.4:
      Successfully uninstalled langgraph-prebuilt-0.6.4
  Attempting uninstall: langgraph
    Found existing installation: langgraph 0.6.6
    Uninstalling langgraph-0.6.6:
      Successfully uninstalled langgraph-0.6.6
ERROR: pip's dependency resolver does not currently take into account all the packages that are installed. This behaviour is the source of the following dependency conflicts.
langchain-openai 0.3.32 requires langchain-core<1.0.0,>=0.3.74, but you have langchain-core 1.4.0 which is incompatible.
Successfully installed XlsxWriter-3.2.9 aiosmtplib-5.1.0 annotated-doc-0.0.4 cffi-2.0.0 cryptography-48.0.0 ecdsa-0.19.2 fastapi-0.136.1 filetype-1.2.0 google-auth-2.53.0 google-genai-1.75.0 langchain-1.3.1 langchain-core-1.4.0 langchain-google-genai-4.2.2 langchain-protocol-0.0.15 langgraph-1.2.0 langgraph-checkpoint-4.1.0 langgraph-prebuilt-1.1.0 langgraph-sdk-0.3.14 lxml-6.1.0 orjson-3.11.9 ormsgpack-1.12.2 passlib-1.7.4 pypdf-6.11.0 python-docx-1.2.0 python-jose-3.5.0 python-multipart-0.0.28 python-pptx-1.0.2 starlette-1.0.0 uuid-utils-0.15.0

[notice] A new release of pip is available: 24.0 -> 26.1.1
[notice] To update, run: python3.11 -m pip install --upgrade pip
ds_user1@pjt20210247-aer2025090001-dp-74c8c8d5f-zb54g:/project/work/dmcontents/ai-marketing-app/backend$ uvicorn main:app --host 0.0.0.0 --port 9101
INFO:     Started server process [475]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:9101 (Press CTRL+C to quit)
INFO:     10.233.90.0:1171 - "GET / HTTP/1.1" 404 Not Found
^CINFO:     Shutting down
INFO:     Waiting for application shutdown.
INFO:     Application shutdown complete.
INFO:     Finished server process [475]
ds_user1@pjt20210247-aer2025090001-dp-74c8c8d5f-zb54g:/project/work/dmcontents/ai-marketing-app/backend$ # 1. 프론트엔드 프로젝트 루트  디렉토리로 이동
ds_user1@pjt20210247-aer2025090001-dp-74c8c8d5f-zb54g:/project/work/dmcontents/ai-marketing-app/backend$ cd /project/work/dmcontents/ai-marketing-app
ds_user1@pjt20210247-aer2025090001-dp-74c8c8d5f-zb54g:/project/work/dmcontents/ai-marketing-app$ 
ds_user1@pjt20210247-aer2025090001-dp-74c8c8d5f-zb54g:/project/work/dmcontents/ai-marketing-app$ # 2. 혹시나 꼬여있을 수 있는 기존 폴더 를 지우고 의존성을 클린 설치합니다.
ds_user1@pjt20210247-aer2025090001-dp-74c8c8d5f-zb54g:/project/work/dmcontents/ai-marketing-app$ rm -rf node_modules dist
ds_user1@pjt20210247-aer2025090001-dp-74c8c8d5f-zb54g:/project/work/dmcontents/ai-marketing-app$ npm install
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@eslint/config-array@0.23.5',
npm WARN EBADENGINE   required: { node: '^20.19.0 || ^22.13.0 || >=24' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@eslint/config-helpers@0.5.5',
npm WARN EBADENGINE   required: { node: '^20.19.0 || ^22.13.0 || >=24' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@eslint/core@1.2.1',
npm WARN EBADENGINE   required: { node: '^20.19.0 || ^22.13.0 || >=24' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@eslint/js@10.0.1',
npm WARN EBADENGINE   required: { node: '^20.19.0 || ^22.13.0 || >=24' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@eslint/object-schema@3.0.5',
npm WARN EBADENGINE   required: { node: '^20.19.0 || ^22.13.0 || >=24' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@eslint/plugin-kit@0.7.1',
npm WARN EBADENGINE   required: { node: '^20.19.0 || ^22.13.0 || >=24' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@humanfs/core@0.19.2',
npm WARN EBADENGINE   required: { node: '>=18.18.0' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@humanfs/node@0.16.8',
npm WARN EBADENGINE   required: { node: '>=18.18.0' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@humanfs/types@0.15.0',
npm WARN EBADENGINE   required: { node: '>=18.18.0' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@humanwhocodes/retry@0.4.3',
npm WARN EBADENGINE   required: { node: '>=18.18' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@puppeteer/browsers@3.0.2',
npm WARN EBADENGINE   required: { node: '>=22.12.0' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@tailwindcss/oxide@4.3.0',
npm WARN EBADENGINE   required: { node: '>= 20' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@typescript-eslint/eslint-plugin@8.59.3',
npm WARN EBADENGINE   required: { node: '^18.18.0 || ^20.9.0 || >=21.1.0' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@typescript-eslint/parser@8.59.3',
npm WARN EBADENGINE   required: { node: '^18.18.0 || ^20.9.0 || >=21.1.0' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@typescript-eslint/project-service@8.59.3',
npm WARN EBADENGINE   required: { node: '^18.18.0 || ^20.9.0 || >=21.1.0' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@typescript-eslint/scope-manager@8.59.3',
npm WARN EBADENGINE   required: { node: '^18.18.0 || ^20.9.0 || >=21.1.0' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@typescript-eslint/tsconfig-utils@8.59.3',
npm WARN EBADENGINE   required: { node: '^18.18.0 || ^20.9.0 || >=21.1.0' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@typescript-eslint/type-utils@8.59.3',
npm WARN EBADENGINE   required: { node: '^18.18.0 || ^20.9.0 || >=21.1.0' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@typescript-eslint/types@8.59.3',
npm WARN EBADENGINE   required: { node: '^18.18.0 || ^20.9.0 || >=21.1.0' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@typescript-eslint/typescript-estree@8.59.3',
npm WARN EBADENGINE   required: { node: '^18.18.0 || ^20.9.0 || >=21.1.0' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@typescript-eslint/utils@8.59.3',
npm WARN EBADENGINE   required: { node: '^18.18.0 || ^20.9.0 || >=21.1.0' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@typescript-eslint/visitor-keys@8.59.3',
npm WARN EBADENGINE   required: { node: '^18.18.0 || ^20.9.0 || >=21.1.0' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@vitejs/plugin-react@6.0.2',
npm WARN EBADENGINE   required: { node: '^20.19.0 || >=22.12.0' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'balanced-match@4.0.4',
npm WARN EBADENGINE   required: { node: '18 || 20 || >=22' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'brace-expansion@5.0.6',
npm WARN EBADENGINE   required: { node: '18 || 20 || >=22' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'chromium-bidi@16.0.1',
npm WARN EBADENGINE   required: { node: '>=20.19.0 <22.0.0 || >=22.12.0' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'eslint@10.3.0',
npm WARN EBADENGINE   required: { node: '^20.19.0 || ^22.13.0 || >=24' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'eslint-plugin-react-hooks@7.1.1',
npm WARN EBADENGINE   required: { node: '>=18' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'eslint-scope@9.1.2',
npm WARN EBADENGINE   required: { node: '^20.19.0 || ^22.13.0 || >=24' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'eslint-visitor-keys@5.0.1',
npm WARN EBADENGINE   required: { node: '^20.19.0 || ^22.13.0 || >=24' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'espree@11.2.0',
npm WARN EBADENGINE   required: { node: '^20.19.0 || ^22.13.0 || >=24' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'globals@17.6.0',
npm WARN EBADENGINE   required: { node: '>=18' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'minimatch@10.2.5',
npm WARN EBADENGINE   required: { node: '18 || 20 || >=22' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'puppeteer@25.0.2',
npm WARN EBADENGINE   required: { node: '>=22.12.0' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'puppeteer-core@25.0.2',
npm WARN EBADENGINE   required: { node: '>=22.12.0' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'rolldown@1.0.1',
npm WARN EBADENGINE   required: { node: '^20.19.0 || >=22.12.0' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'ts-api-utils@2.5.0',
npm WARN EBADENGINE   required: { node: '>=18.12' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'typescript-eslint@8.59.3',
npm WARN EBADENGINE   required: { node: '^18.18.0 || ^20.9.0 || >=21.1.0' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'vite@8.0.13',
npm WARN EBADENGINE   required: { node: '^20.19.0 || >=22.12.0' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'zod-validation-error@4.0.2',
npm WARN EBADENGINE   required: { node: '>=18.0.0' },
npm WARN EBADENGINE   current: { node: 'v16.20.2', npm: '8.19.4' }
npm WARN EBADENGINE }
npm WARN deprecated whatwg-encoding@2.0.0: Use @exodus/bytes instead for a more spec-conformant and faster implementation
npm WARN deprecated w3c-hr-time@1.0.2: Use your platform's native performance.now() and performance.timeOrigin.
npm WARN deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
npm WARN deprecated npmlog@5.0.1: This package is no longer supported.
npm WARN deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm WARN deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm WARN deprecated domexception@4.0.0: Use your platform's native DOMException instead
npm WARN deprecated are-we-there-yet@2.0.0: This package is no longer supported.
npm WARN deprecated gauge@3.0.2: This package is no longer supported.
npm WARN deprecated abab@2.0.6: Use your platform's native atob() and btoa() methods instead
npm WARN deprecated tar@6.2.1: Old versions of tar are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me

added 351 packages, and audited 352 packages in 24s

65 packages are looking for funding
  run `npm fund` for details

7 vulnerabilities (3 low, 4 high)

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
npm notice 
npm notice New major version of npm available! 8.19.4 -> 11.14.1
npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.14.1
npm notice Run npm install -g npm@11.14.1 to update!
npm notice 
ds_user1@pjt20210247-aer2025090001-dp-74c8c8d5f-zb54g:/project/work/dmcontents/ai-marketing-app$ 
ds_user1@pjt20210247-aer2025090001-dp-74c8c8d5f-zb54g:/project/work/dmcontents/ai-marketing-app$ # 3. 프론트엔드 정적 컴파일 수행 (dist/ 폴더 생성)
ds_user1@pjt20210247-aer2025090001-dp-74c8c8d5f-zb54g:/project/work/dmcontents/ai-marketing-app$ npm run build

> ai-marketing-app@0.0.0 build
> vite build

You are using Node.js 16.20.2. Vite requires Node.js version 20.19+ or 22.12+. Please upgrade your Node.js version.
file:///project/work/dmcontents/ai-marketing-app/node_modules/vite/dist/node/cli.js:533
                                this.dispatchEvent(new CustomEvent(`command:${commandName}`, { detail: command }));
                                                       ^

ReferenceError: CustomEvent is not defined
    at EventTarget.parse (file:///project/work/dmcontents/ai-marketing-app/node_modules/vite/dist/node/cli.js:533:28)
    at file:///project/work/dmcontents/ai-marketing-app/node_modules/vite/dist/node/cli.js:834:5
    at ModuleJob.run (node:internal/modules/esm/module_job:193:25)
    at async Promise.all (index 0)
    at async ESMLoader.import (node:internal/modules/esm/loader:530:24)
ds_user1@pjt20210247-aer2025090001-dp-74c8c8d5f-zb54g:/project/work/dmcontents/ai-marketing-app$ cd backend
ds_user1@pjt20210247-aer2025090001-dp-74c8c8d5f-zb54g:/project/work/dmcontents/ai-marketing-app/backend$ uvicorn main:app --host 0.0.0.0 --port 9101
INFO:     Started server process [538]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:9101 (Press CTRL+C to quit)
INFO:     10.233.99.192:39900 - "GET / HTTP/1.1" 404 Not Found
