$(document).ready(function () {
    $("body").keypress(function (e) {
        if (e.keyCode == 96) {
            $("input:visible:disabled").attr('disabled', false);
        }
    });
});