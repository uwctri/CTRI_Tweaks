$(document).ready(function () {
    var title = ctriTweaksRecordHomeEvent;
    var col = $("#event_grid_table th").index($("th:contains('"+title+"')"))

    newTable = `
    <div class="table-responsive">
        <table class="table table-bordered" style="background-color:#FFFFE0;color:#000;width:max-content">
            <tbody>
                <tr><td id="eventReformatTitle" style="text-align:center"><b>System Management</b></td></tr>
                <tr id="eventReformatInsert" style="max-width:800px">
                </tr>
            </tbody>
        </table>
    </div>`.replace('System Management',title);
    $("#event_grid_table").before(newTable);
    $("button[targetid='event_grid_table']").remove();

    var total_col = $("th").length;
    $("#event_grid_table th:eq("+col+")").remove();
    var total_row = $("#event_grid_table tr").length -1;
    var insertionCounter = 0;
    $("#event_grid_table td").each( function(index, el) {
        if ( index % total_col == col) {
            if ((index < ((total_row - 1)*total_col)) && !$(el).is(':empty')) {
                $("#eventReformatInsert").append($(el).clone());
                $("#eventReformatInsert td").last().append("<span style='margin-left:5px'>"+$(el).prev(".labelform").text()+"</span>")
                insertionCounter++;
            }
            $(el).remove();
        }
    });
    $("#eventReformatTitle").attr('colspan',insertionCounter);
});
