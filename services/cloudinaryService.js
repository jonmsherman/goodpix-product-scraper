const cloudinary = require('cloudinary').v2;
const {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET
} = require('../environment/environment');

const addImagesToCloudinary = async product => {
    const images = product.images;
    let cloudinaryImages = [];
    for (let j = 0; j < images.length; j++) {
        const result = await uploadImage(images[j]);
        const cloudinaryImageUrl = result.secure_url;
        cloudinaryImages.push(cloudinaryImageUrl);
    }
    product.images = cloudinaryImages;
};

const init = () => {
    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET
    });
};

const uploadImage = imageUrl => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            imageUrl,
            { height: 500, crop: 'scale' },
            (err, result) => {
                if (err) {
                    console.log(err);
                    return reject(err);
                }
                return resolve(result);
            }
        );
    });
};

module.exports = {
    init,
    uploadImage,
    addImagesToCloudinary
};
