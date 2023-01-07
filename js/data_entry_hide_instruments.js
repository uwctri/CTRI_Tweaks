$(document).ready(function () {
    $(".formMenuList").remove();
    $(".menuboxsub").last().html(
        $(".menuboxsub").last().html().replace("Data Collection Instruments:", '')
    );
});