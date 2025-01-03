# Sử dụng Node.js LTS image
FROM node:18-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép package.json và package-lock.json vào container
COPY package*.json ./

# Cài đặt các dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Expose port mà ứng dụng sử dụng
EXPOSE 4000

# Khởi chạy ứng dụng
CMD ["npm", "run", "dev"]
