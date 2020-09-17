const CloudinaryService = require('./services/cloudinaryService');
const AlgoliaService = require('./services/algoliaService');
const ProductService = require('./services/productService');
const carlisle = require('./sites/carlisle');
const etcetera = require('./sites/etcetera');
const { MONGO_DB_STRING } = require('./environment/environment');
const mongoose = require('mongoose');

const DirectSaleRetailer = require('./models/directSaleRetailer');
const Product = require('./models/product');

require('dotenv').config();

const sites = [etcetera];

CloudinaryService.init();

(async () => {
    for (let i = 0; i < sites.length; i++) {
        const currentSite = sites[i];
        const { brandName, baseUrl, parsePages } = currentSite;
        try {
            console.log(
                `---------------- ${brandName} Scrape Started ----------------`
            );

            // Start scrapping
            const totalProducts = await parsePages(baseUrl, []);

            await mongoose.connect(MONGO_DB_STRING, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                socketTimeoutMS: 0,
                keepAlive: true,
            });
            console.log('done connecting to database');

            const dsRetailer = await DirectSaleRetailer.findOne({
                name: brandName,
            }).exec();

            await Product.updateMany(
                { brand: brandName },
                { $set: { isArchived: true } }
            ).exec();

            for (let i = 0; i < totalProducts.length; i++) {
                console.log(`product ${i}`);

                const currentProduct = totalProducts[i];
                const directSaleRetailerInfo =
                    currentProduct.directSaleRetailerInfo;
                directSaleRetailerInfo.directSaleRetailerId = dsRetailer._id;
                const externalProductId =
                    directSaleRetailerInfo.externalProductId;
                const directSaleFilterProperty =
                    'directSaleRetailerInfo.externalProductId';
                try {
                    await CloudinaryService.addImagesToCloudinary(
                        currentProduct
                    );
                } catch {
                    console.log('could not load images into cloudinary');
                    console.log(currentProduct)
                    currentProduct.images = [];
                }

                // const storedProduct = await Product.findOne({
                //     [directSaleFilterProperty]: externalProductId,
                // }).exec();
                // try {
                //     if (!storedProduct) {
                //         await CloudinaryService.addImagesToCloudinary(
                //             currentProduct
                //         );
                //         console.log('adding images');
                //     } else {
                //         if (
                //             storedProduct.images &&
                //             storedProduct.images.length === 0
                //         ) {
                //             if (
                //                 currentProduct.images &&
                //                 currentProduct.images.length > 0
                //             ) {
                //                 const images = storedProduct.images;
                //                 const newImageUrl = await CloudinaryService.uploadImage(currentProduct.images[0])
                //                 images.push(newImageUrl);
                //                 await Product.updateOne(
                //                     {
                //                         _id: mongoose.Types.ObjectId(
                //                             storedProduct._id
                //                         ),
                //                     },
                //                     { $set: { 'product.images': images } }
                //                 );
                //             }
                //         }
                //     }
                // } catch (err) {
                // }
            }

            await ProductService.syncProducts(totalProducts);
            const updatedProducts = await ProductService.fetchUpdatedProducts(
                totalProducts
            );
            console.log('done updating products');

            mongoose.connection.close();

            AlgoliaService.updateIndex(brandName, updatedProducts);
            console.log('done with algolia');
            console.log(
                updatedProducts.length,
                `products of ${brandName} are pulled.`
            );

            console.log(
                `---------------- ${brandName} Scrape Ended ----------------`
            );
        } catch (err) {
            console.log(err);
        }
    }
})();
