const mongoose = require('mongoose');

const integratedRetailerSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        name: String
    }
);
module.exports = mongoose.model('IntegratedRetailer', integratedRetailerSchema);
