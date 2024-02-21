import express, { Request, Response } from 'express';
import { Trainer } from './trainer';
import nodemailer from 'nodemailer';

const bcrypt = require('bcryptjs');
export const trainerRouter = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'fitness-app@gmail.com', 
      pass: 'Fitness-app123!',
  },
});

trainerRouter.post('/trainer-register', async (req: Request, res: Response) => {
    try {
        const existingTrainer = await Trainer.findOne({ email: req.body.email, phoneNumber: req.body.phoneNumber });
        if (existingTrainer) {
            return res.status(400).send({ error: 'Trainer with this email/phone number already exists' });
        } 

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const trainer = new Trainer(req.body);
        await trainer.save();

        const mailOptions = {
          from: 'fitness-app@gmail.com',
          to: req.body.email,
          subject: 'Registration confirmation',
          text: 'Thank you for registering as a trainer! Your profile has been successfully registered.',
      };

      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.error('An error occurred while sending the email', error);
          } else {
              console.log('E-mail sent', info.response);
          }
      });

        res.status(201).send({ message: 'Trainer registration successful' });
    } catch (error) {
        res.status(500).send({ error: 'An error occurred during trainer registration' });
    }
});

trainerRouter.get('/trainers/:id', async (req: Request, res: Response) => {
    const trainerId = req.params.id;
    try {
      if (!req.user || !(req.user.role === 'trainer' && req.user.id === trainerId) && req.user.role !== 'admin') {
          return res.status(403).send({ error: 'Unauthorized access' });
      }

      const trainer = await Trainer.findById(trainerId);
      if (!trainer) {
        return res.status(404).send({ error: 'Trainer with the given id does not exist' });
      }
      res.send(trainer);
    } catch (e) {
      res.status(500).send();
    }
});

trainerRouter.post('/trainer-login', async (req: Request, res: Response) => {
    try {
        const trainer = await Trainer.findOne({ email: req.body.email });
        if (!trainer) {
            return res.status(400).send({ error: 'Incorrect email address or password' });
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, trainer.password);
        if (!isPasswordMatch) {
            return res.status(400).send({ error: 'Incorrect email address or password' });
        }

        res.status(200).send({ message: 'The user has been successfully logged in' });
    } catch (error) {
        res.status(400).send({ error: 'There was a problem logging in' });
    }
});

trainerRouter.patch('/trainers/:id', async (req: Request, res: Response) => {
    const trainerId = req.params.id;

    try {
      if (!req.user || !(req.user.role === 'trainer' && req.user.id === trainerId) && req.user.role !== 'admin') {
          return res.status(403).send({ error: 'Unauthorized access' });
      }

      const updatedTrainer = await Trainer.findByIdAndUpdate(trainerId, req.body, {
        new: true,
        runValidators: true,
      });
  
      if (!updatedTrainer) {
        return res.status(404).send({ error: 'Trainer with the given id does not exist' });
      }
  
      res.send(updatedTrainer);
    } catch (error) {
      console.error('Error updating client:', error);
      res.status(400).send({ error: 'There was a problem updating the trainer profile' });
    }
  });

trainerRouter.delete('/trainers/:id', async (req: Request, res: Response) => {
  const trainerId = req.params.id;
  try {
    if (!req.user || !(req.user.role === 'trainer' && req.user.id === trainerId) && req.user.role !== 'admin') {
        return res.status(403).send({ error: 'Unauthorized access' });
    }

      const deletedTrainer = await Trainer.findByIdAndDelete(trainerId);
  
      if (!deletedTrainer) {
        return res.status(404).send({ error: 'Trainer with the given id does not exist' });
      }
  
      res.send(deletedTrainer);
    } catch (error) {
      res.status(500).send({ error: 'An error occurred while deleting the trainer profile' });
    }
  });