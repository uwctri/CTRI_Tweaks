$(document).ready(function pes() {
    if ( $(".DTFC_ScrollWrapper").length != 0 )
        disableFixedTableHdrs('event_grid_table',0);

    $('#event_grid_table').before('<ul class="nav nav-tabs" id="customRecordHomeTabs"></ul>');
    var new_tab = '<li class="nav-item"><a class="nav-link" href="#">NAME</a></li>'
    $.each( ctriTweaksTabConfig, function(tab_name,event_names) { 
        $('#customRecordHomeTabs').append( new_tab.replace("NAME", tab_name) );
    });

    $('#customRecordHomeTabs a').on('click', function () {
        $('#customRecordHomeTabs a').removeClass('active');
        $(this).addClass('active');
        $('#event_grid_table tr').find('td,th').hide();
        $('#event_grid_table tr').find('td:eq(0),th:eq(0)').show();
        $.each( ctriTweaksTabConfig[$(this).text()], function(index, name) {
            var col = $("#event_grid_table th").index($("th:contains('"+name+"')"));
            $('#event_grid_table tr').find('td:eq('+col+'),th:eq('+col+')').show();
        });
    });
    $('#customRecordHomeTabs a').first().click();
});