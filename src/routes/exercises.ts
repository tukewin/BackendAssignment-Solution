import { Router, Request, Response } from 'express'
import { Op } from 'sequelize'
import { models } from '../db'
import { authenticate, isAdmin } from '../middlewares/auth'
import { validate } from '../middlewares/validation'
import { createExerciseSchema, updateExerciseSchema, exerciseQuerySchema } from '../validators/exercise'

const router = Router()
const { Exercise, Program } = models

export default () => {
	router.get('/', validate(exerciseQuerySchema, 'query'), async (req: Request, res: Response): Promise<any> => {
		try {
			const { page, limit, programID, search } = req.query

			const where: any = {}
			if (programID) {
				where.programID = programID
			}
			if (search) {
				where.name = { [Op.iLike]: `%${search}%` }
			}

			const options: any = {
				where,
				include: [{ model: Program }]
			}

			if (page && limit) {
				const offset = (Number(page) - 1) * Number(limit)
				options.limit = Number(limit)
				options.offset = offset
			}

			const exercises = await Exercise.findAndCountAll(options)

			return res.json({
				data: exercises.rows,
				total: exercises.count,
				page: page ? Number(page) : 1,
				limit: limit ? Number(limit) : exercises.count,
				message: 'List of exercises'
			})
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: 'Something went wrong' })
		}
	})

	router.post('/', authenticate, isAdmin, validate(createExerciseSchema), async (req: Request, res: Response): Promise<any> => {
		try {
			const { name, difficulty, programID } = req.body
			const exercise = await Exercise.create({ name, difficulty, programID })
			return res.status(201).json({ data: exercise, message: 'Exercise created' })
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: 'Something went wrong' })
		}
	})

	router.put('/:id', authenticate, isAdmin, validate(updateExerciseSchema), async (req: Request, res: Response): Promise<any> => {
		try {
			const { id } = req.params
			const { name, difficulty, programID } = req.body
			const exercise = await Exercise.findByPk(id)
			if (!exercise) {
				return res.status(404).json({ data: null, message: 'Exercise not found' })
			}
			await exercise.update({ name, difficulty, programID })
			return res.json({ data: exercise, message: 'Exercise updated' })
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: 'Something went wrong' })
		}
	})

	router.delete('/:id', authenticate, isAdmin, async (req: Request, res: Response): Promise<any> => {
		try {
			const { id } = req.params
			const exercise = await Exercise.findByPk(id)
			if (!exercise) {
				return res.status(404).json({ data: null, message: 'Exercise not found' })
			}
			await exercise.destroy()
			return res.json({ data: null, message: 'Exercise deleted' })
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: 'Something went wrong' })
		}
	})

	return router
}
