function mergeArray(arr1, arr2) {
    let target = [];
    $.each( arr1, function(index,arr1Value) {
        if ( arr2[index] == "" || arr1Value == "" )
            target[index] = arr1Value || arr2[index];
        else {
            target = false;
            return true;
        }
    });
    return target;
}

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
        //Todo assume its called "record_id" for now
        var skip = $('#report_table th:contains(record_id),th:contains(redcap_repeat_instrument),th:contains(redcap_repeat_instance),th:contains(redcap_event_name)').length;
        var header = $("#report_table thead tr").length;
        $('#report_table tr').slice(header).filter(function(){
            return $(this).find('td').filter(function(i) {
                if ( i>=skip && $(this).text()!='')
                    return true;
            }).length == 0;
        }).addClass('emptyRow').hide();
    }
    else
        $('#report_table tr.emptyRow').show();
    reStripeRows();
}

function hideRedcapColsCheck() {
    if ($('#hideRedcapColsCheck').prop('checked')) {
        var haystack = ["redcap_repeat_instrument","redcap_repeat_instance","redcap_event_name"];
        $('#report_table th :first-child').not("wbr").each( function(i) {
            if ( haystack.includes($(this).text()) ) {
                $(this).parent().addClass('emptyCol').hide();
                $("#report_table td:nth-child("+(i+1)+")").addClass('emptyCol').hide();}
        });
    }
    else{
        $("#report_table th.emptyCol").show();
        $("#report_table td.emptyCol").show();
    }
}

function squashRowsCheck() {
    // Assume its called record_id - todo
    if ($('#squashRowsCheck').prop('checked')) {
        if( $('#report_table th:contains(record_id)').length == 0 )
            return;
        if ( !$('#report_table th:contains(record_id)').hasClass('sorting_asc') ) 
            $('#report_table th:contains(record_id)').click()
        let col = $('#report_table th:contains(record_id)').get(0).cellIndex;
        let prev_id = -1;
        $("#report_table tr:visible").each(function(index,row){
            if ( index == 0) 
                return;
            let id = $(this).find('td a').eq(col).text();
            if (id == prev_id ) {
                let thisData = $(this).find(`td:visible:not(:eq(${col}))`).map((_,x)=>$(x).text()).toArray();
                let oldData = $(this).prevAll(':visible').first().find(`td:visible:not(:eq(${col}))`).map((_,x)=>$(x).text()).toArray();
                let newData = mergeArray(thisData,oldData);
                if ( newData ) {
                    $(this).find(`td:visible:not(:eq(${col}))`).each( function(index,el) {
                        if ( $(el).text() != newData[index] ) {
                            $(el).removeClass('nodesig').text(newData[index]);
                            $(el).addClass('squashedPopCell');
                        }
                    });
                    $(this).prevAll(':visible').first().addClass('squashRowHide').hide();
                }
            }
            prev_id = id;
        });
    } else {
        $("#report_table tr.squashRowHide").show();
        $("#report_table td.squashedPopCell").addClass('nodesig').text('');
    }
    reStripeRows();
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
    if ( $("#report_div .d-print-none").length >= 2 ) { // 2 features when no pagination, otherwise 4
        var load = `
        <div style='margin-top:10px; id="checkboxGrouper"'>
            <span style='margin-right:10px;font-weight:bold;'>Hide Empty Rows: </span>
            <input type='checkbox' class='form-check-input' style='margin-left:0' id='hideEmptyRowsCheck' checked>
            <span style='margin-right:10px;margin-left:30px;font-weight:bold;'>Hide Redcap Generated Columns: </span>
            <input type='checkbox' class='form-check-input' style='margin-left:0' id='hideRedcapColsCheck' checked>
            <br>
            <span style='margin-right:10px;margin-left:29px;font-weight:bold;'>Squash Rows: </span>
            <input type='checkbox' class='form-check-input' style='margin-left:2px' id='squashRowsCheck' checked>
        </div>`;
        $("#report_div .d-print-none").eq(1).append(load); // Use the last of the two at the top. Other two are at bottom of page when pagination
        $("#hideEmptyRowsCheck").on("change",hideEmptyRowsCheck);
        $("#hideRedcapColsCheck").on("change",hideRedcapColsCheck);
        $("#squashRowsCheck").on("change",squashRowsCheck);
        hideEmptyRowsCheck();
        hideRedcapColsCheck();
        squashRowsCheck();
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
    if (getParameterByName('report_id') == "ALL" || (getParameterByName('pagenum') || "ALL") != "ALL")
        return;
    placeCheckBox();
});
