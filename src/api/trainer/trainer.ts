import mongoose from 'mongoose';

export const Trainer = mongoose.model('Trainer', new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
  },
  experience: {
    type: String,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  availability: {
    type: String,
  }
}));