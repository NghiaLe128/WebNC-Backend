const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

// Cấu hình Multer Storage sử dụng Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Thư mục trên Cloudinary
    format: async (req, file) => {
      // Dựa trên MIME type của file, trả về định dạng tương ứng
      const fileType = file.mimetype.split('/')[1]; // Lấy phần mở rộng từ MIME type (ví dụ: "jpeg", "png")
      if (['jpeg', 'jpg', 'png', 'gif'].includes(fileType)) {
        return fileType;
      }
      return 'jpg'; // Mặc định nếu không có trong danh sách
    },
    public_id: (req, file) => Date.now() + '-' + file.originalname, // Tên file
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
