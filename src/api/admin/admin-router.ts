import express, { Request, Response } from 'express';
import { Admin } from './admin';
import nodemailer from 'nodemailer';

const bcrypt = require('bcryptjs');
export const adminRouter = express.Router();

const isAdminLoggedIn = (req: Request, res: Response, next: any) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).send({ error: 'Unauthorized access' });
    }
    next();
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'fitness-app@gmail.com', 
        pass: 'Fitness-app123!',
    },
  });

  adminRouter.post('/admin-register', async (req: Request, res: Response) => {
    try {
        const existingAdmin = await Admin.findOne({ email: req.body.email });
        if (existingAdmin) {
            return res.status(400).send({ error: 'Admin with this email already exists' });
        } 

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const admin = new Admin(req.body);
        await admin.save();

        const mailOptions = {
          from: 'fitness-app@gmail.com',
          to: req.body.email,
          subject: 'Registration confirmation',
          text: 'Your profile has been successfully registered.',
      };

      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.error('An error occurred while sending the email', error);
          } else {
              console.log('E-mail sent', info.response);
          }
      });

        res.status(201).send({ message: 'Admin registration successful' });
    } catch (error) {
        res.status(500).send({ error: 'An error occurred during admin registration' });
    }
});

adminRouter.post('/admin-login', async (req: Request, res: Response) => {
    try {
        const admin = await Admin.findOne({ email: req.body.email });
        if (!admin) {
            return res.status(404).send({ error: 'Admin with this email does not exist' });
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, admin.password);
        if (!isPasswordMatch) {
            return res.status(401).send({ error: 'Incorrect email or password' });
        }

        res.status(200).send({ message: 'Admin logged in successfully' });
    } catch (error) {
        console.error('Error logging in admin:', error);
        res.status(500).send({ error: 'An error occurred during admin login' });
    }
});

adminRouter.patch('/admins/:id', isAdminLoggedIn, async (req: Request, res: Response) => {
    const adminId = req.params.id;
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).send({ error: 'Unauthorized access' });
        }
        const updatedAdmin = await Admin.findByIdAndUpdate(adminId, req.body, { new: true });
        if (!updatedAdmin) {
            return res.status(404).send({ error: 'Admin not found' });
        }

        res.send(updatedAdmin);
    } catch (error) {
        console.error('Error updating admin profile:', error);
        res.status(500).send({ error: 'There was a problem updating the admin profile' });
    }
});

adminRouter.delete('/admins/:id', isAdminLoggedIn, async (req: Request, res: Response) => {
    const adminId = req.params.id;
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).send({ error: 'Unauthorized access' });
        }
        const deletedAdmin = await Admin.findByIdAndDelete(adminId);
        if (!deletedAdmin) {
            return res.status(404).send({ error: 'Admin not found' });
        }

        res.send({ message: 'Admin account deleted successfully' });
    } catch (error) {
        console.error('Error deleting admin account:', error);
        res.status(500).send({ error: 'An error occurred while deleting admin account' });
    }
});