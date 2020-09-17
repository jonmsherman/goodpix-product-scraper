const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        color: String,
        productId: String,
        brand: String,
        category: [
            {
                type: String
            }
        ],
        description: [
            {
                type: String
            }
        ],
        images: [{
            type: String
        }],
        junior: Boolean,
        maternity: Boolean,
        merchant: String,
        name: String,
        newArrival: Boolean,
        onSale: Boolean,
        petite: Boolean,
        plusSize: Boolean,
        productURL: String,
        retailPrice: Number,
        salePrice: Number,
        sizes: [{
            type: String
        }],
        variants: [{
            type: String
        }],
        intRetailerInfo: {
            externalProductId: mongoose.Schema.Types.Mixed,
            intRetailerId: { type: mongoose.Schema.Types.ObjectId, ref: 'IntRetailer' }
        },
        directSaleRetailerInfo: {
            externalProductId: mongoose.Schema.Types.Mixed,
            directSaleRetailerId: { type: mongoose.Schema.Types.ObjectId, ref: 'DirectSaleRetailer' }
        },
        video: String,
        colorFlag: String,
        scrapped: Boolean,
        affiliateLink: String,
        lastModified: Date,
        sku: String,
        isArchived: Boolean
    },
    { collection: 'products' }
);
module.exports = mongoose.model('Product', productSchema);
