var wbmodal = `
<div class="modal fade" id="writeBackModal" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" >Are you sure? (this is not yet functional)</h5>
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

function perfromWriteBack() {
    console.log("writing "+ctriTweaksReportWriteBack[0]["value"]+" to "+ctriTweaksReportWriteBack[0]["var"]);
    $('#writeBackModal').modal('hide')
}

function monitorWBbutton() {
    if ($("#wbopenmodal").length == 0)
        placeCheckBox();
    else
        setTimeout(monitorCheckBox,1000);
}

function placeWriteBackButton() {
    if ( $("#report_div .d-print-none").length == 2 ) {
        const load = `
        <div style='margin-top:10px;'>
            <button id="wbopenmodal" class="report_btn jqbuttonmed ui-button ui-corner-all ui-widget" style="font-size:12px;" data-toggle="modal" data-target="#writeBackModal">
                <i class="fas fa-pencil-alt fs10"></i> button text
            </button>
        </div>`.replace('button text',ctriTweaksReportWriteBack[0]["btn"]);
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
    //console.log( ctriTweaksReportWriteBack );
    //Todo loop over the values sent back rather than just use 0th
    placeWriteBackButton();
    $("#sub-nav").after(wbmodal.replace('...',ctriTweaksReportWriteBack[0]["text"]));
    $("#wbbtn").on("click",perfromWriteBack);
});