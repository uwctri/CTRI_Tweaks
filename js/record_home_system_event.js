$(document).ready(function () {
    var maxCells = 5;
    var col = $("#event_grid_table th").index($(`th:contains(${CTRItweaks.RecordHomeEvent})`))
    var subtitle = $(`#event_grid_table th:eq(${col}) .custom_event_label`).text();
    var newTable = `
    <div class="table-responsive">
        <table id="systemManagementTable" class="table table-bordered" style="background-color:#fcfef5;color:#000;width:max-content">
            <tbody>
                <tr>
                    <td id="eventReformatTitle" style="text-align:center;background-color:#FFFFE0">
                        <div class="evTitle font-weight-bold">${CTRItweaks.RecordHomeEvent}</div>
                        <div class="custom_event_label">${subtitle}</div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>`;
    
    $("#record_display_name").after(newTable);
    $("button[targetid='event_grid_table']").remove();
    if ( subtitle == "" )
        $("#systemManagementTable .custom_event_label").remove();

    var total_col = $("#event_grid_table th").length;
    $(`#event_grid_table th:eq(${col})`).hide();
    var total_row = $("#event_grid_table tr").length -$('td:contains("Delete all data on event:")').length;
    var insertionCounter = 0;
    $("#event_grid_table td").each( function(index, el) {
        if ( index % total_col == col) {
            if ((index < ((total_row - 1)*total_col)) && !$(el).is(':empty')) {
                if (insertionCounter++ % maxCells == 0)
                    $("#systemManagementTable tr").last().after("<tr></tr>");
                $("#systemManagementTable tr").last().append($(el).clone());
                $("#systemManagementTable tr").last().find("td").last().append("<span style='margin-left:5px'>"+($(el).prev(".labelform").text()||$(el).siblings().first().text())+"</span>")
            }
            $(el).hide();
        }
    });
    $("#systemManagementTable button.invis").remove();
    insertionCounter = insertionCounter > maxCells ? maxCells : insertionCounter;
    $("#eventReformatTitle").attr('colspan',insertionCounter);
});
