import { Router, Request, Response } from 'express'
import { models } from '../db'
import { authenticate, isAdmin } from '../middlewares/auth'

const router = Router()
const { Exercise, Program } = models

export default () => {
	router.get('/', async (_req: Request, res: Response): Promise<any> => {
		const exercises = await Exercise.findAll({
			include: [{ model: Program }]
		})
		return res.json({ data: exercises, message: 'List of exercises' })
	})

	router.post('/', authenticate, isAdmin, async (req: Request, res: Response): Promise<any> => {
		try {
			const { name, difficulty, programID } = req.body
			const exercise = await Exercise.create({ name, difficulty, programID })
			return res.status(201).json({ data: exercise, message: 'Exercise created' })
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: 'Something went wrong' })
		}
	})

	router.put('/:id', authenticate, isAdmin, async (req: Request, res: Response): Promise<any> => {
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
