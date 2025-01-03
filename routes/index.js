const UserRouter = require('./UserRouter')
const TaskRouter = require('./TaskRouter')

const routes = (app) =>{
    app.use('/user', UserRouter)
    app.use('/task', TaskRouter)
}

module.exports = routes