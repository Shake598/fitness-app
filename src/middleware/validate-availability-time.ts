// import { Request, Response, NextFunction } from 'express';
// import { BadRequestException } from '../utils/error-handler';

// export const validateAvailabilityTime = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { startTime, endTime } = req.body;

//         const [startHour, startMinute] = startTime.split(':').map(Number);
//         const [endHour, endMinute] = endTime.split(':').map(Number);

//         if (startHour < 8 || startHour > 20 || endHour < 9 || endHour > 21 || (endHour === 21 && endMinute > 0)) {
//             throw new BadRequestException('Availability must be between 8:00 and 21:00');
//         }

//         if ((startMinute !== 0 && startMinute !== 30) || (endMinute !== 0 && endMinute !== 30)) {
//             throw new BadRequestException('Start and end time must be at full hour or half hour');
//         }

//         const durationInMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
//         if (durationInMinutes < 60 || durationInMinutes > 120) {
//             throw new BadRequestException('Availability duration must be between 1 and 2 hours');
//         }

//         next();
//     } catch (error) {
//         next(error);
//     }
// };

import { Request, Response, NextFunction } from 'express';
import { BadRequestException } from '../utils/error-handler';
import { Availability } from '../api/availability/availability';

export const validateAvailabilityTime = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { trainer, date, startTime, endTime } = req.body;

        const existingAvailabilities = await Availability.find({
            trainer: trainer,
            date: date,
        });

        const collidingAvailability = existingAvailabilities.find(availability => {
            const existingStartHour = parseInt(availability.startTime.split(':')[0]);
            const existingStartMinute = parseInt(availability.startTime.split(':')[1]);
            const existingEndHour = parseInt(availability.endTime.split(':')[0]);
            const existingEndMinute = parseInt(availability.endTime.split(':')[1]);

            const [startHour, startMinute] = startTime.split(':').map(Number);
            const [endHour, endMinute] = endTime.split(':').map(Number);

            if (
                (startHour < existingEndHour || (startHour === existingEndHour && startMinute < existingEndMinute)) &&
                (endHour > existingStartHour || (endHour === existingStartHour && endMinute > existingStartMinute))
            ) {
                return true;
            }
            return false;
        });

        if (collidingAvailability) {
            throw new BadRequestException('The chosen time slot is already booked. Please select a different time.');
        }

        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
            throw new BadRequestException('Start time must be earlier than end time.');
        }

        if ((startMinute !== 0 && startMinute !== 30) || (endMinute !== 0 && endMinute !== 30)) {
            throw new BadRequestException('Start and end time must be at full hour or half hour');
        }

        const durationInMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
        if (durationInMinutes < 60 || durationInMinutes > 120) {
            throw new BadRequestException('Availability duration must be between 1 and 2 hours');
        }

        if (startHour < 8 || startHour > 20 || endHour < 9 || endHour > 21 || (endHour === 21 && endMinute > 0)) {
            throw new BadRequestException('Availability must be between 8:00 and 21:00');
        }

        next();
    } catch (error) {
        next(error);
    }
};