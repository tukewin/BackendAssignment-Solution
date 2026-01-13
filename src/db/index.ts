import fs from 'fs'
import { Sequelize } from 'sequelize'

import defineExercise from './exercise'
import defineProgram from './program'

const sequelize: Sequelize = new Sequelize('postgresql://postgres:postgres@localhost:5432/fitness_app', {
	logging: false
})

sequelize.authenticate().catch((e: any) => console.error(`Unable to connect to the database${e}.`))

const Exercise = defineExercise(sequelize, 'exercise')
const Program = defineProgram(sequelize, 'program')

const models = {
	Exercise,
	Program
}
type Models = typeof models
const modelsFiles = fs.readdirSync(__dirname)

if (Object.keys(models).length !== (modelsFiles.length - 1)) {
	throw new Error('Missing model import')
}

Object.values(models).forEach((value: any) => {
	if (value.associate) {
		value.associate(models)
	}
})

export { models, sequelize }
export type { Models }
