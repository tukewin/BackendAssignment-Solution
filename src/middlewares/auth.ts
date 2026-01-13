import { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import { models } from '../db'
import config from '../config'
import { USER_ROLE } from '../utils/enums'

const { User } = models

passport.use(new JwtStrategy({
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: config.jwtSecret
}, async (payload, done) => {
	try {
		const user = await User.findByPk(payload.id)
		if (!user) {
			return done(null, false)
		}
		return done(null, user)
	} catch (err) {
		return done(err, false)
	}
}))

export const authenticate = passport.authenticate('jwt', { session: false })

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
	const user = req.user as any
	if (user?.role !== USER_ROLE.ADMIN) {
		return res.status(403).json({ data: null, message: req.t('access_denied') })
	}
	next()
}

export const isUser = (req: Request, res: Response, next: NextFunction) => {
	const user = req.user as any
	if (!user) {
		return res.status(403).json({ data: null, message: req.t('access_denied') })
	}
	next()
}

export default passport
