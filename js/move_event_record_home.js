$(document).ready(function () {
    var maxCells = 5;
    var title = ctriTweaksRecordHomeEvent;
    var col = $("#event_grid_table th").index($("th:contains('"+title+"')"))

    newTable = `
    <div class="table-responsive">
        <table id="systemManagementTable" class="table table-bordered" style="background-color:#fcfef5;color:#000;width:max-content">
            <tbody>
                <tr><td id="eventReformatTitle" style="text-align:center;background-color:#FFFFE0"><b>System Management</b></td></tr>
            </tbody>
        </table>
    </div>`.replace('System Management',title);
    $("#record_display_name").after(newTable);
    $("button[targetid='event_grid_table']").remove();

    var total_col = $("th").length;
    $("#event_grid_table th:eq("+col+")").remove();
    var total_row = $("#event_grid_table tr").length -1;
    var insertionCounter = 0;
    $("#event_grid_table td").each( function(index, el) {
        if ( index % total_col == col) {
            if ((index < ((total_row - 1)*total_col)) && !$(el).is(':empty')) {
                if (insertionCounter++ % maxCells == 0)
                    $("#systemManagementTable tr").last().after("<tr></tr>");
                $("#systemManagementTable tr").last().append($(el).clone());
                $("#systemManagementTable tr").last().find("td").last().append("<span style='margin-left:5px'>"+$(el).prev(".labelform").text()+"</span>")
            }
            $(el).remove();
        }
    });
    insertionCounter = insertionCounter > maxCells ? maxCells : insertionCounter;
    $("#eventReformatTitle").attr('colspan',insertionCounter);
});
