import mongoose, { Schema, Document } from 'mongoose';

export const Booking = mongoose.model('Booking', new mongoose.Schema({
    availability: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Availability', 
        required: true 
    },
    client: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Client', 
        required: true 
    },
    startTime: { 
        type: String, 
        required: true
    },
    endTime: { 
        type: String, 
        required: true  
    }
}));