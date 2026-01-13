import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { models } from '../db'
import config from '../config'
import { validate } from '../middlewares/validation'
import { registerSchema, loginSchema } from '../validators/auth'

const router = Router()
const { User } = models

export default () => {
	router.post('/register', validate(registerSchema), async (req: Request, res: Response): Promise<any> => {
		try {
			const { email, password, role, name, surname, nickName, age } = req.body

			const existing = await User.findOne({ where: { email } })
			if (existing) {
				return res.status(400).json({ data: null, message: req.t('email_exists') })
			}

			const hashedPassword = await bcrypt.hash(password, 10)
			const user = await User.create({
				email,
				password: hashedPassword,
				role: role || 'USER',
				name,
				surname,
				nickName,
				age
			})

			const token = jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn })

			return res.status(201).json({
				data: { id: user.id, token },
				message: req.t('registration_successful')
			})
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: req.t('something_went_wrong') })
		}
	})

	router.post('/login', validate(loginSchema), async (req: Request, res: Response): Promise<any> => {
		try {
			const { email, password } = req.body
			const user = await User.findOne({ where: { email } }) as any
			if (!user) {
				return res.status(401).json({ data: null, message: req.t('invalid_credentials') })
			}

			const valid = await bcrypt.compare(password, user.password)
			if (!valid) {
				return res.status(401).json({ data: null, message: req.t('invalid_credentials') })
			}

			const token = jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn })

			return res.json({
				data: { id: user.id, token },
				message: req.t('login_successful')
			})
		} catch (err) {
			console.error(err)
			return res.status(500).json({ data: null, message: req.t('something_went_wrong') })
		}
	})

	return router
}
