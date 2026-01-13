import { Router, Request, Response } from 'express'
import { models } from '../db'
import { authenticate } from '../middlewares/auth'

const router = Router()
const { User, CompletedExercise, Exercise } = models

export default () => {
	router.use(authenticate)

	router.get('/', async (req: Request, res: Response): Promise<any> => {
		try {
			const users = await User.findAll({
				attributes: ['id', 'nickName']
			})
			return res.json({ data: users, message: req.t('list_users') })
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: req.t('something_went_wrong') })
		}
	})

	router.get('/profile', async (req: Request, res: Response): Promise<any> => {
		try {
			const user = req.user as any
			const profile = await User.findByPk(user.id, {
				attributes: ['id', 'name', 'surname', 'age', 'nickName']
			})

			const completedExercises = await CompletedExercise.findAll({
				where: { userID: user.id },
				include: [{ model: Exercise }]
			})

			return res.json({
				data: { ...profile?.toJSON(), completedExercises },
				message: req.t('user_profile')
			})
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: req.t('something_went_wrong') })
		}
	})

	router.post('/exercises', async (req: Request, res: Response): Promise<any> => {
		try {
			const user = req.user as any
			const { exerciseID, duration } = req.body

			const exercise = await Exercise.findByPk(exerciseID)
			if (!exercise) {
				return res.status(404).json({ data: null, message: req.t('exercise_not_found') })
			}

			const completed = await CompletedExercise.create({
				userID: user.id,
				exerciseID,
				duration,
				completedAt: new Date()
			})

			return res.status(201).json({ data: completed, message: req.t('exercise_tracked') })
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: req.t('something_went_wrong') })
		}
	})

	router.get('/exercises', async (req: Request, res: Response): Promise<any> => {
		try {
			const user = req.user as any
			const exercises = await CompletedExercise.findAll({
				where: { userID: user.id },
				include: [{ model: Exercise }]
			})
			return res.json({ data: exercises, message: req.t('completed_exercises') })
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: req.t('something_went_wrong') })
		}
	})

	router.delete('/exercises/:id', async (req: Request, res: Response): Promise<any> => {
		try {
			const user = req.user as any
			const { id } = req.params

			const completed = await CompletedExercise.findOne({
				where: { id, userID: user.id }
			})
			if (!completed) {
				return res.status(404).json({ data: null, message: req.t('record_not_found') })
			}

			await completed.destroy()
			return res.json({ data: null, message: req.t('record_deleted') })
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: req.t('something_went_wrong') })
		}
	})

	return router
}
