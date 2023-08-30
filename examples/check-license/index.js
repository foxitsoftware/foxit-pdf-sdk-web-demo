function createDeferred () {
    var deferred = {};
    deferred.promise = new Promise(function (resolve, reject) {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    return deferred;
}
var gsdkDeferred = createDeferred();

var gsdk = GSDK({
    onRuntimeInitialized: function () {
        gsdkDeferred.resolve();
    },
    onAbort: function () {
        gsdkDeferred.reject(gsdk);
    },
    locateFile: function (filename) {
        return ['../../../lib/jr-engine/gsdk/', filename].join('');
    }
});
if (gsdk instanceof Promise) {
    gsdk.then(function () {
        gsdkDeferred.resolve();
    }, function () {
        gsdkDeferred.reject(gsdk);
    });
}
gsdkDeferred.promise.then(null, function (){
    alert('The initialization engine failed. Please refresh the page and try again.');
});
var eFileSn = document.getElementById('file_sn');
var eFileKey = document.getElementById('file_key');
var eTextSn = document.getElementById('sn_text');
var eTextKey = document.getElementById('key_text');
var e7xResult = document.getElementById('verify_7_x_result');
var eDownload = document.getElementById('download');
eFileSn.onchange = function () {
    if (!eFileSn.value) {
        return;
    }
    var snFile = eFileSn.files[0];
    if (!snFile) {
        eTextSn.value = '';
    }
    var snPromise = readerPromise(snFile);
    snPromise.then(function (text) {
        var arr0 = text.split(/\s/);
        var sn = '';
        for (var i = arr0.length; i--;) {
            var r = arr0[i].split('=');
            if (r[0].toLowerCase() === 'sn') {
                sn = r.slice(1).join('=');
                break;
            }
        }
        eTextSn.value = sn;
    }, function () {
        eTextSn.value = '';
    })
}
eFileKey.onchange = function () {
    if (!eFileKey.value) {
        return;
    }
    var keyFile = eFileKey.files[0];
    if (!keyFile) {
        eTextKey.value = '';
    }
    var keyPromise = readerPromise(keyFile);
    keyPromise.then(function (text) {
        var arr0 = text.split(/\s/);
        var key = '';
        for (var i = arr0.length; i--;) {
            var r = arr0[i].split('=');
            if (r[0].toLowerCase() === 'sign') {
                key = r.slice(1).join('=');
                break;
            }
        }
        eTextKey.value = key;
    }, function () {
        eTextKey.value = '';
    })
}
document.getElementById('verify_7_x').onclick = function () {
    e7xResult.innerHTML = '';
    eDownload.classList.add('hide');
    try{
        e7xResult.classList.remove('error');
    } catch(ex){}
    if (eFileSn.files.length !== 1) {
        alert('Please enter a valid SN file.');
        return;
    }
    if (eFileKey.files.length !== 1) {
        alert('Please enter a valid KEY file.');
        return;
    }
    var snFile = eFileSn.files[0];
    var snPromise = readerPromise(snFile);
    snPromise.then(null, function () {
        alert('Please enter a valid SN file.');
    })
    var keyFile = eFileKey.files[0];
    var keyPromise = readerPromise(keyFile);
    keyPromise.then(null, function () {
        alert('Please enter a valid KEY file.');
    })

    Promise.all([snPromise, keyPromise, gsdkDeferred.promise]).then(function (arr) {
        var arr0 = arr[0].split(/\s/);
        var arr1 = arr[1].split(/\s/);
        var sn;
        var key;
        for (var i = arr0.length; i--;) {
            var r = arr0[i].split('=');
            if (r[0].toLowerCase() === 'sn') {
                sn = r.slice(1).join('=');
                break;
            }
        }
        for (var i = arr1.length; i--;) {
            var r = arr1[i].split('=');
            if (r[0].toLowerCase() === 'sign') {
                key = r.slice(1).join('=');
                break;
            }
        }
        return [sn, key];
    }).then(function (arr) {
        var sn = arr[0];
        var key = arr[1];
        try{
            gsdk.then(gsdkObj => {
                let result = gsdkObj.initialize(sn, key).toString().split(' ');
                if (result[0] === '0') {
                    alert('The current license is valid.');
                    e7xResult.innerHTML = 'The current license is valid.';
                    eDownload.href = URL.createObjectURL(new Blob([getLicenseLeyJs(sn, key)], {type: 'application/javascript'}));
                    eDownload.classList.remove('hide');
                } else {
                    e7xResult.innerHTML = 'verify ERROR';
                    e7xResult.classList.add('error');
                }
            })
        }catch(e){
            console.error(e)
        }
    }).then(null, function () {
        e7xResult.innerHTML = 'verify ERROR';
        e7xResult.classList.add('error');
    }).catch(e=>console.error(e))
}

function readerPromise (file) {
    var deferred = createDeferred();
    var fileReader = new FileReader();
    fileReader.onload = function (e) {
        deferred.resolve(this.result)
    }
    fileReader.onerror = function () {
        deferred.reject();
    }
    fileReader.readAsText(file);

    return deferred.promise;
}
function getLicenseLeyJs (sn, key) {
    var contentArr = [];
    contentArr.push('(function (root, factory) {if(typeof exports === "object" && typeof module === "object"){module.exports = factory();}else if(typeof define === "function" && define.amd){define([], factory);}else{var a = factory();for(var i in a) (typeof exports === "object" ? exports : root)[i] = a[i];}})(self, function (){return {')
    contentArr.push('licenseSN:"' + sn + '",');
    contentArr.push('licenseKey:"' + key + '"');
    contentArr.push('}});');
    return contentArr.join('');
}