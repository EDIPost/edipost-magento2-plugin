require([
    "jquery",
], function($){
    "use strict";

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
                console.log(JSON.stringify(data));
                if (!(data.error)) {
                        var blob=new Blob([data.pdf]);
                        var link=document.createElement('a');
                        link.href=window.URL.createObjectURL(blob);
                        link.download="etikett.pdf";
                        link.click();
                } else {
                    // alert(data.error);
                    console.log(JSON.stringify(data));
                }
            },
            error: function (data) {
                console.log(JSON.stringify(data));
            },
        });
    });

});