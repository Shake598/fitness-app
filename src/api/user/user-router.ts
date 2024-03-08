import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from './user';
import { Client } from '../client/client';
import { Trainer } from '../trainer/trainer';
import { Admin } from '../admin/admin';
import { validateRegistration, validateLogin } from '../../validator/validator';
import { buildToken } from '../../validator/token-builder';
import { checkEmailTaken, checkUserExists } from '../../middleware/check-user';

export const userRouter = express.Router();

userRouter.post('/register', validateRegistration, checkEmailTaken, async (req: Request, res: Response) => {
    try {
        const {first_name, last_name, email, password, phoneNumber, role } = req.body;

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const user = new User({ first_name, last_name, email, password: hashedPassword, role });
        await user.save();

        switch (role) {
            case 'client':
                const newClient = new Client({ first_name, last_name, email, password: hashedPassword, phoneNumber });
                await newClient.save();
                break;
            case 'trainer':
                const newTrainer = new Trainer({ first_name, last_name, email, password: hashedPassword, phoneNumber });
                await newTrainer.save();
                break;
            case 'admin':
                const newAdmin = new Admin({ first_name, last_name, email, password: hashedPassword });
                await newAdmin.save();
                break;
            default:
                throw new Error('Invalid user role');
        }

        res.status(201).send({ message: 'Registration was successful' });
    } catch (error: any) {
        res.status(error.status).send(error.message);
    }
});

userRouter.post('/login', validateLogin, checkUserExists, async (req: Request, res: Response) => {
    try {     
        const user = res.locals.user;

        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).send({ error: 'Incorrect password' });
        }

        const token = buildToken(user);
        delete user.password;
        
        res.status(200).send({ message: 'The user has been successfully logged in', token });
    } catch (error: any) {
        res.status(error.status).send(error.message);
    }
});