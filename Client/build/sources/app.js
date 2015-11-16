//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, Promise, generator) {
    return new Promise(function (resolve, reject) {
        generator = generator.call(thisArg, _arguments);
        function cast(value) { return value instanceof Promise && value.constructor === Promise ? value : new Promise(function (resolve) { resolve(value); }); }
        function onfulfill(value) { try { step("next", value); } catch (e) { reject(e); } }
        function onreject(value) { try { step("throw", value); } catch (e) { reject(e); } }
        function step(verb, value) {
            var result = generator[verb](value);
            result.done ? resolve(result.value) : cast(result.value).then(onfulfill, onreject);
        }
        step("next", void 0);
    });
};
require('kinq').enable();
require('async-node');
var localServer_1 = require('./socks5/localServer');
var connect_1 = require('./socks5/connect');
var dispatchQueue_1 = require('./lib/dispatchQueue');
var consts = require('./socks5/consts');
class App {
    constructor(options) {
        let defaultOptions = {
            addr: 'localhost',
            port: 1080,
            serverAddr: 'localhost',
            serverPort: 23333,
            cipherAlgorithm: 'aes-256-cfb',
            password: 'lightsword',
            socks5Username: '',
            socks5Password: '',
            timeout: 60
        };
        if (options)
            Object.getOwnPropertyNames(defaultOptions).forEach(n => options[n] = options[n] || defaultOptions[n]);
        else
            options = defaultOptions;
        let isLocalProxy = this.isLocalProxy = ['localhost', '', undefined, null].contains(options.serverAddr.toLowerCase());
        let pluginPath = `./plugins/connect/${isLocalProxy ? 'local' : 'main'}`;
        this.connectPlugin = require(pluginPath);
        let msgMapper = new Map();
        msgMapper.set(consts.REQUEST_CMD.CONNECT, [this.connectPlugin, connect_1.Socks5Connect]);
        this.msgMapper = msgMapper;
        dispatchQueue_1.defaultQueue.register(consts.REQUEST_CMD.CONNECT, this);
        let server = new localServer_1.LocalServer(options || defaultOptions);
        server.start();
    }
    receive(msg, args) {
        let tuple = this.msgMapper.get(msg);
        if (!tuple)
            return;
        let executor = tuple[1];
        new executor(tuple[0], args, this.isLocalProxy);
    }
}
exports.App = App;
if (!module.parent) {
    process.title = 'LightSword Client Debug';
    new App();
}
//# sourceMappingURL=app.js.map