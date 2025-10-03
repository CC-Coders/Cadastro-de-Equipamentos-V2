const ATIVIDADES = {
    INICIO:4,
    INICIO_0:0,
    CENTRAL_DE_EQUIPAMENTOS:5,
    QSST:8,
}

$(document).ready(async function () {
    bindings();

    const atividadeAtual = $("#atividade").val();
    const formMode = $("#formMode").val();

    if (formMode=="ADD" || atividadeAtual == INICIO || atividadeAtual == INICIO_0) {
        loadTelaInicio();
    }
});

async function loadTelaInicio(){
    $(".inputPA, .inputOutros, .inputMA").closest("div.inputGroup").hide();
    modelos = await promiseBuscaModelosDeEquipamentosDoSisma();
    preencheOptionsDosModelos();
    preenchePermissoesDoUsuario();
    insereOptionsDosFornecedores();
}




function bindings() {
    $("#checkboxTemMaoDeObra").on("change", function () {
        if ($(this).is(":checked")) {
            $("#divValorMaoDeObra").show();
        } else {
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

    $("#modelo").on("change", function () {
        preencheInformacoesDoModelo($(this).val());
    });

    $("#coligada").selectize({
        onChange: function(value){
            const [CODCOLIGADA, NOME] = value.split(" - ");
            preencheObras(CODCOLIGADA);
        }
    });
    $("#obra").selectize();

    $("#fornecedor").selectize({
        onChange: async function(value){
            const [CODCFO, CGCCFO] = value.split(" - ");
            var dadosFornecedor = await buscaEnderecoFornecedor(CGCCFO);
            $("#enderecoFornecedor").val(dadosFornecedor.RUA);
            $("#cidadeFornecedor").val(dadosFornecedor.CIDADE);
            $("#numeroFornecedor").val(dadosFornecedor.NUMERO);
            $("#cepFornecedor").val(dadosFornecedor.CEP);
            $("#estadoFornecedor").val(dadosFornecedor.CODETD);
            $("#bairroFornecedor").val(dadosFornecedor.BAIRRO);
        }
    });

    $("#prefixo").mask("AA00.000",{
        onKeyPress:function(){
            $("#prefixo").val($("#prefixo").val().toUpperCase());
        }
    });
    $("#placa").mask("AAA-AAAA", {
        onKeyPress:function(){
            $("#placa").val($("#placa").val().toUpperCase());
        }
    });
    $("#chassi").mask("A", {
         translation: {
            'A': { pattern: /[A-Za-z0-9]/, recursive: true }
        },
        onKeyPress:function(){
            $("#chassi").val($("#chassi").val().toUpperCase());
        }
    });


    $("#AnoFabricacao").mask("9999");
    $("#AnoModelo").mask("9999");

    $("#valorMobilizacao").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    $("#valorExtra").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    $("#valorLocacao").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    $("#valorMaoDeObra").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    
    $("#potenciaMotor").mask("0#");
    $("#litrosTanque").mask("0#");
    $("#consumoMedio").maskMoney({ thousands: '.', decimal: ',', suffix: 'km/l' });

    FLUIGC.calendar('#dataChegadaObra');
}