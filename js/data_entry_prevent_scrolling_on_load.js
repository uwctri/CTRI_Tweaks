(() => {
    let a = $("#questiontable").find("input:visible, select:visible").not('.hiddenradio').not("tr[id$=__-tr] input, tr[id$=__-tr] select");
    if (a.length != 0)
        a.get(0).focus({ preventScroll: true });
    else {
        console.log("Scroll on this page is only vissible to those that can lock records.");
    }
})();