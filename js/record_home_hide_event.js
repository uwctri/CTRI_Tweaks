$(document).ready(function () {
    var col;
    $.each( CTRItweaks.HideEvents, function() {
        col = $("#event_grid_table th").index($(`th:contains(${this})`));
        $('#event_grid_table tr').find(`td:eq(${col}),th:eq(${col})`).remove();
    });
});
