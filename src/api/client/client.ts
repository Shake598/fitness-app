import mongoose from 'mongoose';
import validator from 'validator';

export const Client = mongoose.model('Client', new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    surname: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate(value: string) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        },
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value: string) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        validate(value: string) {
            if (!validator.isMobilePhone(value)) {
                throw new Error('Number is invalid');
            }
        }
    },
    peselNumber: {
        type: Number,
        required: true,
        trim: true,
        minlength: 11,
    },
    trainingHours: {
        type: [String],
        default: [],
    },
    selectedTrainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trainer',
    },
}));