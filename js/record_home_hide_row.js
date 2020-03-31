$(document).ready(function () {
    var instrument_list = CTRItweaks.RecordHomeForms.map(s=>s.replace(/_/g, ''));
    $("#event_grid_table td:first-child").each( function() {
        if ( $.inArray( $(this).text().replace(/[^a-z0-9\s]/gi, '').replace(/ +?/g, '').toLowerCase(), instrument_list ) > -1)
            $(this).parent().remove();
    });
    $("#event_grid_table tr").each( function(index, el){
        $(el).removeClass();
        if (index%2 == 0)
            $(el).addClass('even');
        else
            $(el).addClass('odd');
    });
});