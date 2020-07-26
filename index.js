const Gnuboard = require('./src')
const server = new Gnuboard()

server.setupManagers().then(() => {
  server.start()
})
