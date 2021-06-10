$(document).ready(function () {
    $(".reportnum").each(function() {
        $(this).next().attr('href', $(this).next().attr('href')+'&pagenum=ALL' );
    });
});