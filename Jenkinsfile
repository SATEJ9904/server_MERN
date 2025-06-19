pipeline {
    agent any

    environment {
        GITHUB_CREDENTIALS = 'github-creds'       // From Jenkins > Credentials
        MONGO_URI = 'mongodb://192.168.1.50:27017/StudentsDB'
    }

    stages {
        stage('Test') {
            steps {
                echo 'Jenkinsfile is working!'
            }
        }

        stage('Clone Repo') {
            steps {
                git credentialsId: "${GITHUB_CREDENTIALS}", url: 'https://github.com/SATEJ9904/server_MERN.git', branch: 'main'
            }
        }

        stage('Build Frontend') {
            steps {
                dir('client') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir('server') {
                    sh 'npm install'
                }
            }
        }

        stage('Write Dockerfile') {
            steps {
                writeFile file: 'Dockerfile', text: '''
# Multi-container not needed. We'll use docker-compose
FROM node:18-alpine AS base

# Build backend
WORKDIR /app
COPY server ./server
RUN cd server && npm install

# Build frontend
COPY client ./client
RUN cd client && npm install && npm run build

# Serve frontend + backend
FROM node:18-alpine
WORKDIR /app

# Copy from build stage
COPY --from=base /app/server ./server
COPY --from=base /app/client ./client

# Install prod deps for backend
RUN cd server && npm install --omit=dev

# Environment
ENV MONGO_URI=${MONGO_URI}
ENV NODE_ENV=production

WORKDIR /app/server
CMD ["npm", "start"]
'''
            }
        }

        stage('Write NGINX Config') {
            steps {
                sh '''
                mkdir -p nginx
                cat <<EOL > nginx/default.conf
server {
    listen 80;

    location /api/ {
        proxy_pass http://backend:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri /index.html;
    }
}
EOL
                '''
            }
        }

        stage('Write docker-compose.yml') {
            steps {
                writeFile file: 'docker-compose.yml', text: '''
version: '3.8'

services:
  backend:
    build: .
    container_name: mern-backend
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=${MONGO_URI}
    restart: always

  nginx:
    image: nginx:latest
    container_name: mern-nginx
    ports:
      - "8079:80"
    volumes:
      - ./client/build:/usr/share/nginx/html
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - backend
    restart: always
'''
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                sh 'docker-compose down || true'
                sh 'docker-compose up -d --build'
            }
        }
    }

    post {
        failure {
            echo '❌ Build or deployment failed.'
        }
        success {
            echo '✅ MERN stack successfully deployed!'
        }
    }
}
