import { Router, Request, Response } from 'express'
import { models } from '../../db'
import { authenticate, isAdmin } from '../../middlewares/auth'

const router = Router()
const { User } = models

export default () => {
	router.use(authenticate, isAdmin)

	router.get('/', async (_req: Request, res: Response): Promise<any> => {
		try {
			const users = await User.findAll({
				attributes: { exclude: ['password'] }
			})
			return res.json({ data: users, message: 'List of users' })
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: 'Something went wrong' })
		}
	})

	router.get('/:id', async (req: Request, res: Response): Promise<any> => {
		try {
			const { id } = req.params
			const user = await User.findByPk(id, {
				attributes: { exclude: ['password'] }
			})
			if (!user) {
				return res.status(404).json({ data: null, message: 'User not found' })
			}
			return res.json({ data: user, message: 'User detail' })
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: 'Something went wrong' })
		}
	})

	router.put('/:id', async (req: Request, res: Response): Promise<any> => {
		try {
			const { id } = req.params
			const { name, surname, nickName, age, role } = req.body
			const user = await User.findByPk(id)
			if (!user) {
				return res.status(404).json({ data: null, message: 'User not found' })
			}
			await user.update({ name, surname, nickName, age, role })
			return res.json({ data: user, message: 'User updated' })
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: 'Something went wrong' })
		}
	})

	return router
}
