import { EventEmitter } from 'events';

// It is important that this is a singleton.
export const errorEmitter = new EventEmitter();
