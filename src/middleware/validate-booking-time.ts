import express, { Request, Response, NextFunction } from 'express';
import { Booking } from '../api/booking/booking';
import { Availability } from '../api/availability/availability';
import { BadRequestException, NotFoundException } from '../utils/error-handler';

export const bookingsRouter = express.Router();

export const validateBookingTime = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { availability, startTime, endTime } = req.body;

        const startHour = parseInt(startTime.split(':')[0]);
        const startMinute = parseInt(startTime.split(':')[1]);
        const endHour = parseInt(endTime.split(':')[0]);
        const endMinute = parseInt(endTime.split(':')[1]);

        const durationInMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
        if (durationInMinutes < 60) {
            throw new BadRequestException('Booking duration must be at least 1 hour.');
        }

        const availabilityData = await Availability.findById(availability);
        if (!availabilityData) {
            throw new NotFoundException('Availability not found.');
        }

        const availabilityStartHour = parseInt(availabilityData.startTime.split(':')[0]);
        const availabilityStartMinute = parseInt(availabilityData.startTime.split(':')[1]);
        const availabilityEndHour = parseInt(availabilityData.endTime.split(':')[0]);
        const availabilityEndMinute = parseInt(availabilityData.endTime.split(':')[1]);

        if (
            (startHour < availabilityStartHour || (startHour === availabilityStartHour && startMinute < availabilityStartMinute)) ||
            (endHour > availabilityEndHour || (endHour === availabilityEndHour && endMinute > availabilityEndMinute))
        ) {
            throw new BadRequestException('Booking must be within the trainer\'s availability.');
        }

        const existingBookings = await Booking.find({ availability: availability });
        const collidingBooking = existingBookings.find(booking => {
            const existingStartHour = parseInt(booking.startTime.split(':')[0]);
            const existingStartMinute = parseInt(booking.startTime.split(':')[1]);
            const existingEndHour = parseInt(booking.endTime.split(':')[0]);
            const existingEndMinute = parseInt(booking.endTime.split(':')[1]);

            if (
                (startHour < existingEndHour || (startHour === existingEndHour && startMinute < existingEndMinute)) &&
                (endHour > existingStartHour || (endHour === existingStartHour && endMinute > existingStartMinute))
            ) {
                return true;
            }
            return false;
        });

        if (collidingBooking) {
            throw new BadRequestException('The chosen time slot is already booked. Please select a different time.');
        }

        next();
    } catch (error) {
        next(error);
    }
};