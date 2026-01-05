# Backend Implementation Instructions

Since I am restricted to the `public` directory, I cannot write these files directly to `src/`. Please create them manually using the code below.

## 1. Environment & Database
**File:** `.env`
Update your connection string in this file. (I do not have the new password from your inbox).

## 2. Public Uploads Directory
Ensure `public/uploads` exists. (I have attempted to create this for you).

## 3. Install Middleware
Run this in your terminal:
```bash
npm install multer
```

## 4. Upload Middleware
**File:** `src/middleware/uploadMiddleware.js`

```javascript
const multer = require('multer');
const path = require('path');

// Cấu hình storage lưu vào public/uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        // Đặt tên file = timestamp + đuôi file gốc (vd: 17099999.jpg)
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Filter chỉ nhận file ảnh
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
};

module.exports = multer({ storage: storage, fileFilter: fileFilter });
```

## 5. Update Router
**File:** `src/routes/courseRoutes.js`

Add the import and update the routes:

```javascript
const upload = require('../middleware/uploadMiddleware'); // Import

// Route Tạo món (POST)
router.post('/', logRequest, protect, upload.single('image'), courseController.createCourse);

// Route Sửa món (PUT)
router.put('/:id', protect, admin, upload.single('image'), courseController.updateCourse);
```

## 6. Update Controller
**File:** `src/controllers/courseController.js`

Add this logic at the beginning of `createCourse` and `updateCourse`:

```javascript
if (req.file) {
    // Lưu đường dẫn tương đối để Frontend truy cập
    req.body.image = '/uploads/' + req.file.filename;
}
```

## 7. Enable CORS (Critical for Cloudflare Pages)
**File:** `src/app.js` or `server.js` (The main entry file of your backend)

Since you are hosting Frontend on Cloudflare and Backend on Render, you **MUST** enable CORS for the new domain.

```javascript
const cors = require('cors'); // Make sure to npm install cors

app.use(cors({
    origin: [
        'http://localhost:5500', 
        'http://127.0.0.1:5500', 
        'https://caphesaigon.pages.dev' // <--- ADD YOUR CLOUDFLARE DOMAIN HERE
    ],
    credentials: true
}));
```

