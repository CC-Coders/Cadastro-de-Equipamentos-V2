const ATIVIDADES = {
    INICIO:4,
    INICIO_0:0,
    CENTRAL_DE_EQUIPAMENTOS:5,
    QSST:8,
}
const pastaAnexosEquipamento = {
    PRODUCAO: "TODO",
    DESENVOLVIMENTO :29972
}
const env = getServerURL() == "http://fluig.castilho.com.br:1010" ? "PRODUCAO" : "DESENVOLVIMENTO"; 

$(document).ready(async function () {
    bindings();
    
    const atividadeAtual = $("#atividade").val();
    const formMode = $("#formMode").val();

    if (formMode=="ADD") {
        loadTelaInicio();
    }
    else if(atividadeAtual == ATIVIDADES.INICIO || atividadeAtual == ATIVIDADES.INICIO_0){
        loadTelaAjuste();
    }
    else if(atividadeAtual == ATIVIDADES.CENTRAL_DE_EQUIPAMENTOS){
        loadTelaCentralDeEquipamentos();
    }
    else if(atividadeAtual == ATIVIDADES.QSST){
        loadTelaQSST();
    }
});

async function loadTelaInicio(){
    preenchePermissoesDoUsuario();
    insereOptionsDosFornecedores();
    $(".inputPA, .inputOutros, .inputMA").closest("div.inputGroup").hide();
    modelos = await promiseBuscaModelosDeEquipamentosDoSisma();
    preencheOptionsDosModelos();
    $("#historico").hide();
    FLUIGC.calendar('#dataChegadaObra');
    $("#valorMobilizacao").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    $("#valorExtra").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    $("#valorLocacao").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    $("#valorMaoDeObra").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    $("#consumoMedio").maskMoney({ thousands: '', decimal: '.' });

}

async function loadTelaAjuste() {
    preenchePermissoesDoUsuario();
    insereOptionsDosFornecedores();
    asyncMontaHistorico();

    modelos = await promiseBuscaModelosDeEquipamentosDoSisma();
    preencheOptionsDosModelos();
    FLUIGC.calendar('#dataChegadaObra');
    $("#valorMobilizacao").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    $("#valorExtra").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    $("#valorLocacao").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    $("#valorMaoDeObra").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    $("#consumoMedio").maskMoney({ thousands: '', decimal: '.' });

    preencheObras($("#CODCOLIGADA").val());
    geraAnexos();
    geraTabelaCaracteristicasTecnicas();
    
    
        
        alteraCategoriaDaSolicitacao($("#categoria").val());
    

    if ($("#checkboxTemMaoDeObra").is(":checked")) {
        $("#divValorMaoDeObra").show();
    }
}

async function loadTelaCentralDeEquipamentos() {
    modelos = await promiseBuscaModelosDeEquipamentosDoSisma();
    preencheOptionsDosModelos();
    insereOptionsDosFornecedores();
    preenchePermissoesDoUsuario(true);
    asyncMontaHistorico();
    geraTabelaCaracteristicasTecnicas();
    alteraCategoriaDaSolicitacao($("#categoria").val());
    preencheObras($("#CODCOLIGADA").val());
    geraAnexos();
    $("#divOpcoesAprovacao").show();
    $("#divAnexar").hide();        
    FLUIGC.calendar('#dataChegadaObra');
    $("#valorMobilizacao").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    $("#valorExtra").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    $("#valorLocacao").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    $("#valorMaoDeObra").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    $("#consumoMedio").maskMoney({ thousands: '', decimal: '.' });

    if ($("#checkboxTemMaoDeObra").is(":checked")) {
        $("#divValorMaoDeObra").show();
    }
}

async function loadTelaQSST() {
    asyncMontaHistorico();
    geraAnexos();
    geraTabelaCaracteristicasTecnicas();
    modelos = await promiseBuscaModelosDeEquipamentosDoSisma();
    preencheOptionsDosModelos();
    alteraCategoriaDaSolicitacao($("#categoria").val());
    $("#divOpcoesAprovacao").show();
    $("#divAnexar").hide();
    bloqueiaCampos();
    if ($("#checkboxTemMaoDeObra").is(":checked")) {
        $("#divValorMaoDeObra").show();
    }
}


function bloqueiaCampos(){
    $("#coligada")[0].selectize.lock();
    $("#obra")[0].selectize.lock();
    $("#modelo")[0].selectize.lock();
    $("#descricaoEquipamento, #prefixo, #categoria, #AnoFabricacao, #AnoModelo, #placa, #chassi, #potenciaMotor, #tipoPotenciaMotor").attr("readonly", "readonly");
    $("#valorMobilizacao, #tipoValorMobilizacao, #valorExtra, #tipoValorExtra, #valorLocacao").attr("readonly", "readonly");
    $("#checkboxTemMaoDeObra").closest("div").attr("inert","inert");
    $("#checkboxTemMaoDeObra").attr("readonly","readonly");
    $("#valorMaoDeObra").attr("readonly","readonly");
    $("#dataChegadaObra").attr("readonly","readonly");
    $("#kmChegadaObra, #tipoKmChegadaObra, #tipoCombustivel, #litrosTanque,#consumoMedio,#tipoConsumoMedio").attr("readonly","readonly");
    $("#fornecedor")[0].selectize.lock();
}



function bindings() {
    $("#btnAnexarDocumentacao").on("click", anexarDocumento);
    $("#inputFile").on("change", function(){
        const files = $("#inputFile")[0].files;
        if (files.length == 0) {
            return;
        }

        for (const file of files) {
            loadFile(file);
        }
    });

    $("#checkboxTemMaoDeObra").on("change", function () {
        if ($(this).is(":checked")) {
            $("#divValorMaoDeObra").show();
        } else {
            $("#divValorMaoDeObra").hide();
        }
    });

    $("#categoria").on("change", function () {
        var categoria = $(this).val();
        alteraCategoriaDaSolicitacao(categoria);
    });

    $("#modelo").on("change", function () {
        preencheInformacoesDoModelo($(this).val());
    });

    $("#coligada").selectize({
        onChange: function(value){
            const [CODCOLIGADA, NOME] = value.split(" - ");
            preencheObras(CODCOLIGADA);
            $("#CODCOLIGADA").val(CODCOLIGADA);
        }
    });
    $("#obra").selectize({
        onChange: function(value){
            const [CODCCUSTO, NOME] = value.split(" - ");
            $("#CODCCUSTO").val(CODCCUSTO);
        }
    });

    $("#fornecedor").selectize({
        onChange: async function(value){
            try {
                if (value == "") {
                    throw "";
                }
                
                const [CODCFO, CGCCFO] = value.split(" - ");
                var dadosFornecedor = await buscaEnderecoFornecedor(CGCCFO);
                $("#CGCCFO").val(CGCCFO);
                $("#enderecoFornecedor").val(dadosFornecedor.RUA);
                $("#cidadeFornecedor").val(dadosFornecedor.CIDADE);
                $("#numeroFornecedor").val(dadosFornecedor.NUMERO);
                $("#cepFornecedor").val(dadosFornecedor.CEP);
                $("#estadoFornecedor").val(dadosFornecedor.CODETD);
                $("#bairroFornecedor").val(dadosFornecedor.BAIRRO);
            } catch (e) {
                $("#CGCCFO").val("");
                $("#enderecoFornecedor").val("");
                $("#cidadeFornecedor").val("");
                $("#numeroFornecedor").val("");
                $("#cepFornecedor").val("");
                $("#estadoFornecedor").val("");
                $("#bairroFornecedor").val("");
            }
        }
    });

    $("#prefixo").mask("AA00.000",{
        onKeyPress:function(){
            $("#prefixo").val($("#prefixo").val().toUpperCase());
        }
    });
    $("#placa").mask("AAAAAAA", {
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

    
    $("#potenciaMotor").mask("0#");
    $("#litrosTanque").mask("0#");

    $("#btnAprovar").on("click", function () {
        if ($("#atividade").val() == ATIVIDADES.CENTRAL_DE_EQUIPAMENTOS) {
            $("#decisaoCentral").val("Aprovado");
        }
        else if ($("#atividade").val() == ATIVIDADES.QSST) {
            $("#decisaoSeguranca").val("Aprovado");
        }
        
        parent.$("#send-process-button").click();

    });
    $("#btnReprovar").on("click", function () {
        if ($("#atividade").val() == ATIVIDADES.CENTRAL_DE_EQUIPAMENTOS) {
            $("#decisaoCentral").val("Reprovado");
        }
        else if ($("#atividade").val() == ATIVIDADES.QSST) {
            $("#decisaoSeguranca").val("Reprovado");
        }
        parent.$("#send-process-button").click();
    });

}

var beforeSendValidate = function(){
    var json = [];
    $("#tableCaracteristicasTecnicas>tbody>tr").each(function(){
        var TIPOCARAC = $(this).find(".TIPOCARAC").val();
        var CODICATC = $(this).find(".CODICATC").val();
        var VALOR_PADRAO = $(this).find(".VALOR_PADRAO").val();
        var VALOR = $(this).find(".VALOR").val();
        var DESCRICAO = $(this).find(".DESCRICAO").val();
        var SIGLA = $(this).find(".SIGLA").val();

        json.push({TIPOCARAC,CODICATC,VALOR_PADRAO, VALOR, DESCRICAO, SIGLA});
    });
    $("#JSONCARACTERISTICASTECNICAS").val(JSON.stringify(json));

    var valida = validateForm();
    if (valida.length > 0) {
        throw `Necessário verificar os campos abaixo: <br> <ul>${valida.map(e=>`<li>${e}</li>`).join("")}</ul>`;
    }

    function validateForm(){
        var errorMessage = [];

        //Identificação
        if (!$("#coligada").val()) {
            errorMessage.push("Selecione a Coligada");
        }
        if (!$("#obra").val()) {
            errorMessage.push("Selecione a Coligada");
        }
        if (!$("#descricaoEquipamento").val()) {
            errorMessage.push("Informe a Descrição do Equipamento");
        }
        if (!$("#prefixo").val()) {
            errorMessage.push("Informe o Prefixo");
        }
       
        // Detalhes
        if (!$("#categoria").val()) {
            errorMessage.push("Selecione a Categoria");
        }
        if (!$("#modelo").val()) {
            errorMessage.push("Selecione o Modelo");
        }
        if (!$("#AnoFabricacao").val()) {
            errorMessage.push("Informe o Ano de Fabricacao");
        }
        if (!$("#AnoModelo").val()) {
            errorMessage.push("Informe o Ano do Modelo");
        }
        if (!$("#placa").val()) {
            errorMessage.push("Informe a Placa");
        }
        if (!$("#chassi").val()) {
            errorMessage.push("Informe o Chassi");
        }
        if (!$("#potenciaMotor").val()) {
            errorMessage.push("Informe a Potência do Motor");
        }
        if (!$("#tipoPotenciaMotor").val()) {
            errorMessage.push("Informe o Tipo da Potência do Motor");
        }
        if (!$("#tipoPotenciaMotor").val()) {
            errorMessage.push("Informe o Tipo da Potência do Motor");
        }
        
        if (!$("#valorLocacao").val()) {
            errorMessage.push("Informe o Valor da Locação");
        }
        if ($("#checkboxTemMaoDeObra").is(":checked") && !$("#valorMaoDeObra").val()) {
            errorMessage.push("Informe o Valor da Mão de Obra");
        }
        

        $("#tableCaracteristicasTecnicas>tbody>tr").each(function(){
            if(!$(this).find(".VALOR").val()){
                errorMessage.push(`Informe o Valor da ${$(this).find(".DESCRICAO").val()}`);
            }
        });

        // Operacional
        if (!$("#dataChegadaObra").val()) {
            errorMessage.push("Informe a Data de Chegada na Obra");
        }
        if (!$("#kmChegadaObra").val()) {
            errorMessage.push("Informe a km/horas de Chegada na Obra");
        }
        if (!$("#tipoCombustivel").val()) {
            errorMessage.push("Informe o Tipo de combustível");
        }
        if (!$("#litrosTanque").val()) {
            errorMessage.push("Informe a Capacidade do Tanque");
        }
        if (!$("#consumoMedio").val()) {
            errorMessage.push("Informe o Consumo Médio");
        }
        
        // Fornecedor e Anexo
        if (!$("#fornecedor").val()) {
            errorMessage.push("Selecione o Fornecedor");
        }

        if($("#anexosDocumentosEquipamento").val() == ""){
            errorMessage.push("Anexe a Documentação do Equipamento");
        }
        if($("#anexosFotosEquipamentos").val() == ""){
            errorMessage.push("Anexe a Foto do Equipamento");
        }
        if($("#anexosLaudoTecnico").val() == ""){
            errorMessage.push("Anexe o Laudo Técnico");
        }
        if($("#anexpsPlanoManutencao").val() == ""){
            errorMessage.push("Anexe o Plano de Manutenção");
        }
        if($("#anexosART").val() == ""){
            errorMessage.push("Anexe a ART");
        }

        return errorMessage;
    }
}