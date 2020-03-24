$(document).ready(function () {
    var alert_text = `
    <div class="alert alert-primary" role="alert" style="border-color:#b8daff!important"> 
        Alert Text
    </div>`
    $(".col-12.mb-4").prepend(alert_text.replace('Alert Text',CTRItweaks.AlertText))
});