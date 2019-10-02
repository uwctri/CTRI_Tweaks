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
        $('tr').show();
    reStripeRows();
}

function monitorCheckBox() {
    if ($("#hideEmptyRowsCheck").length == 0)
        placeCheckBox();
    else
        setTimeout(monitorCheckBox,1000);
}

function placeCheckBox() {
    if ($("#lf1").length == 1 && $("#lf1").is(':visible')) {
        const load = "<div style='margin-top:10px;'><span style='margin-right:10px;font-weight:bold;'>Hide Empty Rows: </span><input type='checkbox' class='form-check-input' style='margin-left:0' id='hideEmptyRowsCheck' checked></div>";
        $('#lf1').parent().after(load);
        $("#hideEmptyRowsCheck").on("change",hideEmptyRowsCheck);
        hideEmptyRowsCheck();
        monitorCheckBox();
    }
    else {
        if ($('#report_load_progress2').is(":visible") || $('#report_load_progress').is(":visible"))
            setTimeout(placeCheckBox,1000)
        else
            window.requestAnimationFrame(placeCheckBox);
    }
}

$(document).ready(function () {
    placeCheckBox();
});