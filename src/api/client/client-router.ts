import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Client } from './client';
import { User } from '../user/user';
import { isClientOrAdmin } from '../../middleware/check-role';
import { NotFoundException } from '../../utils/error-handler';

export const clientRouter = express.Router();

clientRouter.get('/clients/:id', isClientOrAdmin, async (req: Request, res: Response) => {
  const clientId = req.params.id;
  try {
    const client = await Client.findById(clientId);
    if (!client) {
      throw new NotFoundException('User not found');
    }
    res.send(client);
  } catch (error: any) {
    res.status(error.status).send(error.message);
  }
});

clientRouter.patch('/clients/:id', isClientOrAdmin, async (req: Request, res: Response) => {
  const clientId = req.params.id;
  try {
    const originalClient = await Client.findById(clientId);

    if (!originalClient) {
      throw new NotFoundException('Client not found');
    }

    const updatedClient = await Client.findByIdAndUpdate(clientId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedClient) {
      throw new NotFoundException('Client not found');
    }

    const user = await User.findOne({ email: originalClient.email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.first_name = req.body.first_name || user.first_name;
    user.last_name = req.body.last_name || user.last_name;
    user.email = req.body.email || user.email;
    user.password = req.body.password ? await bcrypt.hash(req.body.password, 10) : user.password;

    await user.save();

    res.send({ updatedClient, user });
  } catch (error: any) {
    res.status(error.status).send(error.message);
  }
});

clientRouter.delete('/clients/:id', isClientOrAdmin, async (req: Request, res: Response) => {
  const clientId = req.params.id;
  try {
    const deletedClient = await Client.findByIdAndDelete(clientId);

    if (!deletedClient) {
      throw new NotFoundException('Client not found');
    }

    const deletedUser = await User.findOneAndDelete({ email: deletedClient.email });

    res.send({ message: 'Client account deleted successfully', deletedClient, deletedUser });
  } catch (error: any) {
    res.status(error.status).send(error.message);
  }
});