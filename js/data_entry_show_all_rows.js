$(window).bind('keydown', function (event) {
    if ((event.ctrlKey || event.metaKey) && event.which == 192) {
        $("tr").show();
    }
});