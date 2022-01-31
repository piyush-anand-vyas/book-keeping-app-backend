const mongoose = require('mongoose');
const {Schema} = mongoose;

const CustomerBalanceSchema = new Schema({
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'customer',
        unique: true
    },
    amount: {
        type: Number,
        required: true,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('customerBalance', CustomerBalanceSchema)