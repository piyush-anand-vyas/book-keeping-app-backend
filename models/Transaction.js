const mongoose = require('mongoose');
const {Schema} = mongoose;

const TransactionSchema = new Schema({
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'customer'
    },
    amount: {
        type: Number,
        required: true
    },
    details: {
        type: String
    },
    type: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('transaction', TransactionSchema)