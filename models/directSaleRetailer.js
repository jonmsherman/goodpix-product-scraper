const mongoose = require('mongoose');

const directSaleRetailerSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        name: String
    }
);
module.exports = mongoose.model('DirectSaleRetailer', directSaleRetailerSchema);
