$(document).ready(function () {
    if ( $("select[name$='_complete']").val()==="2" ) {
        $("#questiontable").css("pointer-events","none");
        $("#questiontable").before(`
        <div class="alert alert-danger" id="alertLockMsg" style="text-align:center" role="alert">
            <i class="fas fa-lock"></i>&nbsp;This record is marked as complete, verify that this is the correct record and instrument before making changes.
            <br>
            <a id="alertUnlock" href="#">
                <i class="fas fa-lock-open"></i>&nbsp;<b>Click here to unlock</b>
            </a>
        </div>`)
        $("#alertUnlock").on("click",function() {
            $("#questiontable").css("pointer-events","");
            $("#alertLockMsg").remove();
        });
    }
});