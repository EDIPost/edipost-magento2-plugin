require([
    "jquery",
    "Edipost_Shipment/js/localprint/localprint"
], function($){
    var lp = new LocalPrint();

    /**
     * Check if print engine is active
     */
    function checkPrintEngine() {
        var return_obj = {
            error: 1,
            text: "<span style='color: red;'>Not Active</span>"
        };

        lp.getVersion( function(data) {
            return_obj = {
                error: 0,
                text: "<span style='color: green;'>Active</span>"
            };

        }, function(data) {

        });
        return return_obj;
    }

    /**
     * Populate select with printers list
     *
     */
    function populatePrinterMenu(select_id) {
        lp.getPrinters( function(data) {
            $(select_id).find('option').each(function() {
                if ( $(this).val() == '0' ) {
                    $(this).remove();
                }
            });
            $.each(data, function(index, value) {
                $(select_id).
                append($("<option></option>").
                attr("value", value.Name).
                text(value.Name));
            });

        }, function(data) {
            console.log('Failed populating printer menu' );
        });
    }

    if($('#row_shipment_printers_printer').length > 0) {
        var PrintEngineStatus = checkPrintEngine();
        var htmlEngine = "<tr id='row_shipment_printer_state'><td class='label'><label><span>Print engine</span></label></td><td class='value'><p class=''>" +
            PrintEngineStatus.text + "</p></td><td class=''></td></tr>";

        $(htmlEngine).insertBefore("#row_shipment_printers_printer");
        if(!PrintEngineStatus.error){

            populatePrinterMenu('#shipment_printers_printer');
            $('#shipment_printers_printer').find('option').each(function() {
                if ( $(this).val() == EDIPOST_PRINTER ) {
                    $(this).prop('selected', true);
                }
            });

            populatePrinterMenu('#shipment_printers_printer_rfid');
            $('#shipment_printers_printer_rfid').find('option').each(function() {
                if ( $(this).val() == EDIPOST_PRINTER_RFID ) {
                    $(this).prop('selected', true);
                }
            });
        }
    }
});