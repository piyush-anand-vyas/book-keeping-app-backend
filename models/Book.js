const mongoose = require('mongoose');
const {Schema} = mongoose;

const BookSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    category: {
        type: String,
        default: 'General'
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('book', BookSchema)