function mdy2ymd(str) {
    return str.substr(-4)+'-'+str.substr(0,str.length-5)
}

var ctriTweaksDateRegex = /^\d{2}\-\d{2}\-\d{4}$/ ;
$.fn.dataTable.ext.search.push(
    function( settings, data, dataIndex ) {
        var min = $('#tableFilterMin').val();
        var max = $('#tableFilterMax').val();
        var target = $('#minmaxpivot').val() || "";
        var pivot = data[$("#report_table th").index($("th:contains('"+target+"')"))] || 0;
        min = isNumeric(min) ? Number(min) : ctriTweaksDateRegex.test(min) ? mdy2ymd(min) : min;
        max = isNumeric(max) ? Number(max) : ctriTweaksDateRegex.test(max) ? mdy2ymd(max) : max;
        pivot = isNumeric(pivot) ? Number(pivot) : ctriTweaksDateRegex.test(pivot) ? mdy2ymd(pivot) : pivot;
        if ( ( min==="" && max==="" ) ||
             ( target==="" ) ||
             ( min==="" && pivot <= max ) ||
             ( min <= pivot && max==="" ) ||
             ( min <= pivot && pivot <= max ) )
            return true;
        return false;
    }
);

function monitorBoxes() {
    if ($('[id="NewFiltersGroup"]').length > 1)
        $('[id="NewFiltersGroup"]').remove();
    if ($("#NewFiltersGroup").length == 0)
        placeInputBoxes();
    else
        setTimeout(monitorBoxes,1000);
}

function placeInputBoxes() {
    if ( $("#report_table_wrapper").length == 1 ) {
        var ctriTweaksNewFilters = `
        <div id="NewFiltersGroup">  
            <div class="dataTables_filter">
                <label><input type="text" placeholder="Maximum" id="tableFilterMax" tabindex=3></label>
            </div>
            <div class="dataTables_filter">
                <label><input type="text" placeholder="Minimum" id="tableFilterMin" tabindex=2></label>
            </div>
            <div class="dataTables_filter">
                <select id="minmaxpivot">
                    <option value="" selected disabled hidden>Filter Range On...</option>
                </select>
            </div>
        </div>`;
        $("#report_table_filter").before(ctriTweaksNewFilters);
        $("#report_table th :last-child").filter('div').each( function( _, val ){
            $("#minmaxpivot").append('<option value='+$(val).text()+'>'+$(val).text()+'</option>')
        });
        $('#tableFilterMin, #tableFilterMax').keyup( function() {
            $("#report_table").DataTable().draw();
        });
        $('#minmaxpivot').on("change", function() {
            $("#report_table").DataTable().draw();
        });
        $("#report_table_filter input").attr("tabindex",1)
        monitorBoxes();
    }
    else {
        if ($('#report_load_progress2').is(":visible") || $('#report_load_progress').is(":visible"))
            setTimeout(placeInputBoxes,1000)
        else
            window.requestAnimationFrame(placeInputBoxes);
    }
}

$(document).ready(function () {
    $('head').append(
    `<style>
        #report_div{
            margin-right: 10px !important;  
        }
        #NewFiltersGroup{
            display: contents;
        }
        #minmaxpivot{
            margin-left: 6px;
            height: 24px;
        }
    </style>`);
    placeInputBoxes();
});