$("head").append("<style>button.btn-rcgreen { pointer-events: none; }</style>");
$(document).ready(() => {
    let url = new URL(`${app_path_webroot_full}redcap_v${redcap_version}/DataEntry/record_home.php`);
    url.searchParams.set('pid', pid);
    url.searchParams.set('id', CTRItweaks.newRecordID);
    url.searchParams.set('auto', 1);
    url.searchParams.set('arm', $('#arm_name_newid').length ? $('#arm_name_newid').val() : '1');
    $("button.btn-rcgreen").attr('onclick', '').off().on('click', () => window.location.href = url);
    $("button.btn-rcgreen").css('pointer-events', 'all');
});