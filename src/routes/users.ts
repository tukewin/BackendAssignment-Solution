import { Router, Request, Response } from 'express'
import { models } from '../db'
import { authenticate } from '../middlewares/auth'

const router = Router()
const { User, CompletedExercise, Exercise } = models

export default () => {
	router.use(authenticate)

	router.get('/', async (_req: Request, res: Response): Promise<any> => {
		try {
			const users = await User.findAll({
				attributes: ['id', 'nickName']
			})
			return res.json({ data: users, message: 'List of users' })
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: 'Something went wrong' })
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
				message: 'User profile'
			})
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: 'Something went wrong' })
		}
	})

	router.post('/exercises', async (req: Request, res: Response): Promise<any> => {
		try {
			const user = req.user as any
			const { exerciseID, duration } = req.body

			const exercise = await Exercise.findByPk(exerciseID)
			if (!exercise) {
				return res.status(404).json({ data: null, message: 'Exercise not found' })
			}

			const completed = await CompletedExercise.create({
				userID: user.id,
				exerciseID,
				duration,
				completedAt: new Date()
			})

			return res.status(201).json({ data: completed, message: 'Exercise tracked' })
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: 'Something went wrong' })
		}
	})

	router.get('/exercises', async (req: Request, res: Response): Promise<any> => {
		try {
			const user = req.user as any
			const exercises = await CompletedExercise.findAll({
				where: { userID: user.id },
				include: [{ model: Exercise }]
			})
			return res.json({ data: exercises, message: 'Completed exercises' })
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: 'Something went wrong' })
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
				return res.status(404).json({ data: null, message: 'Record not found' })
			}

			await completed.destroy()
			return res.json({ data: null, message: 'Record deleted' })
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: 'Something went wrong' })
		}
	})

	return router
}
