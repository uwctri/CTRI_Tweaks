$(document).ready(function () {
    $("td.nowrap:contains(Unverified)").html($("td.nowrap:contains(Unverified)").html().replace('Unverified', CTRItweaks.UnverifiedName));
});
