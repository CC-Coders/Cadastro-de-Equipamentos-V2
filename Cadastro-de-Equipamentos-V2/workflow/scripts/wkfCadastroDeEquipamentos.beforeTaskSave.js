function beforeTaskSave(colleagueId, nextSequenceId, userList) {
    try {
        var isPAouMAouOutros = hAPI.getCardValue("categoria");

        if (isPAouMAouOutros == "PA" || isPAouMAouOutros == "MA") {
            cadastraEquipamentoNoSisma();
        }

    } catch (error) {
        throw error;
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
            DatasetFactory.createConstraint("CGCCFO", CGCCFO, CGCCFO
                , ConstraintType.MUST),
        ], null);

        if (ds.getValue(0, "STATUS") != "SUCCESS") {
            throw ds.getValue(0, "MENSAGEM");
        }

        return true;
    } catch (error) {
        throw error
    }
}

function getDadosEquipamento() {
    var CODCOLIGADA = hAPI.getCardValue("coligada");
    var CODCCUSTO = hAPI.getCardValue("obra");
    var PREFIXO = hAPI.getCardValue("prefixo");
    var IDMODE = hAPI.getCardValue("IDMODE");
    var CODICLME = hAPI.getCardValue("CODICLME");
    var IDCLOP = hAPI.getCardValue("IDCLOP");
    var CODIFABR = hAPI.getCardValue("CODIFABR");
    var CODIFABR = hAPI.getCardValue("CODIFABR");
    var CODIESPE = hAPI.getCardValue("CODIESPE");
    
    var ANOFABRI = hAPI.getCardValue("AnoFabricacao");
    var ANOMODELO = hAPI.getCardValue("AnoModelo");
    var NUMECHAS = hAPI.getCardValue("chassi");
    var ALUGUEL_CONTRATO = hAPI.getCardValue("valorLocacao");
    
    var DESCRICAO = hAPI.getCardValue("descricaoEquipamento");
    
    var POTENCIAHP_UNID = hAPI.getCardValue("tipoPotenciaMotor");
    var POTENCIAHP = hAPI.getCardValue("potenciaMotor");
    return {
        CODCOLIGADA,
        CODCCUSTO,
        PREFIXO,
        IDMODE,
        CODICLME,
        IDCLOP,
        CODIFABR,
        CODIFABR,
        CODIESPE,
        ANOFABRI,
        ANOMODELO,
        NUMECHAS,
        ALUGUEL_CONTRATO,
        DESCRICAO,
        POTENCIAHP_UNID,
        POTENCIAHP,
    };

}