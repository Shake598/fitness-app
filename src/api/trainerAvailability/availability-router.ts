import express, { Request, Response } from 'express';
import { Availability } from './availability';
import { Trainer } from '../trainer/trainer'

export const availabilityRouter = express.Router();

availabilityRouter.post('/availability', async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(403).send({ error: 'Unauthorized access' });
        }
        const { trainer, startDate, endDate, startTime, endTime } = req.body;

        const newAvailability = new Availability({ trainer, startDate, endDate, startTime, endTime });
        await newAvailability.save();

        res.status(201).send({ message: 'Availability hours added successfully' });
    } catch (error) {
        console.error('Error creating availability:', error);
        res.status(500).send({ error: 'An error occurred while creating availability hours' });
    }
});

availabilityRouter.get('/availability/:trainerId', async (req: Request, res: Response) => {
    const trainerId = req.params.trainerId;
    try {
        const availabilities = await Availability.find({ trainer: trainerId });

        res.status(200).send(availabilities);
    } catch (error) {
        console.error('Error fetching availabilities:', error);
        res.status(500).send({ error: 'An error occurred while fetching availabilities' });
    }
});

availabilityRouter.patch('/availability/:availabilityId', async (req: Request, res: Response) => {
    try {
        const availabilityId = req.params.availabilityId;
        const { startDate, endDate, startTime, endTime } = req.body;

        const availability = await Availability.findById(availabilityId);
        if (!availability) {
            return res.status(404).send({ error: 'Availability not found' });
        }

        availability.startDate = startDate || availability.startDate;
        availability.endDate = endDate || availability.endDate;
        availability.startTime = startTime || availability.startTime;
        availability.endTime = endTime || availability.endTime;

        await availability.save();

        res.status(200).send({ message: 'Availability updated successfully' });
    } catch (error) {
        console.error('Error updating availability:', error);
        res.status(500).send({ error: 'An error occurred while updating availability' });
    }
});

availabilityRouter.delete('/availability/:availabilityId', async (req: Request, res: Response) => {
    try {
        const availabilityId = req.params.availabilityId;

        await Availability.findByIdAndDelete(availabilityId);

        res.status(200).send({ message: 'Availability deleted successfully' });
    } catch (error) {
        console.error('Error deleting availability:', error);
        res.status(500).send({ error: 'An error occurred while deleting availability' });
    }
});