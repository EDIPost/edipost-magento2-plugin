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

    /**
     * Call this function to start RAW print
     */
    function startPrintRaw(zplData, printerName) {
        lp.printRaw(zplData, printerName, function (data) {
            $('body').loader('hide');
        }, function (data) {
            $('body').loader('hide');
            alert('Error when printing RAW: ' + data.ErrorText);
        });
    }

    /**
     * Call this function to start PDF print from url
     */
    function startPrintPdf(url, printerName) {
        lp.printPdf( url, printerName, function(data) {
            $('body').loader('hide');
        }, function(data) {
            $('body').loader('hide');
            alert('Error when printing PDF: ' + data.ErrorText);
        });
    }

    if($('#row_shipment_printers_printer').length > 0) {
        checkPrintEngine();
    }

    $('#edipost_check_printer_rfid').on('click', function (e) {
        e.preventDefault();
        var printerName = $('#shipment_printers_printer_rfid').val(),
            zplData = '^XA^CI28^FO56,56^GB728,792,2.4,B,0^FS^FO40,160^A0N,176,176^FB760,1,0,C,0^FH^FDDEMO^FS^FO40,320^A0N,176,176^FB760,1,0,C,0^FH^FDPRINT^FS^FO40,560^A0N,80,80^FB760,1,0,C,0^FH^FD99 x 104 mm label^FS^FO40,680^A0N,80,80^FB760,1,0,C,0^FH^FDwww.edipost.no^FS^XZ';

        startPrintRaw(zplData, printerName)
    });

    $('#edipost_check_printer').on('click', function (e) {
        e.preventDefault();

        $('body').loader('show');

        var printerName = $('#shipment_printers_printer').val(),
            url = 'http://no.pbshipment.com/demo-label.pdf';

        startPrintPdf(url, printerName);
    });
});