import express, { Request, Response } from 'express';
import { Client } from './client';
import { Trainer } from '../trainer/trainer';

import nodemailer from 'nodemailer';

const bcrypt = require('bcryptjs');
export const clientRouter = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'fitness-app@gmail.com',
      pass: 'Fitness-app123!',
  },
});

declare global {
  namespace Express {
      interface Request {
          user?: any;
      }
  }
}

clientRouter.post('/client-register', async (req: Request, res: Response) => {
    try {
        const existingClient = await Client.findOne({ email: req.body.email, phoneNumber: req.body.phoneNumber });
        if (existingClient) {
            return res.status(400).send({ error: 'The user with provided email/phone number address already exists' });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const client = new Client(req.body);
        await client.save();

        const mailOptions = {
          from: 'fitness-app@gmail.com',
          to: req.body.email, 
          subject: 'Registration confirmation',
          text: 'Thank you for registering in our system! Your profile has been successfully registered.',
      };
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.error('An error occurred while sending the email', error);
          } else {
              console.log('E-mail sent', info.response);
          }
      });

        res.status(201).send({ message: 'Registration was successful' });
    } catch (error) {
        res.status(400).send({ error: 'There was a problem registering the user' });
    }
});

// clientRouter.get('/clients', async (req: Request, res: Response) => {
//     try {
//         const clients = await Client.find({});
//         res.send(clients);
//     } catch (error) {
//         console.error('Error fetching clients:', error);
//         res.status(500).send({ error: 'An error occurred while fetching users' });
//     }
// });

clientRouter.get('/client/:id', async (req: Request, res: Response) => {
    const clientId = req.params.id;
    try {
      if (!req.user || !(req.user.role === 'client' && req.user.id === clientId) && req.user.role !== 'admin') {
          return res.status(403).send({ error: 'Unauthorized access' });
      }

      const client = await Client.findById(clientId);
      if (!client) {
        return res.status(404).send({ error: 'User with the given id does not exist' });
      }
      res.send(client);
    } catch (e) {
      res.status(500).send();
    }
});

clientRouter.get('/trainers', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
        return res.status(403).send({ error: 'Unauthorized access' });
    }
        const trainers = await Trainer.find({}, { name: 1, surname: 1, specialization: 1, experience: 1, email: 1 });
        res.send(trainers);
    } catch (error) {
        console.error('Error fetching trainers:', error);
        res.status(500).send({ error: 'An error occurred while fetching trainers' });
    }
});

clientRouter.post('/login', async (req: Request, res: Response) => {
    try {
        const client = await Client.findOne({ email: req.body.email });
        if (!client) {
            return res.status(400).send({ error: 'Incorrect email address or password' });
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, client.password);
        if (!isPasswordMatch) {
            return res.status(400).send({ error: 'Incorrect email address or password' });
        }

        res.status(200).send({ message: 'The user has been successfully logged in' });
    } catch (error) {
        res.status(400).send({ error: 'There was a problem logging in' });
    }
});

clientRouter.get('/client/:id/training-hours', async (req: Request, res: Response) => {
    const clientId = req.params.id;

    try {
      if (!req.user || !(req.user.role === 'client' && req.user.id === clientId) && req.user.role !== 'admin') {
          return res.status(403).send({ error: 'Unauthorized access' });
      }

      const client = await Client.findById(clientId);
      if (!client) {
        return res.status(404).send({ error: 'User with the given id does not exist' });
      }
  
      const trainingHours = client.trainingHours;
      res.send(trainingHours);
    } catch (error) {
      console.error('Error fetching training hours:', error);
      res.status(500).send({ error: 'An error occurred while fetching training hours' });
    }
});

clientRouter.patch('/client/:id', async (req: Request, res: Response) => {
    const clientId = req.params.id;
    try {
      if (!req.user || !(req.user.role === 'client' && req.user.id === clientId) && req.user.role !== 'admin') {
        return res.status(403).send({ error: 'Unauthorized access' });
      }

      const updatedClient = await Client.findByIdAndUpdate(clientId, req.body, {
        new: true,
        runValidators: true,
      });
  
      if (!updatedClient) {
        return res.status(404).send({ error: 'User with the given id does not exist' });
      }
  
      res.send(updatedClient);
    } catch (error) {
      console.error('Error updating client:', error);
      res.status(400).send({ error: 'There was a problem updating the user profile' });
    }
});

clientRouter.delete('/client/:id', async (req: Request, res: Response) => {
  const clientId = req.params.id;
  try {
    if (!req.user || !(req.user.role === 'client' && req.user.id === clientId) && req.user.role !== 'admin') {
        return res.status(403).send({ error: 'Unauthorized access' });
    }

    const deletedClient = await Client.findByIdAndDelete(clientId);

    if (!deletedClient) {
      return res.status(404).send({ error: 'User with the given id does not exist' });
    }

    res.send(deletedClient);
  } catch (error) {
    res.status(500).send({ error: 'An error occurred while deleting the user profile' });
  }
});