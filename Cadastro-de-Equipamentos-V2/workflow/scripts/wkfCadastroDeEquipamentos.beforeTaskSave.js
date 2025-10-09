var ATIVIDADES = {
    INICIO_0 : 0,
    INICIO : 4,
    CENTRAL_EQUIPAMENTOS : 5,
    QSST : 8,
}

function beforeTaskSave(colleagueId, nextSequenceId, userList) {
    try {
        var ATIVIDADE = getValue("WKNumState");

        if (ATIVIDADE == ATIVIDADES.INICIO || ATIVIDADE == ATIVIDADES.INICIO_0) {
            var WKNumProces = getValue("WKNumProces");
            hAPI.setCardValue("NUMPROCES", WKNumProces);

            var isPAouMAouOutros = hAPI.getCardValue("categoria");
            if (isPAouMAouOutros == "PA" || isPAouMAouOutros == "MA") {
                cadastraEquipamentoNoSisma();
            }
        }


    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(typeof error === "string" ? error : JSON.stringify(error));
        }
    }
}

function cadastraEquipamentoNoSisma() {
    try {
        var isPAouMAouOutros = hAPI.getCardValue("categoria");
        var CGCCFO = hAPI.getCardValue("CGCCFO");

        var equipamento = getDadosEquipamento();

        var ds = DatasetFactory.getDataset("dsInsereEquipamentoSisma", null, [
            DatasetFactory.createConstraint("EQUIPAMENTO", JSON.stringify(equipamento), JSON.stringify(equipamento), ConstraintType.MUST),
            DatasetFactory.createConstraint("isPAouMA", isPAouMAouOutros, isPAouMAouOutros, ConstraintType.MUST),
            DatasetFactory.createConstraint("CGCCFO", CGCCFO, CGCCFO, ConstraintType.MUST),
            DatasetFactory.createConstraint("NUMPROCESS", getValue("WKNumProces"), getValue("WKNumProces"), ConstraintType.MUST),
        ], null);

        if (ds.getValue(0, "STATUS") != "SUCCESS") {
            throw new Error(ds.getValue(0, "MENSAGEM"));
        }

        return true;
    } catch (error) {
   if (error instanceof Error) {
        throw error;
    } else {
        throw new Error(typeof error === "string" ? error : JSON.stringify(error));
    }    }
}

function getDadosEquipamento() {
    var CODCOLIGADA = hAPI.getCardValue("CODCOLIGADA");
    var CODCCUSTO = hAPI.getCardValue("CODCCUSTO");
    var PREFIXO = hAPI.getCardValue("prefixo");
    var IDMODE = hAPI.getCardValue("IDMODE");
    var CODICLME = hAPI.getCardValue("CODICLME");
    var IDCLOP = hAPI.getCardValue("IDCLOP");
    var CODIFABR = hAPI.getCardValue("CODIFABR");
    var CODIESPE = hAPI.getCardValue("CODIESPE");
    
    var ANOFABRI = hAPI.getCardValue("AnoFabricacao");
    var ANOMODELO = hAPI.getCardValue("AnoModelo");
    var NUMECHAS = hAPI.getCardValue("chassi");
    var PLACA = hAPI.getCardValue("placa");
    var ALUGUEL_CONTRATO = moneyToFloat(hAPI.getCardValue("valorLocacao"));
    
    var DESCRICAO = hAPI.getCardValue("descricaoEquipamento");
    
    var POTENCIAHP_UNID = hAPI.getCardValue("tipoPotenciaMotor");
    var POTENCIAHP = hAPI.getCardValue("potenciaMotor");

    var DATACHEGADA = hAPI.getCardValue("dataChegadaObra").split("/").reverse().join("");


    var VALOR_MOBILIZADO = moneyToFloat(hAPI.getCardValue("valorMobilizacao"));
    var TIPO_VALOR_MOBILIZADO =hAPI.getCardValue("tipoValorMobilizacao");
    
    var VALOR_EXTRA = moneyToFloat(hAPI.getCardValue("valorExtra"));
    var TIPO_VALOR_EXTRA =hAPI.getCardValue("tipoValorExtra");
    
    var VALOR_MAODEOBRA = moneyToFloat(hAPI.getCardValue("valorMaoDeObra"));


    var tipoKmChegadaObra = hAPI.getCardValue("tipoKmChegadaObra");
    var valorChegadaObra = hAPI.getCardValue("kmChegadaObra").replace(".","");

    var INI_HODOMETRO = tipoKmChegadaObra == "KM" ? valorChegadaObra : "";
    var INI_HORIMETRO = tipoKmChegadaObra == "Horas" ? valorChegadaObra : "";

    var tipoCombustivel = hAPI.getCardValue("tipoCombustivel");


    var tipoConsumoMedio = hAPI.getCardValue("tipoConsumoMedio");
    var consumoMedio = hAPI.getCardValue("consumoMedio");

    var CONSUMO_KM = tipoConsumoMedio == "km/L" ? consumoMedio : "";
    var CONSUMO_HORA = tipoConsumoMedio == "L/H" ? consumoMedio : "";

    var CAPATANQ_ABAST = hAPI.getCardValue("litrosTanque");
    
    var CODIUNID_CAPACIDADE_COMBUSTIVEL = tipoConsumoMedio == "km/L" ? 5:6;
    
    
    var ANEXOS_DOCUMENTACAO = hAPI.getCardValue("anexosDocumentosEquipamento");
    var ANEXOS_FOTOS = hAPI.getCardValue("anexosFotosEquipamentos");
    var ANEXOS_LAUDO = hAPI.getCardValue("anexosLaudoTecnico");
    var ANEXOS_PLANO_MANUTENCAO = hAPI.getCardValue("anexpsPlanoManutencao");
    var ANEXOS_ART = hAPI.getCardValue("anexosART");


    return {
        "CODCOLIGADA": CODCOLIGADA,
        "CODCCUSTO": CODCCUSTO,
        "PREFIXO": PREFIXO,
        "IDMODE": IDMODE,
        "CODICLME": CODICLME,
        "IDCLOP": IDCLOP,
        "CODIFABR": CODIFABR,
        "CODIESPE": CODIESPE,
        "ANOFABRI": ANOFABRI,
        "ANOMODELO": ANOMODELO,
        "NUMECHAS": NUMECHAS,
        "PLACA":PLACA,
        "ALUGUEL_CONTRATO": ALUGUEL_CONTRATO,
        "DESCRICAO": DESCRICAO,
        "POTENCIAHP_UNID": POTENCIAHP_UNID,
        "POTENCIAHP": POTENCIAHP,
        "DATACHEGADA":DATACHEGADA,

        "VALOR_MOBILIZADO":VALOR_MOBILIZADO,
        "TIPO_VALOR_MOBILIZADO":TIPO_VALOR_MOBILIZADO,

        "VALOR_EXTRA":VALOR_EXTRA,
        "TIPO_VALOR_EXTRA":TIPO_VALOR_EXTRA,

        "VALOR_MAODEOBRA":VALOR_MAODEOBRA,

        INI_HODOMETRO:INI_HODOMETRO,
        INI_HORIMETRO:INI_HORIMETRO,
        CODIMATE_COMBUSTIVEL:tipoCombustivel,

        CONSUMO_HORA:CONSUMO_HORA,
        CONSUMO_KM:CONSUMO_KM,

        CAPATANQ_ABAST:CAPATANQ_ABAST,
        CODIUNID_CAPACIDADE_COMBUSTIVEL:CODIUNID_CAPACIDADE_COMBUSTIVEL,

        ANEXOS_DOCUMENTACAO:ANEXOS_DOCUMENTACAO,
        ANEXOS_FOTOS:ANEXOS_FOTOS,
        ANEXOS_LAUDO:ANEXOS_LAUDO,
        ANEXOS_PLANO_MANUTENCAO:ANEXOS_PLANO_MANUTENCAO,
        ANEXOS_ART:ANEXOS_ART,



    };

}


// Utils
function FormataValorParaMoeda(valor) {
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
}
function moneyToFloat(val) {
    if (val.indexOf("R$") > -1) {
        val = val.replace("R$", "");
        val = val.trim();
    }

    val = val.replace(".", "");
    val = val.replace(",", ".");
    val = parseFloat(val);
    if (isNaN(val)) {
        return 0;
    }
    return val;
}