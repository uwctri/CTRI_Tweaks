$(document).ready(function () {
    $("input[fv=time]").on('change', function() {
        if ( !$(this).val() )
            return;
        let time = $(this).val().toLowerCase();
        let isPM = time.includes('pm');
        time = time.replace(/\s/g,'').replace('am','').replace('pm','');
        let [hours,mins] = time.split(':');
        
        if ( hours && mins ) {
            hours = isPM ? (parseInt(hours)+12)%24 : hours;
        } else if ( hours.length <= 2 ) { // Only hour
            mins = 0;
            hours = isPM ? (parseInt(hours)+12)%24 : hours;
        } else if ( hours.length <= 4 ) {
            mins = hours.slice(-2);
            hours = hours.slice(0,4-hours.length);
            hours = isPM ? (parseInt(hours)+12)%24 : hours;
        }
        
        $(this).val( String(hours).padStart(2,'0')+":"+String(mins).padStart(2,'0') );
    });
});