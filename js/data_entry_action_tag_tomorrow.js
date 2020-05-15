$(document).ready(function () {
    const buttonTemplate = `
    <button class="jqbuttonsm ui-button ui-corner-all ui-widget tomorrowButton" style="margin:5px 0 5px 5px">Tomorrow</button>
    `;
    $.each(CTRItweaks.tomorrowButton, function() {
        let $inputBox = $(`input[name=${this}]`);
        $inputBox.parent().find('span').before(buttonTemplate);
        $inputBox.parent().find('.tomorrowButton').on('click', function( event ) {
            event.preventDefault();
            $inputBox.val(formatRedcapDate(getNextWeekDay(),$inputBox.attr('fv')))
        });
    });
    
});

function formatRedcapDate(date, format) {
    let month = date.getMonth() + 1;
    if (month < 10) month = "0" + month;
    let day = date.getDate();
    if (day < 10) day = "0" + day;
    let year = date.getFullYear();
    if (/_mdy/.test(format)) {
        return month+'-'+day+'-'+year;
    } else if (/_dmy/.test(format)) {
        return day+'-'+month+'-'+year;
    } else {
        return year+'-'+month+'-'+day;
    }
}

// Returns the Date Object for the next weekday
function getNextWeekDay() {
    var t = new Date(new Date().setDate(new Date().getDate() + 1));
    if (t.getDay() == "6")
        t.setDate(t.getDate()+2);
    return t;
}