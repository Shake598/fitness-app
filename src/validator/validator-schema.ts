import * as yup from 'yup';

export const registerSchema = yup.object().shape({
    first_name: yup
    .string()
    .trim()
    .required(),
    last_name: yup
    .string()
    .trim()
    .required(),
    email: yup
    .string()
    .trim()
    .email()
    .required(),
    password: yup
    .string()
    .trim()
    .required()
    .min(7),
    role: yup
    .string()
    .oneOf(['client', 'trainer', 'admin', ])
    .required()
});

export const loginSchema = yup.object().shape({
    email: yup
    .string()
    .trim()
    .email()
    .required(),
    password: yup
    .string()
    .trim()
    .required()
    .min(8),
    role: yup
    .string()
    .oneOf(['client', 'trainer', 'admin', ])
    .required()
});
