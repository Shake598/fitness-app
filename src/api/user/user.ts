import mongoose from 'mongoose';

enum role {
    CLIENT = 'client',
    TRAINER = 'trainer',
    ADMIN = 'admin'
}

export const User = mongoose.model('User', new mongoose.Schema({
    first_name: {
        type: String,
    },
    last_name: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    role: {
        type: String,
        enum: Object.values(role),
    }
}));