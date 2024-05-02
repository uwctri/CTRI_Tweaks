$(document).ready(() => {
    const $modal = $('#external-modules-configure-modal');
    const module = ExternalModules.UWMadison.CTRItweaks;
    $modal.on('show.bs.modal', function () {
        // Making sure we are overriding this modules's modal only.
        if ($(this).data('module') !== module.prefix) return;

        if (typeof ExternalModules.Settings.prototype.resetConfigInstancesOld === 'undefined')
            ExternalModules.Settings.prototype.resetConfigInstancesOld = ExternalModules.Settings.prototype.resetConfigInstances;

        ExternalModules.Settings.prototype.resetConfigInstances = function () {
            ExternalModules.Settings.prototype.resetConfigInstancesOld();
            if ($modal.data('module') !== module.prefix) return;

            // Pretty up the form a bit
            $modal.find('thead').remove();
            $header = $modal.find("tr[field=payment-header] td")
            $header.css("background-color", "#e6e6e6").css("height", "27em")
            $header.find("label").css("padding-top", "24em")

            $("input[type=checkbox].external-modules-input-element").slice(1).parent().parent().
                wrapAll(`<table style='width:97%' class='table table-no-top-row-border position-absolute'><tbody></tbody></table>`);

            // Insert a button to deploy Payemnts form
            $("[field=deploy-payment] label").after('<button class="setupPayments" style="float:right">Deploy Payment Instrument</button>')
            $(".setupPayments").on("click", () => {
                $(".setupPayments").attr("disabled", true);
                module.ajax("deploy_payment", {}).then((response) => {
                    location.reload();
                }).catch((err) => {
                    console.log(err)
                });
            });

            // Default options
            if ($("[field=show-logo] input:checked").length == 0) {
                $("[field=show-logo] input").eq(0).click(); // Show logo by default
            }
            if ($("[field=show-void] input:checked").length == 0) {
                $("[field=show-void] input").eq(0).click(); // Show void by default
            }

        };
    });

    $modal.on('hide.bs.modal', function () {
        // Making sure we are overriding this modules's modal only.
        if ($(this).data('module') !== module.prefix) return;

        if (typeof ExternalModules.Settings.prototype.resetConfigInstancesOld !== 'undefined')
            ExternalModules.Settings.prototype.resetConfigInstances = ExternalModules.Settings.prototype.resetConfigInstancesOld;
    });

});