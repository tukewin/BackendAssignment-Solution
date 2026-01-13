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
		try {
			const { id } = req.params
			const { exerciseId } = req.body
			const exercise = await Exercise.findByPk(exerciseId)
			if (!exercise) {
				return res.status(404).json({ data: null, message: req.t('exercise_not_found') })
			}
			await exercise.update({ programID: id })
			return res.json({ data: exercise, message: req.t('exercise_added') })
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: req.t('something_went_wrong') })
		}
	})

	router.delete('/:id/exercises/:exerciseId', authenticate, isAdmin, async (req: Request, res: Response): Promise<any> => {
		try {
			const { exerciseId } = req.params
			const exercise = await Exercise.findByPk(exerciseId)
			if (!exercise) {
				return res.status(404).json({ data: null, message: req.t('exercise_not_found') })
			}
			await exercise.destroy()
			return res.json({ data: null, message: req.t('exercise_removed') })
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: req.t('something_went_wrong') })
		}
	})

	return router
}
