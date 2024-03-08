import jwt from 'jsonwebtoken';

export const JWT_SECRET = 'this_is_safe';

export const buildToken = (user: any) => {
    const payload = {
        subject: user.id,
        role_id: user.role
    }
    const options = {
      expiresIn: "1h"
    }
    const signedToken = jwt.sign(payload, JWT_SECRET, options)
    return signedToken
}