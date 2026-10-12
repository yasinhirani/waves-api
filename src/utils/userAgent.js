import { randomInt } from 'node:crypto';
import { userAgents } from '../config/userAgents.js';

/** Returns a random user agent. Called on every upstream request. */
export const getRandomUserAgent = () => userAgents[randomInt(userAgents.length)];
