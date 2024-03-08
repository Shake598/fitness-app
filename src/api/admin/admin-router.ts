import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Admin } from './admin';
import { User } from '../user/user';
import { Client } from '../client/client';
import { isAdmin } from '../../middleware/check-role';
import { NotFoundException } from '../../utils/error-handler';

export const adminRouter = express.Router();

adminRouter.get('/admins/:id', isAdmin, async (req: Request, res: Response) => {
    const adminId = req.params.id;
    try {
        const admin = await Admin.findById(adminId);
        if (!admin) {
            throw new NotFoundException('Admin not found');
        }

        res.send(admin);
    } catch (error: any) {
        res.status(error.status).send(error.message);
    }
});

adminRouter.get('/clients', isAdmin, async (req: Request, res: Response) => {
    const limit = Number(req.query.limit);
    const skip = Number(req.query.skip);
    
    try {
        const clients = await Client.find({}, null, { skip, limit });

        res.send(clients);
    } catch (error: any) {
        res.status(error.status).send(error.message);
    }
});

adminRouter.patch('/admins/:id', isAdmin, async (req: Request, res: Response) => {
    const adminId = req.params.id;
    try {
        const originalAdmin = await Admin.findById(adminId);

        if (!originalAdmin) {
            throw new NotFoundException('Admin not found');
        }

        const updatedAdmin = await Admin.findByIdAndUpdate(adminId, req.body, { 
            new: true, 
            runValidators: true 
        });

        if (!updatedAdmin) {
            throw new NotFoundException('Admin not found');
        }

        const user = await User.findOne({ email: originalAdmin.email });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.first_name = req.body.first_name || originalAdmin.first_name;
        user.last_name = req.body.last_name || originalAdmin.last_name;
        user.email = req.body.email || originalAdmin.email;
        user.password = req.body.password ? await bcrypt.hash(req.body.password, 10) : originalAdmin.password;

        await user.save();

        res.send({ updatedAdmin });
    } catch (error: any) {
        res.status(error.status).send(error.message);
    }
});

adminRouter.delete('/admins/:id', isAdmin, async (req: Request, res: Response) => {
    const adminId = req.params.id;
    try {
        const deletedAdmin = await Admin.findByIdAndDelete(adminId);
        if (!deletedAdmin) {
            throw new NotFoundException('Admin not found');
        }

        const deletedUser = await User.findOneAndDelete({ email: deletedAdmin.email });
        
        res.send({ message: 'Admin account deleted successfully' });
    } catch (error: any) {
        res.status(error.status).send(error.message);
    }
});