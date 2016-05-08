"use strict"

export default class ServiceHandler {

  constructor (url, windowHandler, pingDelay, reTry, done) {
    // need to validate arguments
    this._url = url;
    this._windowHandler = windowHandler;
    this._reTry = reTry || 300;
    this._pingDelay = pingDelay || 10;
    this._done = done || null;
    
    this._timer = {};        
    this._tryConnect = 0; 
  }

  ping () {
    this._timer = setInterval(() => {
      if (this._windowHandler) {
        this._windowHandler.postMessage('ping',this._url);
      }
      this._tryConnect++;
      if (this._tryConnect === this._reTry) {
        clearInterval(this._timer);
        // ping forever at every 1s
        this._timer = setInterval(() => {
          if (this._windowHandler) {
            this._windowHandler.postMessage('ping',this._url);
            console.log (`ping... 1s`);
          }
        },1000);
      }
      console.log (`ping... `);
    }, this._pingDelay);
  }

}
