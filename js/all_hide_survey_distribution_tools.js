$(document).ready(function () {
    var dc = $("#west .x-panel:contains(Data Collection)").first();
    dc.find(".hang:contains(Survey Distribution Tools)").remove();
    dc.find(".menuboxsub:contains(public survey link)").remove();
});