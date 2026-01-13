import { Sequelize, DataTypes, Model } from 'sequelize'

export interface CompletedExerciseModel extends Model {
	id: number
	userID: number
	exerciseID: number
	completedAt: Date
	duration: number
}

export default (sequelize: Sequelize, modelName: string) => {
	const CompletedExerciseModelCtor = sequelize.define<CompletedExerciseModel>(
		modelName,
		{
			id: {
				type: DataTypes.BIGINT,
				primaryKey: true,
				allowNull: false,
				autoIncrement: true
			},
			userID: {
				type: DataTypes.BIGINT,
				allowNull: false
			},
			exerciseID: {
				type: DataTypes.BIGINT,
				allowNull: false
			},
			completedAt: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW
			},
			duration: {
				type: DataTypes.INTEGER,
				allowNull: false
			}
		},
		{
			paranoid: true,
			timestamps: true,
			tableName: 'completed_exercises'
		}
	)

	CompletedExerciseModelCtor.associate = (models: any) => {
		CompletedExerciseModelCtor.belongsTo(models.User, { foreignKey: 'userID' })
		CompletedExerciseModelCtor.belongsTo(models.Exercise, { foreignKey: 'exerciseID' })
	}

	return CompletedExerciseModelCtor
}
