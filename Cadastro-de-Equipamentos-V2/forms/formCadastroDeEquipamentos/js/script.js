$(document).ready(function(){
    bindings();

                $(".inputPA, .inputOutros, .inputMA").closest("div.inputGroup").hide();

});

function bindings(){
    $("#checkboxTemMaoDeObra").on("change", function(){
        if ($(this).is(":checked")) {
            $("#divValorMaoDeObra").show();
        }else{
            $("#divValorMaoDeObra").hide();
        }
    });

    $("#categoria").on("change", function () {
        var categoria = $(this).val();
        if (categoria == "") {
            $(".inputPA, .inputOutros, .inputMA").closest("div.inputGroup").hide();
        }
        if (categoria == "MA") {
            $(".inputPA, .inputOutros").closest("div.inputGroup").hide();
            $(".inputMA").closest("div.inputGroup").show();
        }
        if (categoria == "PA") {
            $(".inputMA, .inputOutros").closest("div.inputGroup").hide();
            $(".inputPA").closest("div.inputGroup").show();
        }
        if (categoria == "Outros") {
            $(".inputMA, .inputPA").closest("div.inputGroup").hide();
            $(".inputOutros").closest("div.inputGroup").show();
        }
    });
}