import Joi from 'joi'

export const registerSchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
	role: Joi.string().valid('ADMIN', 'USER'),
	name: Joi.string(),
	surname: Joi.string(),
	nickName: Joi.string(),
	age: Joi.number().integer().min(0)
})

export const loginSchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().required()
})
