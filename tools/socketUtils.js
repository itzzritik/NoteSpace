require('dotenv').config();
const logger = require('./logger'),
    chalk = require('chalk'),
    crypto = require('./crypto'),
    mongoUtils = require('./mongoUtils'),
    initialize = (io) => {
        logger.log(true, 'Initialized SocketIO');
        io.on('connection', (socket) => {
            let roomName;
            socket.on('join', (token, callback) => {
                roomName = token;//crypto.decrypt(room, process.env.CRYPTO_KEY);
                logger.log(true, 'New instance connected to room:', chalk.green(roomName));
                logger.log(false, 'Instance id:', chalk.green(socket.id));
                socket.join(roomName);

                mongoUtils.get(roomName, (err, notes) => {
                    if (err) logger.error(false, 'Error occurred:', err);
                    else {
                        socket.emit('showNotebook', notes);
                        logger.log(false, 'First data sent successfully');
                    }
                });
            });

            socket.on('saveUpdateData', (token, updateStack, cb) => {
                mongoUtils.update(token, updateStack, (err, notes) => {
                    socket.broadcast.to(token).emit('updateNotebook', notes);
                });
                cb();
            });
        
            socket.on('disconnect', () => {
                logger.log(true, 'Instance Disconnected from room:', chalk.green(roomName));
                logger.log(false, 'Instance id:', chalk.red(socket.id));
            });
        });
    };

module.exports = { initialize }