import multer from "multer";

const upload = multer({ 
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png','application/pdf', 'text/plain'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type! Supported formats: JPEG, PNG, PDF, TXT'), false);
        }
    }
})


export const uploadImages = upload.array('photos', 12);


