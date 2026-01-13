import { Router, Request, Response } from 'express'
import { models } from '../db'
import { authenticate, isAdmin } from '../middlewares/auth'

const router = Router()
const { Program, Exercise } = models

export default () => {
	router.get('/', async (req: Request, res: Response): Promise<any> => {
		const programs = await Program.findAll()
		return res.json({ data: programs, message: req.t('list_programs') })
	})

	router.post('/:id/exercises', authenticate, isAdmin, async (req: Request, res: Response): Promise<any> => {
		const { id } = req.params
		const { exerciseId } = req.body
		const exercise = await Exercise.findByPk(exerciseId)
		if (!exercise) {
			return res.status(404).json({ data: null, message: req.t('exercise_not_found') })
		}
		await exercise.update({ programID: id })
		return res.json({ data: exercise, message: req.t('exercise_added') })
	})

	router.delete('/:id/exercises/:exerciseId', authenticate, isAdmin, async (req: Request, res: Response): Promise<any> => {
		const { exerciseId } = req.params
		const exercise = await Exercise.findByPk(exerciseId)
		if (!exercise) {
			return res.status(404).json({ data: null, message: req.t('exercise_not_found') })
		}
		await exercise.destroy()
		return res.json({ data: null, message: req.t('exercise_removed') })
	})

	return router
}
