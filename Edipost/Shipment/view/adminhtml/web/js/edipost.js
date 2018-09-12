require([
    "jquery",
    "Edipost_Shipment/js/localprint/localprint"
], function ($) {
    "use strict";

    var lp = new LocalPrint();


    function message(msg, type) {
        var html_str = '<div class="messages"><div class="message message-' + type + ' type' + '"><div data-ui-id="messages-message-' + type + '">' + msg + '</div></div></div>';
        $('.edipost-wrapper #error-block').html(html_str);
        $('.edipost-wrapper #error-block').show();
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


    /**
     * Open address in www.edipost.no
     */
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
                    message( 'OK', 'success');
                } else {
                    console.log(JSON.stringify(data));
                    message( JSON.stringify(data), 'error');
                }
            },
            error: function (data) {
                $('#edipost-open').attr("disabled", false);
                $('body').loader('hide');
                message( JSON.stringify(data), 'error');
            }
        });
    });


    /**
     * Create consignment using the API
     */
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

                if( ! data.error ){
                    var pdf = data.pdf;
                    var raw = data.pdf_raw;

                    if(data.product_id == '727') {   // PiP
                        lp.printRaw(raw, EDIPOST_PRINTER_RFID, function (data) {
                            message( 'OK', 'success');
                        }, function (data) {
                            message('Error when printing RFID label: ' + data.statusText, 'error');
                        });

                    } else {    // All other products
                        lp.printPdf( pdf, EDIPOST_PRINTER, function(data) {
                            message( 'OK', 'success');
                        }, function(data) {
                            message( 'Error when printing PDF. Make sure the print engine is started.<br>' +
                                'Download and print the <a href="' + pdf + '" target="_blank">label</a> manually.' );
                        });
                    }

                } else {
                    message( 'Error when creating consignment: ' + data.responseJSON.error, 'error' );
                }
            },
            error: function (data) {
                $('#edipost-create').attr("disabled", false);
                $('body').loader('hide');

                message( 'Error when creating consignment: ' + data.responseJSON.error, 'error' );
            }
        });
    });

    
});