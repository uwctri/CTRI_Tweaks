$(document).ready(() => {
    console.log("Loaded CTRI tweaks config")
    let $modal = $('#external-modules-configure-modal');
    let prefix = CTRItweaks.prefix;
    $modal.on('show.bs.modal', function () {
        // Making sure we are overriding this modules's modal only.
        if ($(this).data('module') !== prefix) return;

        if (typeof ExternalModules.Settings.prototype.resetConfigInstancesOld === 'undefined')
            ExternalModules.Settings.prototype.resetConfigInstancesOld = ExternalModules.Settings.prototype.resetConfigInstances;

        ExternalModules.Settings.prototype.resetConfigInstances = function () {
            ExternalModules.Settings.prototype.resetConfigInstancesOld();
            if ($modal.data('module') !== prefix) return;

            // Pretty up the form a bit
            $modal.find('thead').remove();
            $("tr:contains(tableStart)").first().closest('tr').nextUntil("tr:contains(tableEnd)").wrapAll(`
                <table style='width:98%' class='table table-no-top-row-border position-absolute'><tbody></tbody></table>`);
            let rowCount = $("tr:contains(tableStart)").next().find('tr').length;
            $("tr:contains(tableStart)").remove();
            $("tr:contains(tableEnd)").css('height', (45 * rowCount) + 'px');
            $("tr:contains(tableEnd)").html('');

            // Insert a button to deploy Payemnts form
            $("[field=deploy-payment] label").after('<button class="setupPayments" style="float:right">Deploy Payment Instrument</button>')
            $(".setupPayments").on("click", () => {
                $(".setupPayments").attr("disabled", true);
                CTRItweaks.ajax("deploy_payment", {}).then((response) => {
                    location.reload();
                }).catch((err) => {
                    console.log(err)
                });
            });

            // We can only do this because there are no repeating options
            $(".external-modules-instance-label").remove();
        };
    });

    $modal.on('hide.bs.modal', function () {
        // Making sure we are overriding this modules's modal only.
        if ($(this).data('module') !== prefix) return;

        if (typeof ExternalModules.Settings.prototype.resetConfigInstancesOld !== 'undefined')
            ExternalModules.Settings.prototype.resetConfigInstances = ExternalModules.Settings.prototype.resetConfigInstancesOld;
    });

});