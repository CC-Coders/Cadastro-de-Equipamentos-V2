const ATIVIDADES = {
    INICIO:4,
    INICIO_0:0,
    CENTRAL_DE_EQUIPAMENTOS:5,
    QSST:8,
    FIM: 15
}
const pastaAnexosEquipamento = {
    PRODUCAO: "2068836",
    HOMOLOGACAO :10540,
    DESENVOLVIMENTO :29972
}
const env = getServerURL() == "http://fluig.castilho.com.br:1010" ? "PRODUCAO" : "DESENVOLVIMENTO"; 

$(document).ready(async function () {
    
    const atividadeAtual = $("#atividade").val();
    const formMode = $("#formMode").val();

    if (formMode=="ADD") {
        bindings();
        loadTelaInicio();
    }
    else if (formMode == "VIEW") {
        loadTelaVIEW();
        if (atividadeAtual == ATIVIDADES.CENTRAL_DE_EQUIPAMENTOS || atividadeAtual == ATIVIDADES.QSST) {
            setAtividadeAtivaProgresso(1);
        }else if(atividadeAtual == ATIVIDADES.FIM){
            setAtividadeAtivaProgresso(2);
        }
    }
    else if(atividadeAtual == ATIVIDADES.INICIO || atividadeAtual == ATIVIDADES.INICIO_0){
        bindings();
        loadTelaAjuste();
    }
    else if(atividadeAtual == ATIVIDADES.CENTRAL_DE_EQUIPAMENTOS){
        bindings();
        setAtividadeAtivaProgresso(1);
        loadTelaCentralDeEquipamentos();
    }
    else if(atividadeAtual == ATIVIDADES.QSST){
        bindings();
        setAtividadeAtivaProgresso(1);
        loadTelaQSST();
    }
});

async function loadTelaInicio(){
    if ($("#userCode").val() == "FlavioHerculano") {
        preenchePermissoesDoUsuario(true);

    } else if ($("#userCode").val() == "roney.tomm" || $("#userCode").val() == "clerivan.falcao") { 
        preenchePermissoesDoUsuario(true);

    } else {
        preenchePermissoesDoUsuario();
    }

    insereOptionsDosFornecedores();
    $(".inputPA, .inputOutros, .inputMA").closest("div.inputGroup").hide();
    modelos = $("#categoria").val() ? await promiseBuscaModelosDeEquipamentosDoSisma($("#categoria").val()) : [];
    preencheOptionsDosModelos();
    $("#historico").hide();
    FLUIGC.calendar('#dataChegadaObra');
    FLUIGC.calendar('#dataVencimentoAnexo');
    $("#valorDesmobilizacao").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
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
    $("#tipoAnexo").val("");
    ajusta_reordenaColunasCategoriaPA();
    modelos = $("#categoria").val() ? await promiseBuscaModelosDeEquipamentosDoSisma($("#categoria").val()) : [];
    preencheOptionsDosModelos();
    FLUIGC.calendar('#dataChegadaObra');
    FLUIGC.calendar('#dataVencimentoAnexo');

    $("#valorDesmobilizacao").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    $("#valorMobilizacao").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    $("#valorExtra").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    $("#valorLocacao").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    $("#valorMaoDeObra").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    $("#consumoMedio").maskMoney({ thousands: '', decimal: '.' });

    $("#smallDataValidadeLaudo").text("Valido até: " + $("#dataVencimentoART").val());
    $("#smallDataValidadeART").text("Valido até: " + $("#dataVencimentoLaudo").val());

    preencheObras($("#CODCOLIGADA").val());
    geraAnexos();
    geraTabelaCaracteristicasTecnicas();    
    alteraCategoriaDaSolicitacao();
    
    if ($("#checkboxTemMaoDeObra").is(":checked")) {
        $("#divValorMaoDeObra").show();
    }
}
async function loadTelaCentralDeEquipamentos() {
    ajusta_reordenaColunasCategoriaPA();
    modelos = await promiseBuscaModelosDeEquipamentosDoSisma($("#categoria").val());
    preencheOptionsDosModelos();
    insereOptionsDosFornecedores();
    preenchePermissoesDoUsuario(true);
    asyncMontaHistorico();
    geraTabelaCaracteristicasTecnicas();
    alteraCategoriaDaSolicitacao();
    preencheObras($("#CODCOLIGADA").val());
    geraAnexos();
    $("#divOpcoesAprovacao").show();
    $("#divAnexar").hide();        
    FLUIGC.calendar('#dataChegadaObra');
    $("#valorDesmobilizacao").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    $("#valorMobilizacao").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    $("#valorExtra").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    $("#valorLocacao").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    $("#valorMaoDeObra").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });
    $("#consumoMedio").maskMoney({ thousands: '', decimal: '.' });

    $("#dataVencimentoART").attr("readonly","readonly");
    $("#dataVencimentoLaudo").attr("readonly","readonly");

    $("#smallDataValidadeLaudo").text("Valido até: " + $("#dataVencimentoART").val());
    $("#smallDataValidadeART").text("Valido até: " + $("#dataVencimentoLaudo").val());

    if ($("#checkboxTemMaoDeObra").is(":checked")) {
        $("#divValorMaoDeObra").show();
    }
}
async function loadTelaQSST() {
    asyncMontaHistorico();
    geraAnexos();
    ajusta_reordenaColunasCategoriaPA();
    geraTabelaCaracteristicasTecnicas();
    modelos = await promiseBuscaModelosDeEquipamentosDoSisma($("#categoria").val());
    preencheOptionsDosModelos();
    alteraCategoriaDaSolicitacao();
    $("#divOpcoesAprovacao").show();
    $("#divAnexar").hide();
    bloqueiaCampos();

    $("#smallDataValidadeLaudo").text("Valido até: " + $("#dataVencimentoART").val());
    $("#smallDataValidadeART").text("Valido até: " + $("#dataVencimentoLaudo").val());
    if ($("#checkboxTemMaoDeObra").is(":checked")) {
        $("#divValorMaoDeObra").show();
    }
}
async function loadTelaVIEW() {
    asyncMontaHistorico();
    geraAnexos();
    ajusta_reordenaColunasCategoriaPA();
    geraTabelaCaracteristicasTecnicas();
    alteraCategoriaDaSolicitacao();

    $("#coligada, #obra, #modelo, #classOperacional, #fornecedor").addClass("form-control");

    if ($("#checkboxTemMaoDeObra").is(":checked")) {
        $("#divValorMaoDeObra").show();
    }

    $("#smallDataValidadeLaudo").text("Valido até: " + $("#dataVencimentoART").val());
    $("#smallDataValidadeART").text("Valido até: " + $("#dataVencimentoLaudo").val());
}


function bloqueiaCampos(){
    $("#coligada")[0].selectize.lock();
    $("#obra")[0].selectize.lock();
    $("#classOperacional")[0].selectize.lock();
    $("#modelo")[0].selectize.lock();
    $("#descricaoEquipamento, #prefixo, #categoria, #autopropelido, #AnoFabricacao, #AnoModelo, #placa, #chassi, #potenciaMotor, #tipoPotenciaMotor").attr("readonly", "readonly");
    $("#valorMobilizacao, #tipoValorMobilizacao, #valorDesmobilizacao, #tipoValorDesmobilizacao, #valorExtra, #tipoValorExtra, #valorLocacao").attr("readonly", "readonly");
    $("#checkboxTemMaoDeObra").closest("div").attr("inert","inert");
    $("#checkboxTemMaoDeObra").attr("readonly","readonly");
    $("#valorMaoDeObra").attr("readonly","readonly");
    $("#dataChegadaObra").attr("readonly","readonly");
    $("#kmChegadaObra, #tipoKmChegadaObra, #tipoCombustivel, #litrosTanque,#consumoMedio,#tipoConsumoMedio").attr("readonly","readonly");
    $("#fornecedor")[0].selectize.lock();

    $("#dataVencimentoART").attr("readonly","readonly");
    $("#dataVencimentoLaudo").attr("readonly","readonly");
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
        $("#inputFile").val("");
    });

    $("#checkboxTemMaoDeObra").on("change", function () {
        if ($(this).is(":checked")) {
            $("#divValorMaoDeObra").show();
        } else {
            $("#divValorMaoDeObra").hide();
        }
    });

    $("#categoria").on("change", async function () {
        var categoria = $(this).val();

        // Limpa o campo a cada troca (change) de categoria
        $("#modelo").val("");
        $("#fabricante").val("");
        $("#classeMecanica").val("");
        $("#classOperacional").val("");

        alteraCategoriaDaSolicitacao();
        ajusta_reordenaColunasCategoriaPA();
        modelos = await promiseBuscaModelosDeEquipamentosDoSisma(categoria);
        preencheOptionsDosModelos();
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
                
                const [CODCFO, CGCCFO, NOMEFANTASIA] = value.split(" - ");
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
    $("#prefixo").on("change", function(){
        var isCadastrado = verificaSePrefixoCadastradoNoSisma($(this).val());
        if (isCadastrado) {
            FLUIGC.toast({title:"Prefixo já cadastrado.", message:"", type:"warning"});
            $(this).val("");
        }
    })
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

    $("#classOperacional").selectize({
        onChange: function(value) {
            if (!value) {
                $("#IDCLOP").val("");
                return;
            }

            const [ID_CLASSEOPERACIONAL] = value.split(" - ");
            $("#IDCLOP").val(ID_CLASSEOPERACIONAL);

            preencheModelosPorClasseOperacional(ID_CLASSEOPERACIONAL);
        }
    });

    $("#tipoAnexo").on("change", function(){
        if ($(this).val() == "Laudo Técnico" || $(this).val() == "ART") {
            $("#divDataVencimentoAnexo").show();
        }else{
            $("#divDataVencimentoAnexo").hide();
        }
    });

    $("#dataVencimentoAnexo").on("change", function(){
        var dataVencimento = $(this).val();

        if (dataVencimento) {
            dataVencimento = dataVencimento.split("/").reverse().join("-");

            // Calcula data limite para o vencimento dos Laudos, sendo no máximo 1 ano
            var [ano, mes, dia] = getDateNow().split("-");
            ano = parseInt(ano) + 1;//Adiciona um ano apartir de hoje
            var dataLimite = [ano, mes, dia].join("-");

            if (dataVencimento > dataLimite) {
                FLUIGC.toast({
                    "type":"warning",
                    "title":"A data de validade do Laudo não pode ser maior que 1 ano.",
                    "message":""
                });
                $(this).val("");
            }
        }
    });
    
    $("#dataChegadaObra").on("change", function(){
        var dataHoje = getDateNow();
        var val = $(this).val().split("/").reverse().join("-");

        var diff = calculaDiferencaEmMeses(dataHoje, val);
        console.log(diff)
        if (diff < -1) {
            FLUIGC.toast({
                type:"warning",
                title:"Não é permitido informar mais que um mês retroativo",
                message:"",
            });
            $(this).val("");
        }

    });

    $("#tipoKmChegadaObra").on("change", function () {
        var val = $(this).val();

        if (val == "KM") {
            $("#tipoConsumoMedio").val("km/L");

        // Caso contrário, será Horas
        } else  {
            $("#tipoConsumoMedio").val("L/H");
        }
    });

    // Preenche campo de Medidor (KM / Hora) do Diesel S-500
    $("#tipoConsumoMedio").on("change", function () {
        var val = $(this).val();

        // Preenche o campo de medidor do KM/Horas do Chegada na Obra, para todos serem um tipo de medidor só.
        if (val == "km/L") {
            $("#tipoKmChegadaObra").val("KM");

        } else {
            $("#tipoKmChegadaObra").val("Horas");
        }
    });

    $("#AnoFabricacao").mask("9999");
    $("#AnoModelo").mask("9999");
    $("#Quantidade").mask("99999");
    $("#kmChegadaObra").mask('000.000.000', {reverse:true});

    
    $("#potenciaMotor").mask("0#");
    $("#litrosTanque").mask("0#");

    // Change de Autopropelido
    $("#autopropelido").on("change", function () {
        alteraAutopropelidoDaSolicitacao();
    });

    $("#btnAprovar").on("click", function () {
        if ($("#atividade").val() == ATIVIDADES.CENTRAL_DE_EQUIPAMENTOS) {
            $("#decisaoCentral").val("Aprovado");
        }
        else if ($("#atividade").val() == ATIVIDADES.QSST) {
            $("#decisaoSeguranca").val("Aprovado");
        }
        
        $("#decisao").val("Aprovado");
        parent.$("#send-process-button").click();
    });
    $("#btnReprovar").on("click", function () {
        if ($("#atividade").val() == ATIVIDADES.CENTRAL_DE_EQUIPAMENTOS) {
            $("#decisaoCentral").val("Reprovado");
        }
        else if ($("#atividade").val() == ATIVIDADES.QSST) {
            $("#decisaoSeguranca").val("Reprovado");
        }
        $("#decisao").val("Reprovado");
        parent.$("#send-process-button").click();
    });

}

var beforeSendValidate = function () {
    const atividade = $("#atividade").val();
    if (atividade == ATIVIDADES.INICIO || atividade == ATIVIDADES.INICIO_0 || atividade == ATIVIDADES.CENTRAL_DE_EQUIPAMENTOS) {
        var valida = validateForm();
        if (valida.length > 0) {
            throw `Necessário verificar os campos abaixo: <br> <ul>${valida.map(e => `<li>${e}</li>`).join("")}</ul>`;
        }
        var json = [];
        $("#tableCaracteristicasTecnicas>tbody>tr").each(function () {
            var TIPOCARAC = $(this).find(".TIPOCARAC").val();
            var CODICATC = $(this).find(".CODICATC").val();
            var VALOR_PADRAO = $(this).find(".VALOR_PADRAO").val();
            var VALOR = $(this).find(".VALOR").val();
            var DESCRICAO = $(this).find(".DESCRICAO").val();
            var SIGLA = $(this).find(".SIGLA").val();
            var ITEM = $(this).find(".ITEM").val();

            json.push({ TIPOCARAC, CODICATC, VALOR_PADRAO, VALOR, DESCRICAO, SIGLA, ITEM });
        });
        $("#JSONCARACTERISTICASTECNICAS").val(JSON.stringify(json));
    }

    if (atividade == ATIVIDADES.CENTRAL_DE_EQUIPAMENTOS || atividade==ATIVIDADES.QSST) {
        if (!$("#decisao").val()) {
            throw "Necessário selecionar uma opção de aprovação na aba Histórico e Decisão";
        }
        if ($("#decisao").val() == "Reprovado" && $("#observacoes").val() == "") {
            throw "Necessário informar a Justificativa da Decisão no campo Observações";
        }
    }
    function validateForm() {
        var errorMessage = [];

        //Identificação
        if (!$("#coligada").val()) {
            errorMessage.push("Selecione a Coligada");
        }
        if (!$("#obra").val()) {
            errorMessage.push("Selecione a Obra");
        }
        if (!$("#descricaoEquipamento").val()) {
            errorMessage.push("Informe a Descrição do Equipamento");
        }
        if (!$("#prefixo").val() && $("#categoria").val() != "Outros") { // Não obriga/pede prefixo quando categoria "Outros"
            errorMessage.push("Informe o Prefixo");
        }

        // Detalhes
        if (!$("#categoria").val()) {
            errorMessage.push("Selecione a Categoria");
        }

        if ($("#categoria").val() != "Outros") {
            if (!$("#modelo").val()) {
                errorMessage.push("Selecione o Modelo");
            }
            if (!$("#AnoFabricacao").val()) {
                errorMessage.push("Informe o Ano de Fabricacao");
            }
            if (!$("#AnoModelo").val()) {
                errorMessage.push("Informe o Ano do Modelo");
            }
            if (!$("#placa").val() && !$("#chassi").val()) {
                errorMessage.push("Informe a Placa ou o Chassi");
            }
            if (!$("#potenciaMotor").val() && $("#categoria").val() != "PA") {
                errorMessage.push("Informe a Potência do Motor");
            }
            if (!$("#tipoPotenciaMotor").val() && $("#categoria").val() != "PA") {
                errorMessage.push("Informe o Tipo da Potência do Motor");
            }
            if (!$("#autopropelido").val() && $("#categoria").val() == "MA") {
                errorMessage.push("Informe o Autopropelido");
            }
        }
        else if ($("#categoria").val() == "Outros"){
            if (!$("#quantidade").val()) {
                errorMessage.push("Informe a Quantidade");
            }
        }



        if (!$("#valorLocacao").val()) {
            errorMessage.push("Informe o Valor da Locação");
        }
        if ($("#checkboxTemMaoDeObra").is(":checked") && !$("#valorMaoDeObra").val()) {
            errorMessage.push("Informe o Valor da Mão de Obra");
        }


        $("#tableCaracteristicasTecnicas>tbody>tr").each(function () {
            if (!$(this).find(".VALOR").val()) {
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

        if ($("#categoria").val() == "MA") {
            if (!$("#tipoCombustivel").val()) {
                errorMessage.push("Informe o Tipo de combustível");
            }

            // A Central de Equip não controla capacidade tanque quando PA
            if (!$("#litrosTanque").val() && $("#categoria").val() != "PA") {
                errorMessage.push("Informe a Capacidade do Tanque");
            }

            // A Central de Equip não controla consumo quando PA
            if (!$("#consumoMedio").val() && $("#categoria").val() != "PA") {
                errorMessage.push("Informe o Consumo Médio");
            }
        }

        // Fornecedor e Anexo
        if (!$("#fornecedor").val()) {
            errorMessage.push("Selecione o Fornecedor");
        }

        // Se estiver na atividade do Solicitante, INICIO / INICIO_0
        //
        // Ou estiver na atividade QSST e a decisão deles for "Aprovado"
        // Espeficficamente "Aprovado" pra não impedir de reprovar e voltar ao solicitante por falta de anexo.
        if (atividade == ATIVIDADES.INICIO || atividade == ATIVIDADES.INICIO_0 || (atividade == ATIVIDADES.QSST && $("#decisao").val() == "Aprovado")) {

            // A Central de Equip não pede anexo quando PA
            if ($("#categoria").val() != "Outros" && $("#categoria").val() != "PA") {
                if ($("#anexosDocumentosEquipamento").val() == "" && $("#autopropelido").val() == "NAO") {
                    errorMessage.push("Anexe a Documentação do Equipamento");
                }
                if ($("#anexosFotosEquipamentos").val() == "" && $("#autopropelido").val() == "SIM") {
                    errorMessage.push("Anexe a Foto do Equipamento");
                }
                if ($("#anexosLaudoTecnico").val() == "" && $("#autopropelido").val() == "NAO") {
                    errorMessage.push("Anexe o Laudo Técnico");
                }
                if ($("#anexpsPlanoManutencao").val() == "" && $("#autopropelido").val() == "NAO") {
                    errorMessage.push("Anexe o Plano de Manutenção");
                }
                if ($("#anexosART").val() == "" && $("#autopropelido").val() == "NAO") {
                    errorMessage.push("Anexe a ART");
                }
                if (!$("#dataVencimentoART").val() && $("#autopropelido").val() == "NAO") {
                    errorMessage.push("Informe a Data de Vencimento da ART");
                }   
                if (!$("#dataVencimentoLaudo").val() && $("#autopropelido").val() == "NAO") {
                    errorMessage.push("Informe a Data de Vencimento do Laudo Técnico");
                }
                
            } else {
                if ($("#anexosART").val() && !$("#dataVencimentoART").val()) {
                    errorMessage.push("Informe a Data de Vencimento da ART");
                }   
                if ($("#anexosLaudoTecnico").val() && !$("#dataVencimentoLaudo").val()) {
                    errorMessage.push("Informe a Data de Vencimento do Laudo Técnico");
                }
            }
        }

        return errorMessage;
    }
}
