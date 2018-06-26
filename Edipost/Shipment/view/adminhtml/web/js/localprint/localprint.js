"use strict";

function LocalPrint() {

    /**
     * Get Internet Explorer version, -1 if other browser
     */
    function getInternetExplorerVersion() {
        var rv = -1;

        if (navigator.appName == 'Microsoft Internet Explorer') {
            var ua = navigator.userAgent;
            var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) != null)
                rv = parseFloat(RegExp.$1);
        }

        return rv;
    }


    /**
     * True if browser is older than IE10, false otherwise
     */
    function oldIE() {
        var ie = getInternetExplorerVersion();
        return ie != -1 && ie < 10;
    }


    /**
     * Cross-browser, cross-origin AJAX GET request
     */
    function ajaxGet(url, successCallback, errorCallback) {
        if (oldIE()) {
            ieAjaxGet(url, successCallback, errorCallback);

        } else {
            jQuery.getJSON(url, function (data) {
                successCallback(data);
            }).fail(function (data) {
                errorCallback(data);
            });
        }
    }


    /**
     * Cross-browser, cross-origin AJAX POST request
     */
    function ajaxPost(url, data, successCallback, errorCallback) {
        if (oldIE()) {
            ieAjaxPost(url, data, successCallback, errorCallback);

        } else {
            jQuery.post(url, data, function (data) {
                successCallback(data);
            }).fail(function (data) {
                errorCallback(data);
            });
        }
    }


    /**
     * Cross-Origin AJAX request in IE7 to IE9
     */
    function ieAjaxGet(url, successCallback, errorCallback) {
        var JSON = {};

        var xdr = new XDomainRequest();
        xdr.open('get', url);
        xdr.timeout = 50000;
        xdr.onload = function () {
            var dom = new ActiveXObject('Microsoft.XMLDOM'),
                JSON = $.parseJSON(xdr.responseText);

            dom.async = false;

            if (JSON == null || typeof (JSON) == 'undefined') {
                JSON = $.parseJSON(data.firstChild.textContent);
            }

            successCallback(JSON);
        };

        xdr.onprogress = function () {
        };

        xdr.onerror = function () {
            errorCallback(JSON);
        };

        xdr.ontimeout = function () {
            errorCallback(JSON);
        };

        setTimeout(function () {
            xdr.send();
        }, 0);
    }


    /**
     * Cross-Origin AJAX POST request in IE7 to IE9
     */
    function ieAjaxPost(url, data, successCallback, errorCallback) {
        var JSON = {};

        var xdr = new XDomainRequest();
        xdr.open('post', url);
        xdr.timeout = 50000;
        xdr.onload = function () {
            var dom = new ActiveXObject('Microsoft.XMLDOM'),
                JSON = $.parseJSON(xdr.responseText);

            dom.async = false;

            if (JSON == null || typeof (JSON) == 'undefined') {
                JSON = $.parseJSON(data.firstChild.textContent);
            }

            successCallback(JSON);
        };

        xdr.onprogress = function () {
        };

        xdr.onerror = function () {
            errorCallback(JSON);
        };

        xdr.ontimeout = function () {
            errorCallback(JSON);
        };

        setTimeout(function () {
            xdr.send(data);
        }, 0);
    }


    this.getPrinters = function (successCallback, errorCallback) {
        var url = 'https://localhost.pbshipment.com:58935/Printers';
        ajaxGet(url, successCallback, errorCallback);
    };


    this.getVersion = function (successCallback, errorCallback) {
        var url = 'https://localhost.pbshipment.com:58935/Version';
        ajaxGet(url, successCallback, errorCallback);
    };


    this.printPdf = function (pdfUrl, printerName, successCallback, errorCallback) {
        var url = 'https://localhost.pbshipment.com:58935/Print?pdf=' + pdfUrl + '&printer=' + printerName;
        ajaxGet(url, successCallback, errorCallback);
    }


    this.printRaw = function (data, printerName, successCallback, errorCallback) {
        var url = 'https://localhost.pbshipment.com:58935/PrintRaw?printer=' + printerName;
        ajaxPost(url, data, successCallback, errorCallback);
    }

}

