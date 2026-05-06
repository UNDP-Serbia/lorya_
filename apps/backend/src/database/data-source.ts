import { DataSource } from 'typeorm'
import { dataSourceOptions } from '../config/options'

export default new DataSource(dataSourceOptions)
