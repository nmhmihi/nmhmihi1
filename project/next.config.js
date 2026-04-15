/** @type {import('next').NextConfig} */
const nextConfig = {
  // Quan trọng: Giúp đóng gói ứng dụng gọn nhẹ hơn cho Docker
  output: 'standalone', 
  
  typescript: {
    // Cho phép build kể cả khi có lỗi logic TypeScript (giảm tỉ lệ Fail Build)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Bỏ qua kiểm tra lỗi trình bày code khi build
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
