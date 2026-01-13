import { Request, Response, NextFunction } from 'express'
import en from '../locales/en.json'
import sk from '../locales/sk.json'

const translations: Record<string, Record<string, string>> = { en, sk }

declare global {
	namespace Express {
		interface Request {
			t: (key: string) => string
		}
	}
}

export const localization = (req: Request, _res: Response, next: NextFunction) => {
	const lang = (req.headers['language'] as string) || 'en'
	const locale = translations[lang] || translations.en

	req.t = (key: string) => locale[key] || key
	next()
}
