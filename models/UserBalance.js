const mongoose = require('mongoose');
const {Schema} = mongoose;

const UserBalanceSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
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

module.exports = mongoose.model('userBalance', UserBalanceSchema)