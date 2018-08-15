require([
    "jquery",
    "Edipost_Shipment/js/localprint/localprint"
], function ($) {
    "use strict";
    var lp = new LocalPrint();

    function debug(msg, type) {
        var html_str = '<div class="messages"><div class="message message-' + type + ' type' + '"><div data-ui-id="messages-message-' + type + '">' + msg + '</div></div></div>';
        $('.edipost-wrapper #error-block').html(html_str);
        $('.edipost-wrapper #error-block').show();
    }

    /**
     * Call this function to start RAW print
     */
    function startPrintRaw(zplData, printerName) {

        lp.printRaw(zplData, printerName, function (data) {
            debug( 'OK', 'success');
        }, function (data) {
            debug('Error when printing RAW: ' + data.ErrorText, 'error');
        });
    }

    /**
     * Call this function to start PDF print from url
     */
    function startPrintPdf(url, printerName) {
        lp.printPdf( url, printerName, function(data) {
            debug( 'OK', 'success');
        }, function(data) {
            debug('Error when printing PDF: ' + data.ErrorText, 'error');
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
        $('#edipost-open').attr("disabled", true);
        $('body').loader('show');
        $.ajax({
            type: "POST",
            url: EDIPOST_OPEN_EDIPOST_AJAX_URL,
            data: {
                order_id: EDIPOST_ORDER_ID,
                form_key: window.FORM_KEY
            },
            success: function (data) {
                $('#edipost-open').attr("disabled", false);
                $('body').loader('hide');
                if (!(data.error)) {
                    window.open(data.url, '_blank');
                    debug( 'OK', 'success');
                } else {
                    console.log(JSON.stringify(data));
                    debug( JSON.stringify(data), 'error');
                }
            },
            error: function (data) {
                $('#edipost-open').attr("disabled", false);
                $('body').loader('hide');
                debug( JSON.stringify(data), 'error');
            }
        });
    });

    $('#edipost-create').on('click', function (e) {
        e.preventDefault();
        var e_alert = 0;

        if ($('#edipost_e_alert').is(':checked')) {
            e_alert = 1;
        }
        $('#edipost-create').attr("disabled", true);
        $('body').loader('show');
        $.ajax({
            type: "POST",
            url: EDIPOST_CREATE_SHIPMENT_AJAX_URL,

            data: {
                order_id: EDIPOST_ORDER_ID,
                product_id: $('#edipost_ship_method').val(),
                reference: $('#edipost_reference').val(),
                e_alert: e_alert,
                form_key: window.FORM_KEY
            },
            success: function (data) {
                $('#edipost-create').attr("disabled", false);
                $('body').loader('hide');
                if(!(data.error)){
                    var link = document.createElement('a'),
                        pdf = data.pdf,
                        pdf_raw = data.pdf_raw;
                    link.href = pdf;
                    link.download = "etiket.pdf";

                    if(data.product_id == 727){
                        lp.getVersion(function (data) {
                            startPrintRaw(pdf_raw, EDIPOST_PRINTER);

                        }, function (data) {
                            link.click();
                            debug( 'OK', 'success');
                        });
                    } else {
                        lp.getVersion(function (data) {
                            startPrintPdf(pdf, EDIPOST_PRINTER);

                        }, function (data) {
                            link.click();
                            debug( 'OK', 'success');
                        });
                    }
                } else {
                    console.log(JSON.stringify(data));
                }
            },
            error: function (data) {
                $('#edipost-create').attr("disabled", false);
                $('body').loader('hide');
                console.log(JSON.stringify(data));
            },
        });
    });

});