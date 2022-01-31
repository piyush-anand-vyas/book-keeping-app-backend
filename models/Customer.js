const mongoose = require('mongoose');
const {Schema} = mongoose;

const CustomerSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    mobileno: {
        type: String,
        required: true
    },
    address: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('customer', CustomerSchema)