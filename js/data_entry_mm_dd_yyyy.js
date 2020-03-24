$(document).ready(function () {
    $("span.df:contains('M-D-Y H:M')").text("MM-DD-YYYY HH:MM");
    $("span.df:contains('M-D-Y')").text("MM-DD-YYYY");
});