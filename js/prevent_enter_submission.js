$(document).ready(function () {
	$("input.x-form-text.x-form-field").off("keydown");
	$("input.x-form-text.x-form-field").keydown(function (e) {
        if (e.keyCode == 13) 
            return false;
    });
});