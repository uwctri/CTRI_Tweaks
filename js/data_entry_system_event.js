$(document).ready(() => {
    // When on a form in the System Managment event show only the Save & Exit Button
    $("#__SUBMITBUTTONS__-div .btn-group").hide();
    setInterval(() => {
        $("#formSaveTip .btn-group").hide();
    }, 100);
});