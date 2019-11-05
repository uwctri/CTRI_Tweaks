jQuery.expr[':'].icontains = function(a, i, m) {
  return jQuery(a).text().toUpperCase()
      .indexOf(m[3].toUpperCase()) >= 0;
};

$(document).ready(function () {
    var instrument_list = ctriTweaksRecordHomeForms.map(s=>s.replace('_',' '));
    $.each( instrument_list, function (_,instrument) {
        $("#event_grid_table td:icontains('"+instrument+"')").parent().remove();
    });
    $("#event_grid_table tr").each( function(index, el){
        $(el).removeClass();
        if (index%2 == 0)
            $(el).addClass('even');
        else
            $(el).addClass('odd');
    });
});