$(document).ready(function () {
    var col;
    $.each( CTRItweaks.HideEvents, function(_,name) {
        col = $("#event_grid_table th").index($("th:contains('"+name+"')"))
        $('#event_grid_table tr').find('td:eq('+col+'),th:eq('+col+')').remove();
    });
});
