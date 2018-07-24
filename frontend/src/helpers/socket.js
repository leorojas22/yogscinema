import config from '../config.js';
import openSocket from 'socket.io-client';

export default openSocket(config.apiURL, { transports: ['websocket']});
