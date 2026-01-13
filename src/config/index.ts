export default {
	jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
	jwtExpiresIn: '24h'
}
