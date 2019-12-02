function reStripeRows(){
    $("tr.odd:visible,tr.even:visible").each( function(i){
        $(this).removeClass();
        if (i%2 == 0)
            $(this).addClass('even');
        else
            $(this).addClass('odd');
    });
}

function hideEmptyRowsCheck(){
    if ($('#hideEmptyRowsCheck').prop('checked')) {
        var max = $('#report_table tr').last().find('td').length;
        $('tr').slice(2).filter(function(i){
            $(".DTFC_LeftBodyLiner tr [data-dt-row="+i+"]").hide();
            return !($(this).find('td:empty').length != max);
        }).hide();
    }
    else
        $('#report_table tr').show();
    reStripeRows();
}

function hideRedcapColsCheck() {
    if ($('#hideRedcapColsCheck').prop('checked')) {
        var haystack = ["redcap_repeat_instrument","redcap_repeat_instance","redcap_event_name"];
        $('#report_table th :first-child').not("wbr").each( function(i) {
            if ( haystack.includes($(this).text()) ) {
                $(this).parent().hide();
                $("#report_table td:nth-child("+(i+1)+")").hide();}
        });
    }
    else{
        $("#report_table th").show();
        $("#report_table td").show();
    }
}

function monitorCheckBox() {
    if ($('[id="checkboxGrouper"]').length > 1)
        $('[id="checkboxGrouper"]').remove();
    if ($("#hideEmptyRowsCheck").length == 0)
        placeCheckBox();
    else
        setTimeout(monitorCheckBox,1000);
}

function placeCheckBox() {
    if ( $("#report_div .d-print-none").length == 2 ) {
        var load = `
        <div style='margin-top:10px; id="checkboxGrouper"'>
            <span style='margin-right:10px;font-weight:bold;'>Hide Empty Rows: </span>
            <input type='checkbox' class='form-check-input' style='margin-left:0' id='hideEmptyRowsCheck' checked>
            <span style='margin-right:10px;margin-left:30px;font-weight:bold;'>Hide Redcap Generated Columns: </span>
            <input type='checkbox' class='form-check-input' style='margin-left:0' id='hideRedcapColsCheck'>
        </div>`;
        $("#report_div .d-print-none").last().append(load);
        $("#hideEmptyRowsCheck").on("change",hideEmptyRowsCheck);
        $("#hideRedcapColsCheck").on("change",hideRedcapColsCheck);
        hideEmptyRowsCheck();
        monitorCheckBox();
    }
    else {
        if ($('#report_load_progress2').is(":visible") || $('#report_load_progress').is(":visible"))
            setTimeout(placeCheckBox,1000);
        else
            window.requestAnimationFrame(placeCheckBox);
    }
}

$(document).ready(function () {
    placeCheckBox();
});