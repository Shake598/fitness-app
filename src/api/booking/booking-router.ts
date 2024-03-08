import express, { Request, Response } from 'express';
import { Booking } from './booking';
import { isClientOrAdmin } from '../../middleware/check-role';
import { validateBookingTime } from '../../middleware/validate-booking-time';
import { NotFoundException } from '../../utils/error-handler';

export const bookingRouter = express.Router();

bookingRouter.get('/bookings/:clientId', isClientOrAdmin, async (req: Request, res: Response) => {
    try {
        const clientId = req.params.clientId;

        const bookings = await Booking.find({ client: clientId });

        if (!bookings || bookings.length === 0) {
            return res.status(404).send({ message: 'No bookings found for this client.' });
        }

        res.status(200).send(bookings);
    } catch (error: any) {
        res.status(500).send({ error: 'Internal server error.' });
    }
});

bookingRouter.post('/bookings', isClientOrAdmin, validateBookingTime, async (req: Request, res: Response) => {
    try {
        const { availability, client, startTime, endTime } = req.body;

        const newBooking = new Booking({ availability, client, startTime, endTime });
        await newBooking.save();

        res.status(201).send({ message: 'Booking created successfully.' });
    } catch (error: any) {
        res.status(error.status).send(error.message);
    }
});

bookingRouter.patch('/bookings/:bookingId', isClientOrAdmin, validateBookingTime, async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    try {
        const updatedBooking = await Booking.findByIdAndUpdate(bookingId, req.body, { new: true });
        if (!updatedBooking) {
            throw new NotFoundException('Booking not found');
        }
        res.status(200).send(updatedBooking);
    } catch (error: any) {
        res.status(error.status).send(error.message);
    }
});

bookingRouter.delete('/bookings/:bookingId', isClientOrAdmin, async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    try {
        const deletedBooking = await Booking.findByIdAndDelete(bookingId);
        if (!deletedBooking) {
            throw new NotFoundException('Booking not found');
        }
        res.status(200).send({ message: 'Booking deleted successfully' });
    } catch (error: any) {
        res.status(error.status).send(error.message);
    }
});