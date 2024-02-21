import mongoose from 'mongoose';
import validator from 'validator';

export const Trainer = mongoose.model('Trainer', new mongoose.Schema({
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
  specialization: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true
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
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    validate(value: string) {
        if (!validator.isMobilePhone(value)) {
            throw new Error ('Numer is invalid')
        }
    }
  },
}));
