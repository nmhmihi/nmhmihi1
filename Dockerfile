# 1. Dùng Node.js bản nhẹ nhất
FROM node:18-alpine

# 2. Tạo thư mục làm việc
WORKDIR /app

# 3. Copy file cấu hình trước
COPY package*.json ./

# 4. Cài đặt thư viện (thêm cờ để tránh lỗi xung đột)
RUN npm install --legacy-peer-deps

# 5. Copy toàn bộ code còn lại
COPY . .

# 6. Biên dịch Next.js
RUN npm run build

# 7. Mở cổng 8080 cho Google Cloud
EXPOSE 8080
ENV PORT 8080

# 8. Chạy ứng dụng
CMD ["npm", "start"]
