import express, { Request, Response } from 'express';
import { Availability } from './availability';
import { isLoggedIn, isTrainerOrAdmin } from '../../middleware/check-role';
import { NotFoundException } from '../../utils/error-handler';
import { validateAvailabilityTime } from '../../middleware/validate-availability-time';

export const availabilityRouter = express.Router();

availabilityRouter.post('/availability', isTrainerOrAdmin, validateAvailabilityTime, async (req: Request, res: Response) => {
    try {
        const { trainer, date, startTime, endTime } = req.body;

        const newAvailability = new Availability({ trainer, date, startTime, endTime });
        await newAvailability.save();

        res.status(201).send({ message: 'Availability hours added successfully' });
    } catch (error: any) {
        res.status(error.status).send(error.message);
    }
});

availabilityRouter.get('/availability/:trainerId', isLoggedIn, async (req: Request, res: Response) => {
    const trainerId = req.params.trainerId;
    try {
        const availabilities = await Availability.find({ trainer: trainerId });

        res.send(availabilities);
    } catch (error: any) {
        res.status(error.status).send(error.message);
    }
});

availabilityRouter.patch('/availability/:availabilityId', isTrainerOrAdmin, validateAvailabilityTime, async (req: Request, res: Response) => {
    try {
        const availabilityId = req.params.availabilityId;
        const { date, startTime, endTime } = req.body;

        const availability = await Availability.findById(availabilityId);
        if (!availability) {
            throw new NotFoundException('Availability not found');
        }

        const updatedAvailability = await Availability.findOneAndUpdate(
            { _id: availabilityId },
            { $set: { date, startTime, endTime } }, 
            { new: true }
        );

        await availability.save();
        res.status(200).send({ message: 'Availability updated successfully' });
    } catch (error: any) {
        res.status(error.status).send(error.message);
    }
});

availabilityRouter.delete('/availability/:availabilityId', isTrainerOrAdmin, async (req: Request, res: Response) => {
    try {
        const availabilityId = req.params.availabilityId;

        await Availability.findByIdAndDelete(availabilityId);

        res.status(200).send({ message: 'Availability deleted successfully' });
    } catch (error: any) {
        res.status(error.status).send(error.message);
    }
});