require([
    "jquery",
    "Edipost_Shipment/js/localprint/localprint"
], function($){
    var lp = new LocalPrint();

    /**
     * Check if print engine is active
     */
    function checkPrintEngine() {

        return lp.getVersion( function(data) {
            console.log(data);
            fillAllSelects(  {
                error: 0,
                text: "<span style='color: green;'>Active</span>"
            });

        }, function(data) {
            fillAllSelects(  {
                error: 1,
                text: "<span style='color: red;'>Not Active</span>"
            });
        });
    }

    /**
     * Populate select with printers list
     *
     */
    function populatePrinterMenu(select_id, selected_val) {
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

            $(select_id).find('option').each(function() {
                if ( $(this).val() == selected_val ) {
                    $(this).prop('selected', true);
                }
            });

        }, function(data) {
            console.log('Failed populating printer menu' );
        });
        console.log('populated');
    }

    function fillAllSelects(PrintEngineStatus) {
        var htmlEngine = "<tr id='row_shipment_printer_state'><td class='label'><label><span>Print engine</span></label></td><td class='value'><p class=''>" +
            PrintEngineStatus.text + "</p></td><td class=''></td></tr>";

        $(htmlEngine).insertBefore("#row_shipment_printers_printer");
        if(!PrintEngineStatus.error){
            populatePrinterMenu('#shipment_printers_printer', EDIPOST_PRINTER);
            populatePrinterMenu('#shipment_printers_printer_rfid', EDIPOST_PRINTER_RFID);
        }
    }

    if($('#row_shipment_printers_printer').length > 0) {
        checkPrintEngine();
    }
});