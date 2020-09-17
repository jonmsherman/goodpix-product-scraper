const Product = require('../models/product');

const syncProducts = async (products) => {
    if (products.length > 0) {
        const bulkOperations = [];
        products.forEach((product) => {
            const upsertDocument = {
                updateOne: {
                    filter: {
                        'directSaleRetailerInfo.externalProductId':
                            product.directSaleRetailerInfo.externalProductId,
                    },
                    update: {$set : product },
                    upsert: true,
                },
            };
            bulkOperations.push(upsertDocument);
        });

        await Product.collection.bulkWrite(bulkOperations);
    }
};

const fetchUpdatedProducts = async (products) => {
    const externalProductIds = [];
    products.forEach((product) => {
        externalProductIds.push(
            product.directSaleRetailerInfo.externalProductId
        );
    });
    const updatedProducts = await Product.find({
        'directSaleRetailerInfo.externalProductId': { $in: externalProductIds },
    })
        .lean()
        .exec();

    return updatedProducts;
};

module.exports = {
    syncProducts,
    fetchUpdatedProducts,
};
