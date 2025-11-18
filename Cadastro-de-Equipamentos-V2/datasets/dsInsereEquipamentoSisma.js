function createDataset(fields, constraints, sortFields) {
    try {
        var constraints = getConstraints(constraints);
        lancaErroSeConstraintsObrigatoriasNaoInformadas(constraints, ["EQUIPAMENTO"]);

        log.info("dsInsereEquipamentoSisma constraints:");
        log.dir(constraints);

        if (constraints.isPAouMA != "Outros") {
            var IDEQUI = cadastraEquipamento(constraints);
        }else{
            cadastraOutros(JSON.parse(constraints.EQUIPAMENTO), constraints.CGCCFO, constraints.NUMPROCESS, constraints.isPAouMA);
        }

        

        return returnDataset("SUCCESS", "", IDEQUI);
    } catch (error) {
        if (typeof error == "object") {
            var mensagem = "";
            var keys = Object.keys(error);
            for (var i = 0; i < keys.length; i++) {
                mensagem += (keys[i] + ": " + error[keys[i]]) + " - ";
            }
            log.info("Erro ao executar Dataset:");
            log.dir(error);
            log.info(mensagem);

            return returnDataset("ERRO", mensagem, null);
        } else {
            return returnDataset("ERRO", error, null);
        }
    }
}

function cadastraEquipamento(constraints){
    var IDEQUI = geraNovoIDEQUI();
    var EQUIPAMENTO = JSON.parse(constraints.EQUIPAMENTO);

    insereEquipamento(IDEQUI, EQUIPAMENTO, constraints.NUMPROCESS, constraints.isPAouMA, constraints.CGCCFO);
    insereTransfdiv3(IDEQUI, EQUIPAMENTO);
    insereCombustivel(IDEQUI, EQUIPAMENTO);
    insereTanqueCombustivel(IDEQUI, EQUIPAMENTO);
    insereCompartimento(IDEQUI, EQUIPAMENTO);
    insereFiltros(IDEQUI, EQUIPAMENTO);
    insereCaracteristicasTecnicas(IDEQUI, JSON.parse(constraints.CARCTERISTICAS), EQUIPAMENTO);
    insereCadastroAuxiliar(EQUIPAMENTO); 
    return IDEQUI;
}
function cadastraOutros(equipamento, CGCCFO, NUMPROCESS, isPAouMA){
    try {
    var NOME = getFornecedorPorCNPJ(isPAouMA, CGCCFO)[0].NOME;
    var query = "INSERT INTO EQUIPAMENTOS_CONTRATOS_AUXILIAR_OUTROS (";
    query += "  CODCOLIGADA, ";
    query += "  CODCCUSTO, ";
    query += "  PREFIXO, ";
    query += "  DESCRICAO, ";
    query += "  FORNECEDOR, ";
    query += "  FORNECEDOR_CNPJ, ";
    query += "  DATA_CHEGADA, ";
    query += "  HORAS_ATUAIS, ";
    query += "  KM_ATUAIS, ";
    query += "  VALOR_LOCACAO, ";
    query += "  NUMPROCES_CADASTROEQUIPAMENTOS, ";
    query += "  VALOR_MOBILIZADO, ";
    query += "  UN_MOBILIZADO, ";
    query += "  VALOR_EXTRA, ";
    query += "  UN_EXTRA, ";
    query += "  STATUS, ";
    query += "  QUANTIDADE)";
    query += " VALUES (?,?,?,?,?,?,?,?,?,? ,?,?,?,?,?,?,?)";

        executeInsert(query, [
            {type:"int", value:equipamento.CODCOLIGADA },
            {type:"varchar", value:equipamento.CODCCUSTO },
            {type:"varchar", value:equipamento.PREFIXO },
            {type:"varchar", value:equipamento.DESCRICAO },
            {type:"varchar", value:NOME },
            {type:"varchar", value:CGCCFO },
            {type:"date", value:equipamento.DATACHEGADA },
            {type:"varchar", value:equipamento.INI_HORIMETRO },
            {type:"varchar", value:equipamento.INI_HODOMETRO },
            {type:"varchar", value:equipamento.ALUGUEL_CONTRATO },
            {type:"varchar", value:NUMPROCESS },
            {type:"varchar", value:equipamento.VALOR_MOBILIZADO },
            {type:"varchar", value:equipamento.TIPO_VALOR_MOBILIZADO },
            {type:"varchar", value:equipamento.VALOR_EXTRA },
            {type:"varchar", value:equipamento.TIPO_VALOR_EXTRA },
            {type:"int", value:1 },
            {type:"int", value:equipamento.QUANTIDADE },
        ], "/jdbc/CastilhoCustom");

    } catch (error) {
       var msg = "";
            // Try to extract useful message safely
            if (error && error.javaException) {
                msg = error.javaException.getMessage();
            } else if (error && error.message) {
                if (error.message.Error) {
                }else{
                    msg = error.message;
                }


            } else {
                msg = String(error);
            }

            log.error("ERRO==============> " + msg);
            log.error("Type of error: " + typeof error);
            log.error("Type of msg: " + typeof msg);

            // Safely rethrow as standard JS error
            throw "Erro ao executar Dataset: " + msg;
    }
}


function geraNovoIDEQUI() {
    try {

        var query = "(SELECT MAX(IDEQUI) + 1 as IDEQUI FROM EQUIPAMENTO)";
        var retorno = executaQuery(query, [], "/jdbc/Sisma");
        log.dir(retorno);
        return retorno[0].IDEQUI;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(typeof error === "string" ? error : JSON.stringify(error));
        }
    }
}
function insereEquipamento(IDEQUI, EQUIPAMENTO, NUMPROCESS, isPAouMA, CNPJ) {
    try {
        var fornecedor = getFornecedorPorCNPJ(isPAouMA, CNPJ)[0];
        log.info("dsInsereEquipamentoSisma fornecedor:");
        log.dir(fornecedor);
        
        var obra = getObra(EQUIPAMENTO.CODCOLIGADA, EQUIPAMENTO.CODCCUSTO)[0];
        log.info("dsInsereEquipamentoSisma obra:");
        log.dir(obra);


        var query = "";
        query += "INSERT INTO EQUIPAMENTO ";
        query += "(IDEQUI, ";//PK dos equipamentos, não é auto increment...
        query += " CODIPROP, ";//Id do Fornecedor quando PA
        query += " CODIESPE, ";//ID da Especie
        query += " NUMEEQUI, ";//Prefixo
        query += " CODIDIV2, ";//CODCOLIGADA
        query += " CODIDIV3, ";//Codigo da Obra no SISMA
        query += " CODIMEDI, ";//Codigo do Medidor
        query += " IDMODE, ";//ID do Modelo
        query += " CODICLME, ";//ID da Classe Mecanica
        query += " IDCLOP, ";//ID da Classe Operacional
        query += " CODIFABR, ";//ID do Fabricante
        query += " NUMECHAS, ";//Chassi
        query += " PLACAATUAL, ";//Placa
        query += " ANOFABRI, ";//Ano Fabricacao
        query += " ANOMODELO, ";//Ano Modelo
        query += " DIV2CONTA, ";//CODCOLIGADA
        query += " CODICONTA, ";//DEPARTAMENTO
        query += " DIV2CCUSTOMB, ";//CODCOLIGADA
        query += " CODICCUSTOMB, ";//CCUSTO
        query += " DIV2CCUSTOOP, ";//CODCOLIGADA
        query += " CODICCUSTOOP, ";//CCUSTO
        query += " NUMEBEM, ";//ID da Solicitacao
        query += " POTENCIAHP, ";//Potencia
        query += " CODITERC, ";//ID do Fornecedor quando MA
        query += " DESCRICAO, ";//Descricao
        query += " ALUGUEL_CONTRATO, "//Valor de Locação
        query += " NUMSERIE,"//Numero de Serie
        query += " CODIPAIS,"//Pais
        query += " SIGLAUF,"//UF
        query += " CODIUSU,"//CODIUSU
        query += " ORDENA,"//ORDENA
        query += " CODICATEGORIA,"//CODICATEGORIA
        query += " CODISITUEQ,"//CODISITUEQ
        query += " CODICID,"//CODICID
        query += " CODICID_PLACA,"//CODICID_PLACA
        query += " CODIESFA,"//CODIESFA
        query += " CODIESEM,"//CODIESEM
        query += " CODIESPECIE_TIPO,"//CODIESPECIE_TIPO
        query += " CODIESPDENAT,"//CODIESPDENAT
        query += " CODIUTIL,"//CODIUTIL
        query += " CODIPROCED,"//CODIPROCED
        query += " NUMEEIXO,"//NUMEEIXO
        query += " EIXOTRAC,"//EIXOTRAC
        query += " PADRCODIOPER, "//PADRCODIOPER
        query += " PADRCODILOTR, "//PADRCODILOTR
        query += " INICODIOPER, "//INICODIOPER
        query += " INICODILOTR, "//INICODILOTR
        query += " CODICOMBDENAT, "//CODICOMBDENAT
        query += " CODIRESTRICAO, "//CODIRESTRICAO
        query += " POTENCIAHP_UNID, "//POTENCIAHP_UNID
        query += " COMPRIMENTO_UNID, "//COMPRIMENTO_UNID
        query += " LARGURA_TOTAL_UNID, "//LARGURA_TOTAL_UNID
        query += " ALTURA_TOTAL_UNID, "//ALTURA_TOTAL_UNID
        query += " PESO_TOTAL_UNID, "//PESO_TOTAL_UNID
        query += " CODIFORMPAGTO_COMPRA, "//CODIFORMPAGTO_COMPRA
        query += " CODICONCESS_VENDA, "//CODICONCESS_VENDA
        query += " CODIFORMPAGTO_VENDA, "//CODIFORMPAGTO_VENDA
        query += " CODITABE, "//CODITABE
        query += " CAPACIDADE_CARGA_UNID, "//CAPACIDADE_CARGA_UNID
        query += " TARA_UNID, "//TARA_UNID
        query += " MAXIMA_TRACAO_UNID, "//MAXIMA_TRACAO_UNID
        query += " PESO_BRUTO_TOTAL_UNID, "//PESO_BRUTO_TOTAL_UNID
        query += " PESO_BRUTO_TOTAL_COMBINADO_UNI, "//PESO_BRUTO_TOTAL_COMBINADO_UNI
        query += " CODICONCESS_COMPRA, "//CODICONCESS_COMPRA
        query += " INIIDIMPL, "//INIIDIMPL
        query += " INICODIPOMA, "//INICODIPOMA
        query += " CODIMARCADENAT, "//CODIMARCADENAT
        query += " CODICOR, "//CODICOR
        query += " DATAINIC, "//DATAINIC
        query += " DATACOMP, "//DATACOMP
        query += " DATAENTREGA, "//DATAENTREGA
        query += " INI_HODOMETRO, "//INI_HODOMETRO
        query += " INI_HORIMETRO, "//INI_HORIMETRO
        query += " CODIINES)";//STATUS
        query += " VALUES ";
        query += "(?,?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?,?,?, ?,?,?,?)";

        log.info("dsInsereEquipamentoSisma query:");
        log.dir(query);


        var retorno = executeInsert(query, [
            { type: "int", value: IDEQUI },//IDEQUI
            { type: "int", value: parseInt(isPAouMA == "MA" ? fornecedor.CODIPROP : 0) },//CODITERC
            { type: "int", value: EQUIPAMENTO.CODIESPE },//CODIESPE
            { type: "varchar", value: EQUIPAMENTO.PREFIXO },//Prefixo
            { type: "int", value: "2" },//CODIDIV2
            { type: "int", value: obra.CODIDIV3 },//CODIDIV3
            { type: "int", value: "2" },//CODIMEDI
            { type: "int", value: EQUIPAMENTO.IDMODE },//IDMODE
            { type: "int", value: EQUIPAMENTO.CODICLME },//CODICLME
            { type: "int", value: EQUIPAMENTO.IDCLOP },//IDCLOP
            { type: "int", value: EQUIPAMENTO.CODIFABR },//CODIFABR
            { type: "varchar", value: EQUIPAMENTO.NUMECHAS },//NUMECHAS
            { type: "varchar", value: EQUIPAMENTO.PLACA },//PLACAATUAL
            { type: "int", value: EQUIPAMENTO.ANOFABRI },//ANOFABRI
            { type: "int", value: EQUIPAMENTO.ANOMODELO },//ANOMODELO
            { type: "int", value: obra.DIV2CONTA },//DIV2CONTA
            { type: "varchar", value: obra.CODICONTA },//CODICONTA
            { type: "int", value: "1" },//DIV2CCUSTOMB
            { type: "varchar", value: EQUIPAMENTO.CODCCUSTO },//CODICCUSTOMB
            { type: "int", value: "1" },//DIV2CCUSTOOP
            { type: "varchar", value: EQUIPAMENTO.CODCCUSTO },//CODICCUSTOOP
            { type: "int", value: NUMPROCESS },//NUMEBEM
            { type: "int", value: EQUIPAMENTO.POTENCIAHP },//POTENCIAHP
            { type: "int", value: isPAouMA == "PA" ? fornecedor.CODITERC : 0 },//CODIPROP
            { type: "varchar", value: EQUIPAMENTO.DESCRICAO },//DESCRICAO
            { type: "float", value: EQUIPAMENTO.ALUGUEL_CONTRATO },//ALUGUEL_CONTRATO
            { type: "varchar", value: EQUIPAMENTO.NUMECHAS },//NUMSERIE
            { type: "int", value: "0" },//CODIPAIS
            { type: "int", value: "0" },//SIGLAUF
            { type: "int", value: "56" },//CODIUSU
            { type: "varchar", value: EQUIPAMENTO.PREFIXO },//ORDENA
            { type: "int", value: "0" },//CODICATEGORIA
            { type: "int", value: "1" },//CODISITUEQ
            { type: "int", value: "0" },//CODICID
            { type: "int", value: "0" },//CODICID_PLACA
            { type: "int", value: "455" },//CODIESFA
            { type: "int", value: "1" },//CODIESEM
            { type: "int", value: "0" },//CODIESPECIE_TIPO
            { type: "int", value: "0" },//CODIESPDENAT
            { type: "int", value: "0" },//CODIUTIL
            { type: "int", value: "0" },//CODIPROCED
            { type: "int", value: "3" },//NUMEEIXO
            { type: "int", value: "2" },//EIXOTRAC
            { type: "int", value: "28" },//PADRCODIOPER
            { type: "int", value: "0" },//PADRCODILOTR
            { type: "int", value: "28" },//INICODIOPER
            { type: "int", value: "0" },//INICODILOTR
            { type: "int", value: "0" },//CODICOMBDENAT
            { type: "int", value: "0" },//CODIRESTRICAO
            { type: "int", value: EQUIPAMENTO.POTENCIAHP_UNID },//POTENCIAHP_UNID
            { type: "int", value: "0" },//COMPRIMENTO_UNID
            { type: "int", value: "0" },//LARGURA_TOTAL_UNID
            { type: "int", value: "0" },//ALTURA_TOTAL_UNID
            { type: "int", value: "0" },//PESO_TOTAL_UNID
            { type: "int", value: "0" },//CODIFORMPAGTO_COMPRA
            { type: "int", value: "0" },//CODICONCESS_VENDA
            { type: "int", value: "0" },//CODIFORMPAGTO_VENDA
            { type: "int", value: "0" },//CODITABE
            { type: "int", value: "4" },//CAPACIDADE_CARGA_UNID
            { type: "int", value: "2" },//TARA_UNID
            { type: "int", value: "0" },//MAXIMA_TRACAO_UNID
            { type: "int", value: "0" },//PESO_BRUTO_TOTAL_UNID
            { type: "int", value: "0" },//PESO_BRUTO_TOTAL_COMBINADO_UNI
            { type: "int", value: "0" },//CODICONCESS_COMPRA
            { type: "int", value: "2" },//INIIDIMPL
            { type: "int", value: "0" },//INICODIPOMA
            { type: "int", value: "0" },//CODIMARCADENAT
            { type: "int", value: "0" },//CODICOR
            { type: "datetime", value: EQUIPAMENTO.DATACHEGADA },//DATAINIC
            { type: "datetime", value: EQUIPAMENTO.DATACHEGADA },//DATACOMP
            { type: "datetime", value: EQUIPAMENTO.DATACHEGADA },//DATAENTREGA
            { type: "int", value: EQUIPAMENTO.INI_HODOMETRO },//INI_HODOMETRO
            { type: "int", value: EQUIPAMENTO.INI_HORIMETRO },//INI_HORIMETRO
            { type: "int", value: "0" },//CODIINES
        ], "/jdbc/Sisma");

        log.info("dsInsereEquipamentoSisma executou insert");
        log.dir(retorno);
        return retorno;
    } catch (error) {
             var msg = "";
            // Try to extract useful message safely
            if (error && error.javaException) {
                msg = error.javaException.getMessage();
            } else if (error && error.message) {
                if (error.message.Error) {
                }else{
                    msg = error.message;
                }


            } else {
                msg = String(error);
            }

            log.error("ERRO==============> " + msg);
            log.error("Type of error: " + typeof error);
            log.error("Type of msg: " + typeof msg);

            // Safely rethrow as standard JS error
            throw "Erro ao executar Dataset: " + msg;
    }
}
function insereTransfdiv3(IDEQUI, EQUIPAMENTO) {
    try {
        var obra = getObra(EQUIPAMENTO.CODCOLIGADA, EQUIPAMENTO.CODCCUSTO)[0];
        log.info("dsInsereEquipamentoSisma obra:");
        log.dir(obra);

        var query = "";
        query += "INSERT INTO TRANSFDIV3 ";
        query += "(IDEQUI, DATAHORA, NUMEDOCU, CODIDIV3, INSTDIG, CODIUSU_DIG) ";
        query += "VALUES ";
        query += "(?,?,?,?,?,?)";

        executeInsert(query, [
            { type: "int", value: IDEQUI },
            { type: "datetime", value: getDateTimeNow() },
            { type: "int", value: "0" },
            { type: "int", value: obra.CODIDIV3 },
            { type: "datetime", value: getDateTimeNow() },
            { type: "int", value: "56" },
        ], "/jdbc/Sisma");
    } catch (error) {
             var msg = "";
            // Try to extract useful message safely
            if (error && error.javaException) {
                msg = error.javaException.getMessage();
            } else if (error && error.message) {
                if (error.message.Error) {
                }else{
                    msg = error.message;
                }


            } else {
                msg = String(error);
            }

            log.error("ERRO==============> " + msg);
            log.error("Type of error: " + typeof error);
            log.error("Type of msg: " + typeof msg);

            // Safely rethrow as standard JS error
            throw "Erro ao executar Dataset: " + msg;
    }
}
function insereCombustivel(IDEQUI, EQUIPAMENTO) {
    try {
        var query = "";
        query += "INSERT INTO EQUIPCOMBU ";
        query += "(DATAHORA, ATUAL, CODIMATE,IDEQUI,CODITANQ,TIPOCONTROLE,CONTROLACONSUMO,CAPATANQ_ABAST,CAPATANQ_CONV,PRINCIPAL,CONSCOMB_KM,CONSCOMB_HORA,CODIUNID,CONSCOMB2M)"
        query += " VALUES "
        query += "(?,?,?,?,?,?,?,?,?,?, ?,?,?,?)";

        executeInsert(query, [
            { type: "datetime", value: getDateTimeNow() },//DATAHORA
            { type: "int", value: "1" },//ATUAL
            { type: "int", value: EQUIPAMENTO.CODIMATE_COMBUSTIVEL },//CODIMATE
            { type: "int", value: IDEQUI },//IDEQUI
            { type: "int", value: "1" },//CODITANQ
            { type: "int", value: "2" },//TIPOCONTROLE
            { type: "int", value: "1" },//CONTROLACONSUMO
            { type: "float", value: EQUIPAMENTO.CAPATANQ_ABAST },//CAPATANQ_ABAST
            { type: "float", value: EQUIPAMENTO.CAPATANQ_ABAST },//CAPATANQ_CONV
            { type: "int", value: "1" },//PRINCIPAL
            { type: "float", value: EQUIPAMENTO.CONSUMO_KM },//CONSCOMB_KM
            { type: "float", value: EQUIPAMENTO.CONSUMO_HORA },//CONSCOMB_HORA
            { type: "int", value: EQUIPAMENTO.CODIUNID_CAPACIDADE_COMBUSTIVEL },//CODIUNID
            { type: "float", value: "0.00" },//CONSCOMB2M
        ], "/jdbc/Sisma");
    } catch (error) {
            var msg = "";
            // Try to extract useful message safely
            if (error && error.javaException) {
                msg = error.javaException.getMessage();
            } else if (error && error.message) {
                if (error.message.Error) {
                }else{
                    msg = error.message;
                }


            } else {
                msg = String(error);
            }

            log.error("ERRO==============> " + msg);
            log.error("Type of error: " + typeof error);
            log.error("Type of msg: " + typeof msg);

            // Safely rethrow as standard JS error
            throw "Erro ao executar Dataset: " + msg;
    }
}
function insereTanqueCombustivel(IDEQUI, EQUIPAMENTO) {
    try {
        var query = "";
        query += "INSERT INTO EQUIPTANQ ";
        query += "(IDEQUI, CODITANQ, DATA, ATUAL, CAPATANQ_ABAST, CAPATANQ_CONV)"
        query += " VALUES "
        query += "(?,?,?,?,?,?)";

        executeInsert(query, [
            { type: "int", value: IDEQUI },
            { type: "int", value: "1" },
            { type: "datetime", value: getDateTimeNow() },
            { type: "int", value: "1" },
            { type: "float", value: EQUIPAMENTO.CAPATANQ_ABAST },
            { type: "float", value: EQUIPAMENTO.CAPATANQ_ABAST },
        ], "/jdbc/Sisma");
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(typeof error === "string" ? error : JSON.stringify(error));
        }
    }
}
function insereCompartimento(IDEQUI, EQUIPAMENTO) {
    try {
        var query = "";
        query += "INSERT INTO "
        query += "EQUIPCOMPA ( "
        query += "    IDEQUI, "
        query += "    CODICOMP, "
        query += "    CODIINES, "
        query += "    CODIMATE, "
        query += "    CAPACOMP, "
        query += "    PORCREMO, "
        query += "    PERITROC_KM, "
        query += "    PERITROC_HORA, "
        query += "    PERITROC_QUANT, "
        query += "    PERIAMOS_KM, "
        query += "    PERIAMOS_HORA, "
        query += "    PERIAMOS_QUANT, "
        query += "    PERIAMOS_DIA "
        query += ") "
        query += "SELECT "
        query += "    ? as IDEQUI, "
        query += "    CODICOMP, "
        query += "    ? as CODIINES, "
        query += "    CODIMATE, "
        query += "    CAPACOMP, "
        query += "    PORCREMO, "
        query += "    PERITROC_KM, "
        query += "    PERITROC_HORA, "
        query += "    PERITROC_QUANT, "
        query += "    PERIAMOS_DIA, "
        query += "    PERIAMOS_HORA, "
        query += "    PERIAMOS_KM, "
        query += "    PERIAMOS_QUANT "
        query += "FROM MODELCOMPA " ;
        query += "WHERE IDMODE = ?";

        executeInsert(query, [
            { type: "int", value: IDEQUI },//IDEQUI
            { type: "int", value: 0 },//CODIINES
            { type: "int", value: EQUIPAMENTO.IDMODE },//IDMODE
        ], "/jdbc/Sisma");
    } catch (error) {
            var msg = "";
            // Try to extract useful message safely
            if (error && error.javaException) {
                msg = error.javaException.getMessage();
            } else if (error && error.message) {
                if (error.message.Error) {
                }else{
                    msg = error.message;
                }


            } else {
                msg = String(error);
            }

            log.error("ERRO==============> " + msg);
            log.error("Type of error: " + typeof error);
            log.error("Type of msg: " + typeof msg);

            // Safely rethrow as standard JS error
            throw "Erro ao executar Dataset: " + msg;
    }
}
function insereFiltros(IDEQUI, EQUIPAMENTO) {
    try {
        var query = "";
        query += "INSERT INTO ";
        query += "EQUIPFILTR ( ";
        query += "    IDEQUI, ";
        query += "    CODIFILT, ";
        query += "    CODIINES, ";
        query += "    PERITROC_KM, ";
        query += "    PERITROC_HORA, ";
        query += "    PERITROC_QUANT, ";
        query += "    PERILIMP_KM, ";
        query += "    PERILIMP_HORA, ";
        query += "    PERILIMP_QUANT, ";
        query += "    ESFAFILT ";
        query += ") ";
        query += "SELECT ";
        query += "  ? as IDEQUI, ";
        query += "  CODIFILT, ";
        query += "  ? as CODIINES, ";
        query += "  PERITROC_KM, ";
        query += "  PERITROC_HORA, ";
        query += "  PERITROC_QUANT, ";
        query += "  PERILIMP_KM, ";
        query += "  PERILIMP_HORA, ";
        query += "  PERILIMP_QUANT, ";
        query += "  ESFAFILT ";
        query += "FROM MODELFILTR " ;
        query += "WHERE IDMODE = ?";


        executeInsert(query, [
            { type: "int", value: IDEQUI },//IDEQUI
            { type: "int", value: 0 },//CODIINES
            { type: "int", value:  EQUIPAMENTO.IDMODE},//IDMODE
        ], "/jdbc/Sisma");
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(typeof error === "string" ? error : JSON.stringify(error));
        }
    }
}

function insereCadastroAuxiliar(EQUIPAMENTO){
    try {
        var query = "INSERT INTO EQUIPAMENTOS_CONTRATOS_AUXILIAR (";
        query += "    PREFIXO, ";
        query += "    VALOR_MOBILIZADO, ";
        query += "    UN_MOBILIZADO,";
        query += "    VALOR_EXTRA, ";
        query += "    UN_EXTRA, ";
        query += "    STATUS, ";
        query += "    MAODEOBRA,";
        query += "    ANEXOS_DOCUMENTACAO, ";
        query += "    ANEXOS_FOTOS, ";
        query += "    ANEXOS_LAUDO, ";
        query += "    ANEXOS_PLANO_MANUTENCAO, ";
        query += "    ANEXOS_ART, ";
        query += "    DATA_VENCIMENTO_ART, ";
        query += "    DATA_VENCIMENTO_LAUDO ";
        query +=") ";
        query += "VALUES ";
        query += "    (?,?,?,?,?,?,?,?,?,?,?,?,?,?) ";

        return executeInsert(query, [
            {type:"varchar", value:EQUIPAMENTO.PREFIXO},//PREFIXO
            {type:"float", value:EQUIPAMENTO.VALOR_MOBILIZADO},//VALOR_MOBILIZADO
            {type:"varchar", value:EQUIPAMENTO.TIPO_VALOR_MOBILIZADO},//UN_MOBILIZADO
            {type:"float", value:EQUIPAMENTO.VALOR_EXTRA},//VALOR_EXTRA
            {type:"varchar", value:EQUIPAMENTO.TIPO_VALOR_EXTRA},//UN_EXTRA
            {type:"int", value:1},//STATUS
            {type:"float", value:EQUIPAMENTO.VALOR_MAODEOBRA},//MAODEOBRA
            {type:"varchar", value:EQUIPAMENTO.ANEXOS_DOCUMENTACAO},//ANEXOS_DOCUMENTACAO
            {type:"varchar", value:EQUIPAMENTO.ANEXOS_FOTOS},//ANEXOS_FOTOS
            {type:"varchar", value:EQUIPAMENTO.ANEXOS_LAUDO},//ANEXOS_LAUDO
            {type:"varchar", value:EQUIPAMENTO.ANEXOS_PLANO_MANUTENCAO},//ANEXOS_PLANO_MANUTENCAO
            {type:"varchar", value:EQUIPAMENTO.ANEXOS_ART},//ANEXOS_ART
            {type:"date", value:EQUIPAMENTO.DATA_VENCIMENTO_ART.split("/").reverse().join("-")},//DATA_VENCIMENTO_ART
            {type:"date", value:EQUIPAMENTO.DATA_VENCIMENTO_LAUDO.split("/").reverse().join("-")},//DATA_VENCIMENTO_LAUDO
        ], "/jdbc/CastilhoCustom");  

    } catch (error) {
          var msg = "";
            // Try to extract useful message safely
            if (error && error.javaException) {
                msg = error.javaException.getMessage();
            } else if (error && error.message) {
                if (error.message.Error) {
                }else{
                    msg = error.message;
                }


            } else {
                msg = String(error);
            }

            log.error("ERRO==============> " + msg);
            log.error("Type of error: " + typeof error);
            log.error("Type of msg: " + typeof msg);

            // Safely rethrow as standard JS error
            throw "Erro ao executar Dataset: " + msg;
    }
}
function insereCaracteristicasTecnicas(IDEQUI, CARACTECNICA, EQUIPAMENTO){
    try {
        for (let index = 0; index < CARACTECNICA.length; index++) {
            var item = CARACTECNICA[index];
            
            if (item.VALOR_PADRAO != item.VALOR) {
                // Insere a Caracteristica Tecnica somente quando for diferente do padrão
                // Visto que o SISMA já puxa o Padrão do Modelo automaticamente
                var query= "";
                query += "INSERT INTO EQUIPCARTEC (IDEQUI, TIPOCARAC, CODICATC, CODIFABR) VALUES (?,?,?,?)";
        
                executeInsert(query, [
                    {type:"int", value:IDEQUI},
                    {type:"int", value:item.TIPOCARAC},
                    {type:"int", value:item.CODICATC},
                    {type:"int", value:EQUIPAMENTO.CODIFABR},
                ], "/jdbc/Sisma");



                var query= "";
                query += "INSERT INTO ITEMEQUIPCARTEC (IDEQUI, TIPOCARAC, CODICATC, ITEM, VALOR) VALUES (?,?,?,?,?)";
        
                executeInsert(query, [
                    {type:"int", value:IDEQUI},
                    {type:"int", value:item.TIPOCARAC},
                    {type:"int", value:item.CODICATC},
                    {type:"int", value:item.ITEM},
                    {type:"float", value:item.VALOR},
                ], "/jdbc/Sisma");
            }
        }    
    } catch (error) {
        throw error;
    }
}


function getFornecedorPorCNPJ(isPAouMA, CNPJ) {
    try {
        if (isPAouMA == "PA") {
            var query = "SELECT CODITERC FROM TERCEIRO WHERE INSCFEDERAL = ?";

            return executaQuery(query, [
                { type: "varchar", value: CNPJ }
            ], "/jdbc/Sisma");

        }
        else if (isPAouMA == "MA") {
            var query = "SELECT CODIPROP FROM PROPRIETARIO WHERE INSCFEDERAL = ?";
            return executaQuery(query, [
                { type: "varchar", value: CNPJ }
            ], "/jdbc/Sisma");
        }
        else if (isPAouMA == "Outros") {
            var query = "SELECT NOME FROM FCFO WHERE CGCCFO = ?";
            return executaQuery(query, [
                { type: "varchar", value: CNPJ }
            ], "/jdbc/FluigRM");
        }

    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(typeof error === "string" ? error : JSON.stringify(error));
        }
    }
}
function getObra(CODCOLIGADA, CODCCUSTO) {
    try {
        var query = "SELECT "
        query += "CODIDIV3, ";
        query += "CODIDIV2, ";
        query += "DESCRCOMPL, ";
        query += "CODICID, ";
        query += "CODICCUSTO, ";
        query += "DIV2CONTA, ";
        query += "CODICONTA ";
        query += "FROM DIVISAO3 ";
	    query += "WHERE  CODIDIV2 = ? AND CODICCUSTO = ? ";

        return executaQuery(query, [
            { type: "int", value: CODCOLIGADA },
            { type: "varchar", value: CODCCUSTO },
        ], "/jdbc/Sisma");
        
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(typeof error === "string" ? error : JSON.stringify(error));
        }
    }
}


// Utils
function getConstraints(constraints) {
    var retorno = {};
    if (constraints != null) {
        for (var i = 0; i < constraints.length; i++) {
            var constraint = constraints[i];
            retorno[constraint.fieldName] = constraint.initialValue;
        }
    }
    return retorno;
}
function returnDataset(STATUS, MENSAGEM, RESULT) {
    var dataset = DatasetBuilder.newDataset();
    dataset.addColumn("STATUS");
    dataset.addColumn("MENSAGEM");
    dataset.addColumn("RESULT");
    dataset.addRow([STATUS, MENSAGEM, RESULT]);
    return dataset;
}
function lancaErroSeConstraintsObrigatoriasNaoInformadas(constraints, listConstrainstObrigatorias) {
    try {
        var retornoErro = [];
        for (var i = 0; i < listConstrainstObrigatorias.length; i++) {
            if (constraints[listConstrainstObrigatorias[i]] == null || constraints[listConstrainstObrigatorias[i]] == "" || constraints[listConstrainstObrigatorias[i]] == undefined) {
                retornoErro.push(listConstrainstObrigatorias[i]);
            }
        }

        if (retornoErro.length > 0) {
            throw new Error("Constraints obrigatorias nao informadas (" + retornoErro.join(", ") + ")");
        }
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(typeof error === "string" ? error : JSON.stringify(error));
        }
    }
}
function executaQuery(query, constraints, dataSource) {
    try {
        var dataSource = dataSource;
        var ic = new javax.naming.InitialContext();
        var ds = ic.lookup(dataSource);

        var conn = ds.getConnection();
        var stmt = conn.prepareStatement(query);

        var counter = 1;
        for (var i = 0; i < constraints.length; i++) {
            var val = constraints[i];
            if (val.type == "int") {
                stmt.setInt(counter, val.value);
            }
            else if (val.type == "float") {
                stmt.setFloat(counter, val.value);
            }
            else if (val.type == "date") {
                stmt.setString(counter, val.value);
            }
            else if (val.type == "datetime") {
                stmt.setString(counter, val.value);
            } else {
                stmt.setString(counter, val.value);
            }
            counter++;
        }

        var rs = stmt.executeQuery();
        var columnCount = rs.getMetaData().getColumnCount();
        var retorno = [];

        while (rs.next()) {
            var linha = {};
            for (var j = 1; j < columnCount + 1; j++) {
                linha[rs.getMetaData().getColumnName(j)] = rs.getObject(rs.getMetaData().getColumnName(j)) + "";
            }
            retorno.push(linha);
        }

        return retorno;

    } catch (error) {
            var msg = "";
            // Try to extract useful message safely
            if (error && error.javaException) {
                msg = error.javaException.getMessage();
            } else if (error && error.message) {
                if (error.message.Error) {
                }else{
                    msg = error.message;
                }


            } else {
                msg = String(error);
            }

            log.error("ERRO==============> " + msg);
            log.error("Type of error: " + typeof error);
            log.error("Type of msg: " + typeof msg);

            // Safely rethrow as standard JS error
            throw "Erro ao executar Dataset: " + msg;
    } finally {
        if (stmt != null) {
            stmt.close();
        }
        if (conn != null) {
            conn.close();
        }
    }
}
function executeInsert(query, constraints, dataSource) {
    try {
        log.info("executandoQuery");
        log.info(query);
        log.dir(constraints);

        // var dataSource = dataSource;
        var ic = new javax.naming.InitialContext();
        var ds = ic.lookup(dataSource);


        var conn = ds.getConnection();
        var stmt = conn.prepareStatement(query, Packages.java.sql.Statement.RETURN_GENERATED_KEYS);

        var counter = 1;
        for (var i = 0; i < constraints.length; i++) {
            var val = constraints[i];
            if (val.type == "int") {
                stmt.setInt(counter, val.value);
            }
            else if (val.type == "float") {
                stmt.setFloat(counter, val.value);
            }
            else if (val.type == "date") {
                stmt.setString(counter, val.value);
            }
            else if (val.type == "datetime") {
                stmt.setString(counter, val.value);
            } else {
                stmt.setString(counter, val.value);
            }
            counter++;
        }


        var hasResultSet = stmt.execute();
        log.dir(hasResultSet);
        if (hasResultSet) {
            var rs = stmt.getResultSet();
            log.info("result set");
            log.dir(rs);
            if (rs.next()) {
                var id = rs.getInt(1);
                log.info("id");
                log.dir(id);
                return id;
            }
        }
    } catch (error) {
        var msg = "";
            // Try to extract useful message safely
            if (error && error.javaException) {
                msg = error.javaException.getMessage();
            } else if (error && error.message) {
                if (error.message.Error) {
                }else{
                    msg = error.message;
                }


            } else {
                msg = String(error);
            }

            log.error("ERRO==============> " + msg);
            log.error("Type of error: " + typeof error);
            log.error("Type of msg: " + typeof msg);

            // Safely rethrow as standard JS error
            throw "Erro ao executar Dataset: " + msg;

    } finally {
        if (stmt != null) {
            stmt.close();
        }
        if (conn != null) {
            conn.close();
        }
    }
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