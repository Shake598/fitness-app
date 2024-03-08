import { Request, Response, NextFunction } from 'express';
import { User } from '../api/user/user';
import { BadRequestException } from '../utils/error-handler';

export const checkEmailTaken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        throw new BadRequestException('This email already exists');
      }
      next();
    } catch (error) {
      next(error);
    }
}

export const checkUserExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        throw new BadRequestException('This email is not registered');
      }
      res.locals.user = user;
      next();
    } catch (error) {
      next(error);
    }
};