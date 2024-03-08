import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Trainer } from './trainer';
import { User } from '../user/user';
import { isTrainerOrAdmin, isLoggedIn } from '../../middleware/check-role';
import { NotFoundException } from '../../utils/error-handler';

export const trainerRouter = express.Router();

trainerRouter.get('/trainers',isLoggedIn , async (req: Request, res: Response) => {
  const limit = Number(req.query.limit);
  const skip = Number(req.query.skip);

  try {
    const trainers = await Trainer.find({}, { first_name: 1, last_name: 1, specialization: 1, experience: 1, email: 1 }, { skip, limit });
      res.send(trainers);
    } catch (error: any) {
      res.status(error.status).send(error.message);
  }
});
 
trainerRouter.get('/trainers/:id', isTrainerOrAdmin, async (req: Request, res: Response) => {
    const trainerId = req.params.id;
    try {
      const trainer = await Trainer.findById(trainerId);
      if (!trainer) {
        throw new NotFoundException('Trainer not found');
      }
      res.send(trainer);
    } catch (error: any) {
      res.status(error.status).send(error.message);
    }
});

trainerRouter.patch('/trainers/:id', isTrainerOrAdmin, async (req: Request, res: Response) => {
  const trainerId = req.params.id;
  try {
    const originalTrainer = await Trainer.findById(trainerId);

    if (!originalTrainer) {
      throw new NotFoundException('Trainer not found');
    }

    const updatedTrainer = await Trainer.findByIdAndUpdate(trainerId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedTrainer) {
      throw new NotFoundException('Trainer not found');
    }

    const user = await User.findOne({ email: originalTrainer.email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.first_name = req.body.first_name || user.first_name;
    user.last_name = req.body.last_name || user.last_name;
    user.email = req.body.email || user.email;
    user.password = req.body.password ? await bcrypt.hash(req.body.password, 10) : user.password;

    await user.save();

    res.send({ updatedTrainer });
  } catch (error: any) {
    res.status(error.status).send(error.message);
  }
});

trainerRouter.delete('/trainers/:id', isTrainerOrAdmin, async (req: Request, res: Response) => {
  const trainerId = req.params.id;
  try {
    const deletedTrainer = await Trainer.findByIdAndDelete(trainerId);

    if (!deletedTrainer) {
      throw new NotFoundException('Trainer not found');
    }

    const deletedUser = await User.findOneAndDelete({ email: deletedTrainer.email });

    res.send({ message: 'Trainer account deleted successfully', deletedTrainer, deletedUser });
  } catch (error: any) {
    res.status(error.status).send(error.message);
  }
});