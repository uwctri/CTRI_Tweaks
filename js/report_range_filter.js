// handle dates (mdy)
// organize ui
// handle missing max or min value

$.fn.dataTable.ext.search.push(
    function( settings, data, dataIndex ) {
        var min = $('#tableFilterMin').val();
        var max = $('#tableFilterMax').val();
        var target = $('#minmaxpivot').val();
        var pivot = data[$("#report_table th").index($("th:contains('"+target+"')"))] || 0;
        console.log(min + " " + max + " " + pivot);
        if ( ( isNaN( min ) && isNaN( max ) ) ||
             ( isNaN( min ) && pivot <= max ) ||
             ( min <= pivot && isNaN( max ) ) ||
             ( min <= pivot && pivot <= max ) )
            return true;
        return false;
    }
);

var ctriTweaksNewFilters = `
<div class="dataTables_filter">
    <select id="minmaxpivot">
        <option value="" selected disabled hidden>Filter Range On...</option>
    </select>
</div>
<div class="dataTables_filter">
    <label><input type="text" placeholder="Maximum" id="tableFilterMax"></label>
</div>
<div class="dataTables_filter">
    <label><input type="text" placeholder="Minimum" id="tableFilterMin"></label>
</div>`;

function monitorBoxes() {
    if ($('[id="hideEmptyRowsCheck"]').length > 1)
        $('[id="hideEmptyRowsCheck"]').parent().remove();
    if ($("#hideEmptyRowsCheck").length == 0)
        placeInputBoxes();
    else
        setTimeout(monitorBoxes,1000);
}

function placeInputBoxes() {
    if ( $("#report_div .d-print-none").length == 2 ) {
        $("#report_table_filter").before(ctriTweaksNewFilters);
        $("#report_table th :last-child").filter('div').each( function( _, val ){
            $("#minmaxpivot").append('<option value='+$(val).text()+'>'+$(val).text()+'</option>')
        });
        $('#tableFilterMin, #tableFilterMax, #minmaxpivot').keyup( function() {
            $("#report_table").DataTable().draw()
        } );
    }
    else {
        if ($('#report_load_progress2').is(":visible") || $('#report_load_progress').is(":visible"))
            setTimeout(placeInputBoxes,1000)
        else
            window.requestAnimationFrame(placeInputBoxes);
    }
}

$(document).ready(function () {
    placeInputBoxes();
});