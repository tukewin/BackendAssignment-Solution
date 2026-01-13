import http from 'http'
import express from 'express'

import { sequelize } from './db'
import passport from './middlewares/auth'
import ProgramRouter from './routes/programs'
import ExerciseRouter from './routes/exercises'
import AuthRouter from './routes/auth'
import AdminUsersRouter from './routes/admin/users'
import UsersRouter from './routes/users'

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(passport.initialize())

app.use('/auth', AuthRouter())
app.use('/programs', ProgramRouter())
app.use('/exercises', ExerciseRouter())
app.use('/admin/users', AdminUsersRouter())
app.use('/users', UsersRouter())

const httpServer = http.createServer(app)

try {
    sequelize.sync()
} catch (error) {
    console.log('Sequelize sync error')
}

httpServer.listen(8000).on('listening', () => console.log(`Server started at port ${8000}`))

export default httpServer
