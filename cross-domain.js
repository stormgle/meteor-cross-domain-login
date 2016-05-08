"use strict"

import Util from "meteor/stormgle:util";
import ServiceHandler from "./imports/class/service-handler.js";

export const xdomain = {

  _serviceHandlers : {},

  _loginCredential : {},

  _pingDelay : 10,

  _reTry : 300,

  _receiveMessage : function (evt) {
    let origin = evt.origin || evt.originalEvent.origin;
    console.log (`received ${evt.data}`);
    // pong : connection with child window is established. If user has logged in
    // this app, send the login token to child window
    if (evt.data === 'pong') {
      if (this._serviceHandlers[origin]) {
        clearInterval(this._serviceHandlers[origin]._timer);
        if (this._loginCredential) {
          console.log (this._loginCredential);
          evt.source.postMessage(this._loginCredential, origin);
        }
        // invoke callback
        if (this._serviceHandlers[origin]._done) {
          this._serviceHandlers[origin]._done.apply(
            undefined,
            this._serviceHandlers[origin]._windowHandler
          );
        }
      }
    }
    // ping : parent window try to establish connection, responds with pong
    // message to indicate connection established and then save this connection
    if (evt.data === 'ping') {
      evt.source.postMessage('pong', origin);
      if (typeof this._serviceHandlers[origin] === 'undefined') {
        this._serviceHandlers[origin] = new ServiceHandler (
          origin,
          evt.source,
          this._pingDelay,
          this._reTry
        );
      }
    }
    // auth token : receive login token and use it to login in
    if (typeof evt.data === 'object' &&
        evt.data['userId'] && evt.data['token'])
    {
      console.log (`received token : ${evt.data.token}`);
      Accounts.loginWithToken(evt.data.token);
    }
  }, // end receiveMessage

  open : function (/* url, name, features, callback */) {
    
    let args = Array.prototype.slice.call(arguments);
               
    let url = '', name = '', features = '', callback = null;        
    // validate and retrieve              
    args.forEach( arg => {
      if (Util.isURL(arg)) { url = arg; return; }
      if (Util.isExpr(arg)) { features = arg; return; }      
      if (Util.isFunction(arg)) { callback = arg; return; }     
      // finally, get name if it is a string but not match URL and expression
      if (Util.isString(arg)) { name = arg; return;}
    });
    const handler = window.open(url, name, features);
    this._serviceHandlers[url] = new ServiceHandler(
      url,
      handler,
      this._pingDelay,
      this._reTry,
      callback
    );
    this._serviceHandlers[url].ping();
  }, // end open

  config : function ({
    pingDelay = 10,
    reTry = 300
  }) {
    this._pingDelay = pingDelay;
    this._reTry = reTry;
  } // end config

};



window.addEventListener("message", (evt) => {
  xdomain._receiveMessage(evt);
}, false);


Tracker.autorun(function(c) {
  if (Meteor.userId()) {
    // get login credential
    xdomain._loginCredential = {
      userId : Meteor.userId(),
      token : Accounts._storedLoginToken()
    };
    // then request all child windows to login
    Object.keys(xdomain._serviceHandlers).forEach(function(url) {
      const windowHandler = xdomain._serviceHandlers[url]._windowHandler;
      windowHandler.postMessage(xdomain._loginCredential, url);
    });

  } else {
    xdomain._loginCredential = {};
  }
});
