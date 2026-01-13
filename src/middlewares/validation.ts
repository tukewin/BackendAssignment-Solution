import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'

export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
	return (req: Request, res: Response, next: NextFunction) => {
		const { error } = schema.validate(req[property])
		if (error) {
			return res.status(400).json({
				data: null,
				message: error.details[0].message
			})
		}
		next()
	}
}
