require([
    "jquery",
], function($){
    "use strict";

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
                    // alert(data.error);
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
        $.ajax({
            type: "POST",
            url: EDIPOST_CREATE_SHIPMENT_AJAX_URL,

            data: {
                order_id: EDIPOST_ORDER_ID,
                product_id: $('#edipost_ship_method').val(),
                reference: $('#edipost_reference').val(),
                form_key: window.FORM_KEY
            }
            ,
            success: function (data) {
                // data = base64ToArrayBuffer(data);
                // console.log(data);
                // console.log(Base64.decode(data.pdf));
                if (!(data.error)) {
                        var blob=new Blob([base64ToArrayBuffer(data.pdf)]);
                        var link=document.createElement('a');
                        link.href=window.URL.createObjectURL(blob);
                        link.download="etiket.pdf";
                        link.click();
                } else {
                    // alert(data.error);
                    console.log(JSON.stringify(data));
                }
                // var binaryData = [];
                // binaryData.push(data);
                // var URL = window.URL || window.webkitURL;
                // var file = URL.createObjectURL(new Blob(binaryData, {type: "application/pdf"}));
                // var a = document.createElement("a");
                // a.href = file;
                // a.download = "etiket.pdf";
                // document.body.appendChild(a);
                // a.click();
            },
            error: function (data) {
                console.log(JSON.stringify(data));
            },
        });
    });

});