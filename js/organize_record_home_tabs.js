$(document).ready(function pes() {
    if ( $(".DTFC_ScrollWrapper").length != 0 )
        disableFixedTableHdrs('event_grid_table',0);
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
    $("#FixedTableHdrsEnable").remove();
    $('#event_grid_table').before('<div id="tabsRow" class="row"><ul class="nav nav-tabs" id="customRecordHomeTabs"></ul></div>');
    $('.nav-tabs').css('border-bottom','none');
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
    
    if ( typeof ctriTweaksAddTabText != 'undefined' && ctriTweaksAddTabText != "" ) {
        $('#tabsRow').append('<a id="addNewTabButton" class="btn btn-primary btn-sm" href="#" role="button">'+ctriTweaksAddTabText+'</a>')
        $('.nav-link').slice(1).each( function(index) {
            $(this).click();
            if ( $('#event_grid_table img:visible').filter('[src*="circle_red"],[src*="circle_green"],[src*="circle_yellow"]').length == 0 )
                $(this).hide();
        });
        
        $('#addNewTabButton').on('click', function () {
            $('.nav-link').not(':visible').first().show();
            $(this).hide();
        });
    }
    
    $('#customRecordHomeTabs a').first().click();
    
});