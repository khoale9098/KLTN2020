# Graduation thesis 2020 Project
![Checking CI](https://github.com/doonpy/KLTN2020/workflows/Checking%20CI/badge.svg?branch=KLTN2020)
![Docker Image CI](https://github.com/doonpy/KLTN2020/workflows/Docker%20Image%20CI/badge.svg?branch=KLTN2020)
## Overview
### Topic
Research about Visualization Data and build demo application with real estate data.
### Instructor
Master Luong Vi Minh
### Students
- 16110186 - Nguyen Duy Poon
- 16110121 - Le Dang Dang Khoa
    
## The overall system architecture
Updating

## Technical stacks
Updating

## API endpoints document
Reference to [here](https://documenter.getpostman.com/view/6309569/SzmZbeww?version=latest)

## How to run
### For development
❗**IMPORTANT:** Install dependencies with `npm install` before run any command following.

- To run REST API server: 
`npm run dev:api`
- To run Web server: 
`npm run dev:web`

### For deployment
- Install Docker: https://docs.docker.com/engine/install/ 
- Install Docker compose: https://docs.docker.com/compose/install/
- In root folder, run command to deploy application:
`docker-compose up --build -d`

### Notes
- You can config environment variables with:
    - REST API server and Background job: [api-server/src/env.ts](/api-server/src/env.ts)
    - Web server: [web-server/next-env.d.ts](/web-server/next-env.d.ts)

## Directory structure
```
.
|-- .github                         # CI job on GitHub
|-- api-server                      # REST API server
|   `-- src
|       |-- bgr-job
|       |   |-- child-process
|       |   |-- group-data
|       |   `-- scrape
|       |       |-- detail-url
|       |       `-- raw-data
|       |-- common
|       |-- middleware
|       |   |-- error-handler
|       |   `-- request-logger
|       |-- services
|       |   |-- catalog
|       |   |-- coordinate
|       |   |-- database
|       |   |   `-- mongodb
|       |   |-- detail-url
|       |   |-- exception
|       |   |-- grouped-data
|       |   |-- host
|       |   |-- pattern
|       |   `-- raw-data
|       `-- util
|           |-- chatbot
|           |-- checker
|           |   `-- type
|           |-- console
|           |-- datetime
|           |-- environment
|           |-- external-api
|           |-- file
|           |-- request
|           |-- string-handler
|           |-- url-handler
|           `-- validator
|-- archive                         # Source code of Specialized essay 2019
|-- dist                            # Source code after build
|-- public                          # Public folder which is created when background job is running. Contain logs
|   `-- logs
|       |-- detail-url-scrape
|       |-- group-data
|       `-- job-queue
|-- tools                           # For deploy application
|   `-- docker
|       |-- api
|       |-- bgr-job
|       `-- web
`-- web-server                      # Source code of Web server
    `-- src
        `-- pages
```

## Support and Contact
- Issue: [https://github.com/doonpy/KLTN2020/issues](https://github.com/doonpy/KLTN2020/issues)
- Contact: 
    - Email: 16110186@student.hcmute.edu.vn (Poon) | 16110121@student.hcmute.edu.vn (Khoa)
