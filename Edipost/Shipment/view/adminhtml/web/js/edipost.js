require([
    "jquery",
    "Edipost_Shipment/js/localprint/localprint"
], function($){
    "use strict";
    var lp = new LocalPrint();

    function debug( msg ) {
        $('.edipost-wrapper #error-block').show();
        $('.edipost-wrapper #error-block #debug').append(msg + "<br />");
        $('.edipost-wrapper #error-block #debug').scrollTop( $('#debug')[0].scrollHeight );
    }

    /**
     * Call this function to start RAW print
     */
    function startPrintRaw(zplData, printerName) {

        lp.printRaw( zplData, printerName, function(data) {
            debug('Status: ' + data.Status + ', ErrorCode: ' + data.ErrorCode + ', ErrorText: ' + data.ErrorText);
        }, function(data) {
            debug('Error when printing RAW');
        });
    }

    /**
     * Check if print engine is active
     */
    function checkPrintEngine() {
        lp.getVersion( function(data) {
            return 0;

        }, function(data) {

        });
        return 1;
    }

    function base64ToArrayBuffer( base64 ) {
        var raw = window.atob( base64 );
        var rawLength = raw.length;
        var array = new Uint8Array( new ArrayBuffer(rawLength) );

        for( var i = 0; i < rawLength; i++ ) {
            array[ i ] = raw.charCodeAt( i );
        }
        return( array.buffer );
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
                if (!(data.error)) {
                        var blob=new Blob([base64ToArrayBuffer(data.pdf)]);
                        var link=document.createElement('a');
                        link.href=window.URL.createObjectURL(blob);
                        link.download="etiket.pdf";

                        if (!checkPrintEngine()){ // is active
                            startPrintRaw(blob, EDIPOST_PRINTER);
                        } else{
                            console.log('click');
                            link.click();
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