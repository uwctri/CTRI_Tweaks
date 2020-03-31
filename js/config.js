$(document).ready(function() {
    console.log("Loaded CTRI tweaks config")
    var $modal = $('#external-modules-configure-modal');
    $modal.on('show.bs.modal', function() {
        // Making sure we are overriding this modules's modal only.
        if ($(this).data('module') !== CTRItweaks.modulePrefix)
            return;
    
        if (typeof ExternalModules.Settings.prototype.resetConfigInstancesOld === 'undefined')
            ExternalModules.Settings.prototype.resetConfigInstancesOld = ExternalModules.Settings.prototype.resetConfigInstances;

        ExternalModules.Settings.prototype.resetConfigInstances = function() {
            ExternalModules.Settings.prototype.resetConfigInstancesOld();

            if ($modal.data('module') !== CTRItweaks.modulePrefix)
                return;

            $modal.addClass('CTRItweaksConfig');
            
            // Pretty up the form a bit
            $modal.find('thead').remove();
            $("tr:contains(tableStart)").first().closest('tr').nextUntil("tr:contains(tableEnd)").wrapAll("\
                <table style='width:98%' class='table table-no-top-row-border position-absolute'><tbody></tbody></table>");
            $("tr:contains(tableStart)").remove();
            $("tr:contains(tableEnd)").css('height','320px');
            $("tr:contains(tableEnd)").html('');
            $("tr[field^=write-back-] span").remove();
            $.each( ['hide-form-row','hide-events','hide-repeating-table','full-size-repeating-table'], function() {
                $(`tr[field=${this}] span`).each( function() {
                    $(this).text($(this).text().split('.')[1]+'. ');
                });
            });
            $("tr[field^=check-print] span").remove();
            $("tr[field=write-back-report] span").remove();
            $.each( ['full-size-repeating-table-list','hide-repeating-table-list',
                     'hide-events-list','hide-form-row-list'], function(){
                $(`tr[field=${this}] span`).first().remove();
            });
            $("tr[field=write-back-variable-list] .external-modules-add-remove-column").css('padding','4px 12px 4px 12px')
            
            // Setup system global drop down
            $("input[name^=write-back-global]").hide();
            var ddm = '<select class="external-modules-input-element global-wb-dropdown"><option value=""></option><option>';
            ddm += Object.keys(CTRItweaks.systemSettings).join("</option><option>") + "</option></select>"
            $("input[name^=write-back-global]").after(ddm);
            $(".global-wb-dropdown").on("click", function() {
                $(this).prev('input').val( $(this).val() );
            });
            $(".global-wb-dropdown").each( function() {
                $(this).val( $(this).prev('input').val() );
            });
            
            // Hide values based on radio setting
            $("input[name^=write-back-to_]").on("click", function() {
                var [,a,b] = $(this).prop('name').split('____');
                switch( $(this).val() ) {
                    case 'var':
                        $(`select[name=write-back-variable____${a}____${b}]`).closest('tr').show();
                        $(`input[name=write-back-global____${a}____${b}]`).closest('tr').hide();
                        break;
                    case 'global':
                        $(`select[name=write-back-variable____${a}____${b}]`).closest('tr').hide();
                        $(`input[name=write-back-global____${a}____${b}]`).closest('tr').show();
                        break;
                    case 'both':
                        $(`select[name=write-back-variable____${a}____${b}]`).closest('tr').show();
                        $(`input[name=write-back-global____${a}____${b}]`).closest('tr').show();
                        break;
                }
            });
            
            // Default the radio value correctly
            $("input[name^=write-back-to_]").each( function(index) {
                if ( index % 3 != 0 )
                    return;
                if ( !$(this).is(":checked") && 
                     !$(this).siblings("input").first().is(":checked") &&
                     !$(this).siblings("input").last().is(":checked") )
                    $(this).click();
            });
            
            // Click all active buttons
            $("input[name^=write-back-to_]:checked").click();
        };
    });

    $modal.on('hide.bs.modal', function() {
        // Making sure we are overriding this modules's modal only.
        if ($(this).data('module') !== CTRItweaks.modulePrefix)
            return;

        if (typeof ExternalModules.Settings.prototype.resetConfigInstancesOld !== 'undefined')
            ExternalModules.Settings.prototype.resetConfigInstances = ExternalModules.Settings.prototype.resetConfigInstancesOld;

        $modal.removeClass('CTRItweaksConfig');
    });
});