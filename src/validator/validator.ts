import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from './validator-schema';

export const validateRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.body
      await registerSchema.validate(payload)
      next()
    } catch (error) {
        next({ status: 400, message: "The submitted data is incorrect. Please try again."})
    }
}

export const validateLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.body
      await loginSchema.validate(payload)
      next()
    } catch (error) {
        next({ status: 400, message: "The submitted data is incorrect. Please try again."})
    }
}