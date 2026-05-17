3. 깨끗해진 포트 위에서 최신 빌드가 적용된 백엔드 서버를 다시 실행합니다!
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app/backend$ uvicorn main:app --host 0.0.0.0 --port 9101 --workers 4
ERROR:    [Errno 98] Address already in use
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app/backend$ pkill -f uvicorn
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app/backend$ cd /project/work/dmcontents/ai-marketing-app/backend
ds_user1@pjt20210247-aer2025090001-dp-7c8455d89d-p5x9n:/project/work/dmcontents/ai-marketing-app/backend$ uvicorn main:app --host 0.0.0.0 --port 9101 --workers 4
INFO:     Uvicorn running on http://0.0.0.0:9101 (Press CTRL+C to quit)
INFO:     Started parent process [13587]
INFO:     Started server process [13591]
INFO:     Waiting for application startup.
INFO:     Started server process [13592]
INFO:     Waiting for application startup.
INFO:     Started server process [13590]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Application startup complete.
INFO:     Application startup complete.
INFO:     Started server process [13589]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     10.233.99.192:40116 - "GET / HTTP/1.1" 404 Not Found
INFO:     10.233.90.0:18561 - "GET / HTTP/1.1" 404 Not Found
