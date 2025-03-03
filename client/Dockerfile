# ใช้ Node.js image เป็น base
FROM node:18-alpine AS builder

WORKDIR /app

# คัดลอก package.json และติดตั้ง dependencies
COPY package*.json ./
RUN npm install

# คัดลอกโค้ดทั้งหมดและ build
COPY . .
RUN npm run build

# รันแอปใน production
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

RUN npm install --production

EXPOSE 3000

CMD ["npm", "start"]