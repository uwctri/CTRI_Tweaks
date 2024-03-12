$(document).ready(() => {
    // Don't load if older EM is enabeld
    if (typeof CTRIpayments === "object") return;

    $('head').append(`
        <style>
        .printCheckButton {
            float: right;
            margin-right: 30px;
            line-height: 20px;
            font-size: 13px;
        }
        </style>
    `);

    $(document).on('click', '.printCheckButton', () => {
        let missing = Object.filter(CTRItweaks.paymentData, x => x == "");
        delete missing['street2'];
        if (Object.keys(missing).length) {
            Swal.fire({
                icon: 'error',
                title: 'Missing Information',
                text: 'Missing mandatory elements to print a check: ' + Object.keys(missing).join(', ')
            });
            return;
        }
        const memo = $("[name=check_activity]").val();
        const cash = $("[name=check_amt]").val() || '00.00';
        const t = CTRItweaks.paymentData;
        const addr = CTRItweaks.makeAddressObject(t.street1, t.street2, t.city, t.state, t.zip, true);
        let print = CTRItweaks.makePrintObject();
        print.content.push(...CTRItweaks.makePageObject(t.name, CTRItweaks.study, memo, cash, addr, CTRItweaks.studyAddr, CTRItweaks.showLogo, CTRItweaks.showVoid));
        pdfMake.createPdf(print).open();
    });

    $(".printCheckButton").prop('disabled', false);
});