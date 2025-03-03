# Stage 1: Build Next.js
FROM node:18 AS build
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve ด้วย Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html