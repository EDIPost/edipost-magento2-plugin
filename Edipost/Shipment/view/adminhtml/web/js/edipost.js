require([
    "jquery",
    "Edipost_Shipment/js/localprint/localprint"
], function ($) {
    "use strict";
    var lp = new LocalPrint();

    function debug(msg) {
        $('.edipost-wrapper #error-block').show();
        $('.edipost-wrapper #error-block #debug').append(msg + "<br />");
        $('.edipost-wrapper #error-block #debug').scrollTop($('#debug')[0].scrollHeight);
    }

    /**
     * Call this function to start RAW print
     */
    function startPrintRaw(zplData, printerName) {

        lp.printRaw(zplData, printerName, function (data) {
            debug('Status: ' + data.Status + ', ErrorCode: ' + data.ErrorCode + ', ErrorText: ' + data.ErrorText);
        }, function (data) {
            debug('Error when printing RAW');
        });
    }

    /**
     * Call this function to start PDF print from url
     */
    function startPrintPdf(url, printerName) {
        lp.printPdf( url, printerName, function(data) {
            debug('Status: ' + data.Status + ', ErrorCode: ' + data.ErrorCode + ', ErrorText: ' + data.ErrorText);
        }, function(data) {
            debug('Error when printing PDF');
        });
    }



    function base64ToArrayBuffer(base64) {
        var raw = window.atob(base64);
        var rawLength = raw.length;
        var array = new Uint8Array(new ArrayBuffer(rawLength));

        for (var i = 0; i < rawLength; i++) {
            array[i] = raw.charCodeAt(i);
        }
        return ( array.buffer );
    }

    $('#edipost-open').on('click', function (e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: EDIPOST_OPEN_EDIPOST_AJAX_URL,
            data: {
                order_id: EDIPOST_ORDER_ID,
                form_key: window.FORM_KEY
            }
            ,
            success: function (data) {
                if (!(data.error)) {
                    window.open(data.url, '_blank');
                } else {
                    console.log(JSON.stringify(data));
                }
            },
            error: function (data) {
                console.log(JSON.stringify(data));
            }
        });
    });

    $('#edipost-create').on('click', function (e) {
        e.preventDefault();
        var e_alert = 0;

        if ($('#edipost_e_alert').is(':checked')) {
            e_alert = 1;
        }

        $.ajax({
            type: "POST",
            url: EDIPOST_CREATE_SHIPMENT_AJAX_URL,

            data: {
                order_id: EDIPOST_ORDER_ID,
                product_id: $('#edipost_ship_method').val(),
                reference: $('#edipost_reference').val(),
                e_alert: e_alert,
                form_key: window.FORM_KEY
            }
            ,
            success: function (data) {
                if(!(data.error)){
                    var link = document.createElement('a');
                    link.href = data.pdf;
                    link.download = "etiket.pdf";

                    if(data.product_id == 727){
                        lp.getVersion(function (data) {
                            startPrintRaw(data.pdf_raw, EDIPOST_PRINTER);

                        }, function (data) {
                            link.click();
                        });
                    } else {
                        lp.getVersion(function (data) {
                            startPrintPdf(data.pdf, EDIPOST_PRINTER);

                        }, function (data) {
                            link.click();
                        });
                    }
                } else {
                    console.log(JSON.stringify(data));
                }

            },
            error: function (data) {
                console.log(JSON.stringify(data));
            },
        });
    });

});