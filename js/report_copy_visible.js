function copyData() {
    var headers = $("#report_table th :last-child").filter('div').map(function(_,value) {
        return $(value).text();
    });
    var data = $("#report_table td").map(function(index,value) {
        if ( index % headers.length == 0 )
            return '\n'+$(value).text();
        return $(value).text();
    });
    navigator.clipboard.writeText(headers.get().join('\t')+data.get().join('\t'));
}

function monitorCopyBtn() {
    if ($('[id="copyDataBtn"]').length > 1)
        $('[id="copyDataBtn"]').remove();
    if ($("#wbopenmodal").length == 0)
        placeCheckBox();
    else
        setTimeout(monitorCopyBtn,1000);
}

function placeCopyBtn() {
    if ( $("#report_div .d-print-none").length == 2 ) {
        var btn = '<a href="#" class="btn btn-secondary btn-sm" role="button" id="copyDataBtn"><i class="fas fa-clipboard"></i></a>'
        $("#report_table_wrapper").prepend(btn)
        $("#copyDataBtn").popover({
            content: "Copy data below to clipboard",
            trigger: "hover"
        });
        $("#copyDataBtn").on("click",copyData);
        monitorCopyBtn();
    }
    else {
        if ($('#report_load_progress2').is(":visible") || $('#report_load_progress').is(":visible"))
            setTimeout(placeCopyBtn,1000)
        else
            window.requestAnimationFrame(placeCopyBtn);
    }
}

$(document).ready(function () {
    $('head').append(
    `<style>
        #copyDataBtn{
            color: #aaa;
            background-color: #eee;
            border-color: #eee
        }
    </style>`);
    placeCopyBtn();
});