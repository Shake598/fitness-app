import { Request, Response, NextFunction } from 'express';
import { User } from '../api/user/user';
import { JWT_SECRET } from '../validator/token-builder';
import jwt from 'jsonwebtoken';
import { AuthorizedTokenException, NotFoundException } from '../utils/error-handler';

export const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      throw new AuthorizedTokenException('Access denied: No token provided'); 
    }

    let userId;
    try {
      const decodedToken: any = jwt.verify(token, JWT_SECRET);
      userId = decodedToken.subject;
    } catch (error: any) {
      throw new AuthorizedTokenException('Access denied: Invalid token');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundException('Access denied: User not found');
    }

    next();
  } catch (error: any) {
    res.status(error.status).send(error.message);
  }
};

export const isClientOrAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            throw new AuthorizedTokenException('Access denied: No token provided');
        }

        jwt.verify(token, JWT_SECRET, (error: any, decodedToken: any) => {
            if (error) {
                throw new AuthorizedTokenException('Access denied: Invalid token');
            }

            const role = decodedToken.role_id;

            if (role === 'client' || role === 'admin') {
                
            } else {
                throw new AuthorizedTokenException('Access denied: Unauthorized user role');
            }
          
          next();
        });
    } catch (error: any) {
      res.status(error.status).send(error.message);
    }
};

export const isTrainerOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const token = req.headers.authorization;

      if (!token) {
          throw new AuthorizedTokenException('Access denied: No token provided');
      }

      jwt.verify(token, JWT_SECRET, (error: any, decodedToken: any) => {
        if (error) {
            throw new AuthorizedTokenException('Access denied: Invalid token');
        }

        const role = decodedToken.role_id;

        if (role === 'trainer' || role === 'admin') {
            
        } else {
            throw new AuthorizedTokenException('Access denied: Unauthorized user role');
        }
      
      next();
    });
} catch (error: any) {
  res.status(error.status).send(error.message);
}
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      throw new AuthorizedTokenException('Access denied: No token provided');
    }

    jwt.verify(token, JWT_SECRET, (error: any, decodedToken: any) => {
      if (error) {
        throw new AuthorizedTokenException('Access denied: Invalid token');
      }

      const role = decodedToken.role_id;

      if (role === 'admin') {
        next();
      } else {
        throw new AuthorizedTokenException('Access denied: Unauthorized user role');
      }
    });
  } catch (error: any) {
    res.status(error.status).send(error.message);
  }
};