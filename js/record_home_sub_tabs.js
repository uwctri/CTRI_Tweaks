function restripeRows(){
    $("#event_grid_table tr.odd:visible, #event_grid_table tr.even:visible").each( function(i){
        $(this).removeClass();
        if (i%2 == 0)
            $(this).addClass('even');
        else
            $(this).addClass('odd');
    });
}

function tabDisplayWatchdog() {
    if ( $("a:contains(Table not displaying properly)").length != 0 )
        disableFixedTableHdrs('event_grid_table',0);
    else
        setTimeout(tabDisplayWatchdog, 1000);
    $("#FixedTableHdrsEnable").hide();
}

$(document).ready(function () {
    tabDisplayWatchdog();
    $('head').append(
        `<style>
            #customRecordHomeTabs .nav-link.active {
                background-color: #FFFFE0
            }
            #customRecordHomeTabs .nav-link {
                border-color: #ccc;
                border-bottom: none;
                margin-right: 1px;
            }
            #tabsRow {
                margin-left: 0;
            }
            #addNewTabButton {
                margin: 4px 0 5px 25px;
                color: #fff;
                height: 25px;
                padding: 3px 8px 3px 8px;
            }
        </style>`);
    $('#event_grid_table').before('<div id="tabsRow" class="row"><ul class="nav nav-tabs" id="customRecordHomeTabs"></ul></div>');
    $('.nav-tabs').css('border-bottom','none');
    var new_tab = '<li class="nav-item"><a class="nav-link" href="javascript:void(0);">{TabName}</a></li>'
    $.each( Object.keys(CTRItweaks.TabConfig), function() { 
        $('#customRecordHomeTabs').append( new_tab.replace("{TabName}", this) );
    });
    
    $('#customRecordHomeTabs a').on('click', function () {
        $('#customRecordHomeTabs a').removeClass('active');
        $(this).addClass('active');
        $('#event_grid_table tr').show();
        $('#event_grid_table tr').find('td,th').hide();
        $('#event_grid_table tr').find('td:eq(0),th:eq(0)').show();
        var col;
        $.each( CTRItweaks.TabConfig[$(this).text()], function(index, name) {
            col = $("#event_grid_table th").index($(`th:contains(${name})`));
            $('#event_grid_table tr').find(`td:eq(${col}),th:eq(${col})`).show();
        });
        var header = $("#event_grid_table thead tr").length;
        $('#event_grid_table tr:visible').slice(header).each( function(index) {
            if( $(this).find('td:visible:empty').length == $(this).find('td:visible').length-1)
                $(this).hide();
        });
        restripeRows();
    });
    
    if ( typeof CTRItweaks.AddTabText != 'undefined' && CTRItweaks.AddTabText != "") {
        $('.nav-link').slice(1).each( function(index) {
            $(this).click();
            if ( $('#event_grid_table img:visible').filter('[src*="circle_red"],[src*="circle_green"],[src*="circle_yellow"]').length == 0 )
                $(this).hide();
        });
        if ( Object.keys(CTRItweaks.TabConfig).length != $('#customRecordHomeTabs a:visible').length ) {
            $('#tabsRow').append('<a id="addNewTabButton" class="btn btn-primary btn-sm" href="#" role="button">'+CTRItweaks.AddTabText+'</a>')
            $('#addNewTabButton').on('click', function () {
                $('.nav-link').not(':visible').first().show();
                $(this).hide();
            });
        }
    }
    
    $('#customRecordHomeTabs a').first().click();
    
});