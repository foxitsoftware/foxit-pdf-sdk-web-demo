import SockJS from "sockjs-client";
import * as UIExtension from 'UIExtension';

const {
    PDFViewCtrl: {
        constants
    },
  } = UIExtension;

function noop(){}
function Defer() {
    var self = this;
    this.promise = new Promise(function(resolve, reject) {
        self.resolve = resolve;
        self.reject = reject;
    });
}
function SockJSCommunicator(serverURL) {
    this.serverURL = serverURL;
    this.connectStatusDefer;
    this.messageReceiver = noop;
    this.closeEventListener = noop;
}
var members = {
    isConnected: function() {
        if(!this.sockjs) {
            return Promise.resolve(false);
        } else {
            switch(this.sockjs.readyState) {
                case SockJS.OPEN:
                    return Promise.resolve(true);
                case SockJS.CLOSED:
                case SockJS.CLOSING:
                    return Promise.resolve(false);
            }
        }
        return this.connectStatusDefer.promise;
    },
    connect: function(shareId) {
        if(this.sockjs) {
            switch(this.sockjs.readyState) {
                case SockJS.CLOSED:
                case SockJS.CLOSING:
                    break;
                default:
                    this.sockjs.onclose = null;
                    this.sockjs.close();
            }
        }
        var sockjs = this.sockjs = new SockJS(this.serverURL + '/collab/ws?shareId='+shareId, undefined, {
            timeout: 1000
        });
        var self = this;
        sockjs.onmessage = function(e) {
            if(e.data === String.fromCharCode(0xa)) {
                return;
            }
            self.messageReceiver(e.data);
        };
        
        var connectStatusDefer = this.connectStatusDefer = new Defer();
        return new Promise(function(resolve, reject) {
            var isConnected = false;
            var keepConnectTimmerId;
            sockjs.onclose = function(e) {
                if(!isConnected) {
                    connectStatusDefer.reject(false);
                    reject(e);
                }
                clearInterval(keepConnectTimmerId);
                self.closeEventListener();
            };
            sockjs.onopen = function() {
                isConnected = true;
                connectStatusDefer.resolve(true);
                resolve(true);
                keepConnectTimmerId = setInterval(function() {
                    sockjs.send(String.fromCharCode(0x9));
                }, 10 * 1000);
            };
            sockjs.onerror = function(e) {
                connectStatusDefer.resolve(false);
                reject(e);
            };
        })
    },
    disconnect: function() {
        this.sockjs.onclose = null;
        this.sockjs.close();
        return Promise.resolve(true);
    },
    createSession: function(doc, openFileParams) {
        var url = this.serverURL + '/collab/share';
        var formData = new FormData();
        if(openFileParams.type === constants.OPEN_FILE_TYPE.FROM_FILE) {
            var fileblob = openFileParams.file;
            if(!(fileblob instanceof Blob)) {
                fileblob = new Blob([fileblob], { type: 'application/pdf' })
            }
            formData.append('file', fileblob, openFileParams.options.fileName);
            openFileParams = Object.assign({}, openFileParams);
            delete openFileParams.file;
        }
        formData.append('open-file-params', JSON.stringify(openFileParams));
        return fetch(url, {
            method: 'POST',
            body: formData
        }).then(function(response) {
            return response.json();
        }).then(function(result) {
            return result.shareId;
        });
    },
    getSessionInfo: function(shareId) {
        return fetch(this.serverURL + '/collab/session/' + shareId)
            .then(function(response){
                var sessionInfoJSON = response.headers.get('session-info');
                if(sessionInfoJSON === 'null') {
                    return null;
                } else {
                    var sessionInfo = JSON.parse(decodeURIComponent(sessionInfoJSON));
                    var openFileParams = sessionInfo.openFileParams;
                    if(openFileParams.type === constants.OPEN_FILE_TYPE.FROM_FILE) {
                        return response.blob().then(function(file) {
                            openFileParams.file = file;
                            return sessionInfo;
                        });
                    } else {
                        return sessionInfo;
                    }
                }
            })
    },
    send: function(shareId, data) {
        if(this.sockjs) {
            this.sockjs.send(data);
        }
        return Promise.resolve();
    },
    getLostData: function(shareId, fromVersion) {
        var url = this.serverURL + '/collab/data/' + shareId + '/' + fromVersion;
        return fetch(url)
            .then(function(response) {
                return response.json();
            });
    },
    registerMessageReceiver: function(receiver) {
        this.messageReceiver = receiver || noop;
    },
    registerLostConnectionListener: function(callback) {
        this.closeEventListener = callback || noop;
    },
    destroy:function () {
        if(this.socket) {
            this.socket.close();
        }
    }
};
for(var key in members) {
    SockJSCommunicator.prototype[key] = members[key];
}

export default SockJSCommunicator