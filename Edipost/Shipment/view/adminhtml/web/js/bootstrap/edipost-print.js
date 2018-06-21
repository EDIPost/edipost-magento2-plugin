require([
    "jquery",
    "Edipost_Shipment/edipost/localprint/localprint"
], function($){
    var lp = new LocalPrint();

    /**
     * Print text to debug output on this web page
     */
    function debug( msg ) {
        $('#debug').append(msg + "<br />");
        $('#debug').scrollTop( $('#debug')[0].scrollHeight );
    }


    /**
     * Call this function to start PDF print
     */
    function startPrintPdf() {
        var url = $('#pdfFile').val();
        var printerName = $('#printerMenu').val();

        lp.printPdf( url, printerName, function(data) {
            debug('Status: ' + data.Status + ', ErrorCode: ' + data.ErrorCode + ', ErrorText: ' + data.ErrorText);
        }, function(data) {
            debug('Error when printing PDF');
        });
    }


    /**
     * Call this function to start RAW print
     */
    function startPrintRaw() {
        var zplData = $('#zplData').val();
        var printerName = $('#printerMenu').val();

        lp.printRaw( zplData, printerName, function(data) {
            debug('Status: ' + data.Status + ', ErrorCode: ' + data.ErrorCode + ', ErrorText: ' + data.ErrorText);
        }, function(data) {
            debug('Error when printing RAW');
        });
    }


    /**
     * Call this function to get all printers on system
     */
    function getPrinters() {
        lp.getPrinters( function(data) {
            $.each(data, function( index, value ) {
                debug( value.Name );
            });
        }, function(data) {
            debug('Failed getting printers' );
        });
    }


    /**
     * Populate the printer menu
     */
    function populatePrinterMenu() {
        lp.getPrinters( function(data) {
            $.each(data, function(index, value) {
                $('#printerMenu').
                append($("<option></option>").
                attr("value", value.Name).
                text(value.Name));
            });

        }, function(data) {
            debug('Failed populating printer menu' );
        });
    }


    /**
     * Call this function to get all printers on system
     */
    function getVersion() {
        lp.getVersion( function(data) {
            debug('Version: ' + data.version + ', Hash: ' + data.hash);
        }, function(data) {
            debug('Failed getting version' );
        });
    }
});