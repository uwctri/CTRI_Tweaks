$(document).ready(function pes() {
    if ($("input.x-form-text.x-form-field").length === 0) {
        window.requestAnimationFrame(pes);
        return;
    }
    $("input.x-form-text.x-form-field").off("keydown");
    $("input.x-form-text.x-form-field").keydown((e) => { e.keyCode != 13 })
});