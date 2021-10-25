$(document).ready(() => {
    $('input[fv=time]').on('change', (event) => {
        event.preventDefault();
        let el = event.target;
        if ( !$(el).val() )
            return;
        let time = $(el).val().toLowerCase();
        let isPM = time.includes('p');
        let isAM = time.includes('a');
        time = time.replace(/[\sapm]/g,'');
        if ( time.replace(':','').length > 4 )
            return;
        let [hours,mins] = time.split(':');
        hours = isAM && hours.slice(0,2) == 12 ? "00"+hours.slice(2,hours.length) : hours;
        isPM = isPM && hours.slice(0,2) == 12 ? false : isPM;
        if ( hours && mins ) {
            hours = isPM ? (parseInt(hours)+12)%24 : hours;
        } else if ( hours.length <= 2 ) { // Only hour
            mins = 0;
            hours = isPM ? (parseInt(hours)+12)%24 : hours;
        } else if ( hours.length <= 4 ) {
            mins = hours.slice(-2);
            hours = hours.slice(0,hours.length-2);
            hours = isPM ? (parseInt(hours)+12)%24 : hours;
        }
        $(el).val( String(hours).padStart(2,'0')+":"+String(mins).padStart(2,'0') );
    });
});