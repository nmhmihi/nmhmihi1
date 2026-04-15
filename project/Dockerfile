# Bước 1: Build dự án
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Bước 2: Chạy dự án (Gọn nhẹ hơn)
FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8080
# Google Cloud Run yêu cầu biến môi trường PORT
ENV PORT 8080
ENV NODE_ENV production

CMD ["npm", "start"]
