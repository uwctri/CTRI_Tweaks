$(document).ready(function () {
    let newRecordPage = "DataEntry/record_home.php";
    $(".btn.btn-xs.btn-rcgreen.fs13").attr('onClick', '').off().on('click', function() {
        window.location.href = app_path_webroot + newRecordPage + '?pid=' + pid + '&id=' + CTRItweaks.newRecordID + '&auto=1&arm=' + ($('#arm_name_newid').length ? $('#arm_name_newid').val() : '1');
        return false;
    });
    $(".btn.btn-xs.btn-rcgreen.fs13").css('pointer-events', 'all');
});