var wbmodal = `
<div class="modal fade" id="writeBackModal" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" >Are you sure?</h5>
                <button type="button" class="close" data-dismiss="modal" >
                <span>&times;</span>
                </button>
            </div>
            <div class="modal-body">
                ...
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" id="wbbtn">Save</button>
            </div>
        </div>
    </div>
</div>`;

function getEventID(eventDisplayName) {
    var r = ""
    $.each( ctriTweaksReportWriteBack['general']['eventMap'], function(eventID, data) {
        if( data['display'] == eventDisplayName ) {
            r = eventID;
            return false;
        }
    });
    return r;
}

function perfromWriteBack() {
    var url = new URL(window.location.href);
    var id_index = $("#report_table th:contains('"+ctriTweaksReportWriteBack['general']['record_id']+"')").index();
    var event_index = $("#report_table th:contains('redcap_event_name')").index();
    var instrument_index = $("#report_table th:contains('redcap_repeat_instrument')").index();
    var instance_index = $("#report_table th:contains('redcap_repeat_instance')").index();
    var post_data = { 
        'pid': Number(url.searchParams.get("pid")),
        'write': []
    };
    $("#report_table tr").slice(1).each( function( index, el ) {
        post_data['write'].push( {
            'record': $($(el).find('td')[id_index]).text(),
            'event': getEventID($($(el).find('td')[event_index]).text()),
            'instrument': $($(el).find('td')[instrument_index]).text().toLowerCase(),
            'instance': $($(el).find('td')[instance_index]).text(),
            'varName': ctriTweaksReportWriteBack['config'][0]['var'],
            'val': ctriTweaksReportWriteBack['config'][0]['value']
        } );
    });
    console.log(post_data);
    //Todo need to filter out writing to record/events where the var doesn't exist
    $.ajax({
        method: 'POST',
        url: ctriTweaksReportWriteBack.general.post,
        data: {obj: JSON.stringify(post_data)},
        error: function(jqXHR, textStatus, errorThrown){ 
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
            $('#writeBackModal').modal('hide');
        },
        success: function(data){ 
            console.log(data);
            $('#writeBackModal').modal('hide');
        }
    });
}

function monitorWBbutton() {
    if ($('[id="wbopenmodal"]').length > 1)
        $('[id="wbopenmodal"]').parent().remove();
    if ($("#wbopenmodal").length == 0)
        placeWriteBackButton();
    else
        setTimeout(monitorWBbutton,1000);
}

function placeWriteBackButton() {
    if ( $("#report_div .d-print-none").length == 2 ) {
        var load = `
        <div style='margin-top:10px;'>
            <button id="wbopenmodal" class="report_btn jqbuttonmed ui-button ui-corner-all ui-widget" style="font-size:12px;" data-toggle="modal" data-target="#writeBackModal">
                <i class="fas fa-pencil-alt fs10"></i> button text
            </button>
        </div>`.replace('button text',ctriTweaksReportWriteBack['config'][0]["btn"]);
        $("#report_div .d-print-none").last().append(load);
        monitorWBbutton();
    }
    else {
        if ($('#report_load_progress2').is(":visible") || $('#report_load_progress').is(":visible"))
            setTimeout(placeWriteBackButton,1000)
        else
            window.requestAnimationFrame(placeWriteBackButton);
    }
}

$(document).ready(function () {
    //Todo loop over the values sent back rather than just use 0th
    placeWriteBackButton();
    $("#sub-nav").after(wbmodal.replace('...',ctriTweaksReportWriteBack['config'][0]["text"]));
    $("#wbbtn").on("click",perfromWriteBack);
});