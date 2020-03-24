function reStripeRows(){
    $("tr.odd:visible,tr.even:visible").each( function(i){
        $(this).removeClass();
        if (i%2 == 0)
            $(this).addClass('even');
        else
            $(this).addClass('odd');
    });
}

function reStripeDelay() {
    setTimeout(reStripeRows, 10);
}

function hideEmptyRowsCheck(){
    if ($('#hideEmptyRowsCheck').prop('checked')) {
        //Todo assuming that we are skipping stuff on the left side for now
        var skip = $('#report_table th:contains(record_id),th:contains(redcap_repeat_instrument),th:contains(redcap_repeat_instance),th:contains(redcap_event_name)').length;
        var header = $("#report_table thead tr").length;
        $('#report_table tr').slice(header).filter(function(){
            return $(this).find('td').filter(function(i) {
                if ( i>=skip && $(this).text()!='')
                    return true;
            }).length == 0;
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
            <input type='checkbox' class='form-check-input' style='margin-left:0' id='hideRedcapColsCheck' checked>
        </div>`;
        $("#report_div .d-print-none").last().append(load);
        $("#hideEmptyRowsCheck").on("change",hideEmptyRowsCheck);
        $("#hideRedcapColsCheck").on("change",hideRedcapColsCheck);
        hideEmptyRowsCheck();
        hideRedcapColsCheck();
        monitorCheckBox();
        $("#report_div th").on("click", reStripeDelay);
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
