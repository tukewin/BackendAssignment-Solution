import { Router, Request, Response } from 'express'
import { models } from '../db'
import { authenticate, isAdmin } from '../middlewares/auth'

const router = Router()
const { Program, Exercise } = models

export default () => {
	router.get('/', async (_req: Request, res: Response): Promise<any> => {
		const programs = await Program.findAll()
		return res.json({ data: programs, message: 'List of programs' })
	})

	router.post('/:id/exercises', authenticate, isAdmin, async (req: Request, res: Response): Promise<any> => {
		try {
			const { id } = req.params
			const { exerciseId } = req.body
			const exercise = await Exercise.findByPk(exerciseId)
			if (!exercise) {
				return res.status(404).json({ data: null, message: 'Exercise not found' })
			}
			await exercise.update({ programID: id })
			return res.json({ data: exercise, message: 'Exercise added to program' })
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: 'Something went wrong' })
		}
	})

	router.delete('/:id/exercises/:exerciseId', authenticate, isAdmin, async (req: Request, res: Response): Promise<any> => {
		try {
			const { exerciseId } = req.params
			const exercise = await Exercise.findByPk(exerciseId)
			if (!exercise) {
				return res.status(404).json({ data: null, message: 'Exercise not found' })
			}
			await exercise.destroy()
			return res.json({ data: null, message: 'Exercise removed from program' })
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: 'Something went wrong' })
		}
	})

	return router
}
