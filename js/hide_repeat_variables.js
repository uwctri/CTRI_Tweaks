//No longer used

$(document).ready(function hrv() {
    // Call self until the report table is built in the dom
    if ($('#report_table').length === 0) 
        window.requestAnimationFrame(hrv);
    else {
        const haystack = ["redcap_repeat_instrument","redcap_repeat_instance","redcap_event_name"];
        $('#report_table th :first-child').not("wbr").each( function(i) {
            if ( haystack.includes($(this).text()) ) {
                $(this).parent().hide();
                $("#report_table td:nth-child("+(i+1)+")").hide();}
        });
    }
});
