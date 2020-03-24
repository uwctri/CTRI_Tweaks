$(document).ready(function pes() {
    if ($("input.x-form-text.x-form-field").length === 0)
        window.requestAnimationFrame(pes);
    else {
        $("input.x-form-text.x-form-field").off("keydown");
        $("input.x-form-text.x-form-field").keydown(function (e) {
            if (e.keyCode == 13) 
                return false;
        });
    }
});