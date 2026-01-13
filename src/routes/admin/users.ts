import { Router, Request, Response } from 'express'
import { models } from '../../db'
import { authenticate, isAdmin } from '../../middlewares/auth'

const router = Router()
const { User } = models

export default () => {
	router.use(authenticate, isAdmin)

	router.get('/', async (req: Request, res: Response): Promise<any> => {
		try {
			const users = await User.findAll({
				attributes: { exclude: ['password'] }
			})
			return res.json({ data: users, message: req.t('list_users') })
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: req.t('something_went_wrong') })
		}
	})

	router.get('/:id', async (req: Request, res: Response): Promise<any> => {
		try {
			const { id } = req.params
			const user = await User.findByPk(id, {
				attributes: { exclude: ['password'] }
			})
			if (!user) {
				return res.status(404).json({ data: null, message: req.t('user_not_found') })
			}
			return res.json({ data: user, message: req.t('user_detail') })
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: req.t('something_went_wrong') })
		}
	})

	router.put('/:id', async (req: Request, res: Response): Promise<any> => {
		try {
			const { id } = req.params
			const { name, surname, nickName, age, role } = req.body
			const user = await User.findByPk(id)
			if (!user) {
				return res.status(404).json({ data: null, message: req.t('user_not_found') })
			}
			await user.update({ name, surname, nickName, age, role })
			return res.json({ data: user, message: req.t('user_updated') })
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: req.t('something_went_wrong') })
		}
	})

	return router
}
