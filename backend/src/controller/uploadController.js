const cloudinary = require('../config/cloudinary');

exports.getUploadSignature = async (req, res, next) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'bekal-opat';
    
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      success: true,
      data: {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
        folder,
      },
    });
  } catch (error) {
    next(error);
  }
};