var ATIVIDADES = {
    INICIO:4,
    INICIO_0:0,
    CENTRAL_DE_EQUIPAMENTOS:5,
    QSST:8,
}

function beforeTaskSave(colleagueId, nextSequenceId, userList) {
    try {
        var ATIVIDADE = getValue("WKNumState");

        if (ATIVIDADE == ATIVIDADES.INICIO || ATIVIDADE == ATIVIDADES.INICIO_0) {
            var WKNumProces = getValue("WKNumProces");
            hAPI.setCardValue("NUMPROCES", WKNumProces);

            insereHistorico(hAPI.getCardValue("observacoes"), "Inicio", "Inicio");      
        } else if (ATIVIDADE == ATIVIDADES.CENTRAL_DE_EQUIPAMENTOS) {
            insereHistorico(hAPI.getCardValue("observacoes"), hAPI.getCardValue("decisao"), "Central de Equipamentos");
        }
        else if (ATIVIDADE == ATIVIDADES.QSST) {
            insereHistorico(hAPI.getCardValue("observacoes"), hAPI.getCardValue("decisao"), "QSST");
        }


    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(typeof error === "string" ? error : JSON.stringify(error));
        }
    }
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

function insereHistorico(observacao, acao, atividade) {
    var USER = getValue("WKUser");
    var DATA = getDateTimeNow();

    if (atividade == "Fim") {
        USER = "Fluig";
    }

    var novaLinha = new java.util.HashMap();
    novaLinha.put("tableHistoricoUsuario", USER);
    novaLinha.put("tableHistoricoData", DATA);
    novaLinha.put("tableHistoricoAtividade", atividade);
    novaLinha.put("tableHistoricoObservacao", observacao);
    novaLinha.put("tableHistoricoAcao", acao);

    hAPI.addCardChild("tableHistorico", novaLinha);
    hAPI.setCardValue("observacao", "");
}
function getDateTimeNow() {
    var date = new Date();
    var dia = date.getDate();
    if (dia < 10) {
        dia = "0" + dia;
    }
    var mes = date.getMonth() + 1;
    if (mes < 10) {
        mes = "0" + mes;
    }

    var ano = date.getFullYear();

    var hora = date.getHours();
    if (hora < 10) {
        hora = "0" + hora;
    }

    var minutos = date.getMinutes();
    if (minutos < 10) {
        minutos = "0" + minutos;
    }

    var dateTime = [ano, mes, dia].join("-") + " " + hora + ":" + minutos;
    return dateTime
}