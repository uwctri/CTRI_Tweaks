$(document).ready(() => {
    // Don't load if older EM is enabeld
    if (typeof CTRIpayments === "object") return;
    const module = ExternalModules.UWMadison.CTRItweaks

    const waitForLoad = () => {
        if ($("#report_table thead").length == 0 ||
            !$.fn.DataTable.isDataTable("#report_table")) { // Still Loading
            window.requestAnimationFrame(waitForLoad);
            return;
        }

        // Print Button
        const printBtn = `
        <div style='margin-top:10px;'>
            <button id="printCheckButton" class="report_btn jqbuttonmed ui-button ui-corner-all ui-widget" style="font-size:12px;">
                <i class="fas fa-print fs10"></i> Print Checks
            </button>
        </div>`
        $("#report_div .d-print-none").eq(1).append(printBtn);

        // Mark as Printed Button
        const markBtn = `
        <div style='margin-top:10px;'>
            <button id="openCheckModal" class="report_btn jqbuttonmed ui-button ui-corner-all ui-widget" style="font-size:12px;">
                <i class="fas fa-pencil-alt fs10"></i> Mark all as printed
            </button>
        </div>`;
        $("#report_div .d-print-none").eq(1).append(markBtn);
    };

    const printChecks = () => {
        const recordList = $(".rl:visible").map(function () {
            return $(this).text();
        }).toArray();

        const cashIndex = $("#report_table th:contains(check_amt)").index();
        const memoIndex = $("#report_table th:contains(check_activity)").index();

        let master = module.makePrintObject();
        $.each(module.paymentData, function (record, data) {
            if (!recordList.includes(record)) return;
            const memo = $(`#report_table td:contains(${record}):visible`).closest('tr').find('td').eq(memoIndex).text();
            const cash = $(`#report_table td:contains(${record}):visible`).closest('tr').find('td').eq(cashIndex).text();
            const addr = module.makeAddressObject(data['street1'], data['street2'], data['city'], data['state'], data['zip']);
            master.content.push(...module.makePageObject(data['name'], module.study, memo, cash, addr, module.studyAddr));
            master.content.push({ pageBreak: 'after', text: '' });
        });

        master.content.pop(); // Remove extra page break
        pdfMake.createPdf(master).open();
    }

    const gatherDataforPost = (checkNumber) => {
        let instanceIndex = $("#report_table th:contains('redcap_repeat_instance')").index();
        let data = {
            'report': Number(getParameterByName('report_id')),
            'write': []
        };
        $(".rl:visible").each(function (_, el) {
            let row = $(el).closest('tr').find('td');
            data['write'].push({
                'record': $(el).text(),
                'instance': row.eq(instanceIndex).text(),
                'check': checkNumber++
            });
        });
        return data;
    }

    const openModal = () => {

        // Check if anything exists
        if ($("#report_table tr:contains(No results were returned)").length ||
            $("#report_table tr:contains(No matching records found)").length ||
            $("#report_table tbody tr:visible").length == 0) {
            Swal.fire({
                icon: 'info',
                iconHtml: "<i class='fas fa-database'></i>",
                title: "No Records",
                html: "Nothin' to do boss",
            });
            return;
        }

        // Check if already printed
        if (module.bulkPrintDone) {
            Swal.fire({
                icon: 'info',
                iconHtml: "<i class='fas fa-database'></i>",
                title: "Already Written",
                html: "You've already flaged these checks as printed." +
                    "Please refresh the page before writing again.",
            });
            return;
        }

        // Open the real modal
        const modal = `
        You are about to mark <b>all</b> checks visible on this report as printed. 
        The check issue date will be updated to today in Redcap and the check numbers will be logged starting at the number below.`;

        const footer = `
        <span><b>Reminder:</b> The recommended check number above may be incorrect if a check has been skipped, individually printed, or issued outside of Redcap.</span>`;

        const seed = Number(module.seed)
        Swal.fire({
            icon: 'question',
            title: 'Are you sure?',
            html: modal,
            input: 'number',
            inputPlaceholder: seed + 1,
            footer: footer,
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Flag as Printed'
        }).then(function (result) {
            const checkNumber = result.value || (seed + 1);
            module.ajax("bulk_payment", gatherDataforPost(checkNumber)).then((response) => {
                console.log(response);
                module.bulkPrintDone = true;
                Swal.fire({
                    icon: 'success',
                    title: 'Write Back Complete',
                    text: 'All data was successfully written back to the database',
                })
            }).catch((err) => {
                console.log(err);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'There was an issue writing back to the database.\
                         If possible, leave this window open and contact a RedCap Administrator',
                })
            });
        })
    }

    $(document).on('click', '#openCheckModal', openModal);
    $(document).on('click', '#printCheckButton', printChecks);
    waitForLoad();
});