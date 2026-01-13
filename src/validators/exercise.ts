import Joi from 'joi'

export const createExerciseSchema = Joi.object({
	name: Joi.string().required(),
	difficulty: Joi.string().valid('EASY', 'MEDIUM', 'HARD').required(),
	programID: Joi.number().integer().required()
})

export const updateExerciseSchema = Joi.object({
	name: Joi.string(),
	difficulty: Joi.string().valid('EASY', 'MEDIUM', 'HARD'),
	programID: Joi.number().integer()
})

export const exerciseQuerySchema = Joi.object({
	page: Joi.number().integer().min(1),
	limit: Joi.number().integer().min(1).max(100),
	programID: Joi.number().integer(),
	search: Joi.string()
})
