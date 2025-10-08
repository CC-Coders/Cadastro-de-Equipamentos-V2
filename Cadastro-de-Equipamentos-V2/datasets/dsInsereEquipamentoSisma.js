function createDataset(fields, constraints, sortFields) {
    try {
        var constraints = getConstraints(constraints);
        lancaErroSeConstraintsObrigatoriasNaoInformadas(constraints, ["EQUIPAMENTO"]);

        var IDEQUI = geraNovoIDEQUI();

        insereEquipamento(IDEQUI, JSON.parse(constraints.EQUIPAMENTO), constraints.NUMPROCESS, constraints.isPAouMA, constraints.CGCCFO);
        insereTransfdiv3(IDEQUI);
        insereCombustivel(IDEQUI, JSON.parse(constraints.EQUIPAMENTO));
        insereTanqueCombustivel(IDEQUI);
        insereCompartimento(IDEQUI);
        insereFiltros(IDEQUI);

        insereCadastroAuxiliar(JSON.parse(constraints.EQUIPAMENTO));

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
        query += " CODITERC, ";//Id do Fornecedor quando PA
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
        query += " CODIPROP, ";//ID do Fornecedor quando MA
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
            { type: "int", value: parseInt(isPAouMA == "PA" ? fornecedor.CODIPROP : 0) },//CODITERC
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
            { type: "int", value: isPAouMA == "MA" ? fornecedor.CODITERC : 0 },//CODIPROP
            { type: "varchar", value: EQUIPAMENTO.DESCRICAO },//DESCRICAO
            { type: "float", value: EQUIPAMENTO.ALUGUEL_CONTRATO },//ALUGUEL_CONTRATO
            { type: "varchar", value: "123456" },//NUMSERIE
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
            { type: "int", value: "11" },//PADRCODILOTR
            { type: "int", value: "28" },//INICODIOPER
            { type: "int", value: "11" },//INICODILOTR
            { type: "int", value: "0" },//CODICOMBDENAT
            { type: "int", value: "0" },//CODIRESTRICAO
            { type: "int", value: EQUIPAMENTO.POTENCIAHP_UNID },//POTENCIAHP_UNID
            { type: "int", value: "11" },//COMPRIMENTO_UNID
            { type: "int", value: "11" },//LARGURA_TOTAL_UNID
            { type: "int", value: "11" },//ALTURA_TOTAL_UNID
            { type: "int", value: "11" },//PESO_TOTAL_UNID
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
            { type: "datetime", value: "2025-10-01 00:00:00.000" },//DATACOMP
            { type: "datetime", value: "2025-10-01 00:00:00.000" },//DATAENTREGA
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
function insereTransfdiv3(IDEQUI) {
    try {
        var query = "";
        query += "INSERT INTO TRANSFDIV3 ";
        query += "(IDEQUI, DATAHORA, NUMEDOCU, CODIDIV3, INSTDIG, CODIUSU_DIG) ";
        query += "VALUES ";
        query += "(?,?,?,?,?,?)";

        executeInsert(query, [
            { type: "int", value: IDEQUI },
            { type: "datetime", value: "2025-10-01 00:00:00.000" },
            { type: "int", value: "0" },
            { type: "int", value: "104" },
            { type: "datetime", value: "2025-10-01 13:06:55.000" },
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
function insereTanqueCombustivel(IDEQUI) {
    try {


        var query = "";
        query += "INSERT INTO EQUIPTANQ ";
        query += "(IDEQUI, CODITANQ, DATA, ATUAL, CAPATANQ_ABAST, CAPATANQ_CONV)"
        query += " VALUES "
        query += "(?,?,?,?,?,?)";


        executeInsert(query, [
            { type: "int", value: IDEQUI },
            { type: "int", value: "1" },
            { type: "datetime", value: "2025-10-01 00:00:00.000" },
            { type: "int", value: "1" },
            { type: "float", value: "250.00" },
            { type: "float", value: "250.00" },
        ], "/jdbc/Sisma");
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(typeof error === "string" ? error : JSON.stringify(error));
        }
    }
}
function insereCompartimento(IDEQUI) {
    try {


        var query = "";
        query += "INSERT INTO "
        query += "EQUIPCOMPA ( "
        query += "    IDEQUI, "
        query += "    CODICOMP, "
        query += "    CODIINES, "
        query += "    CODIMATE, "
        query += "    PERIINI_TROC_KM, "
        query += "    DATAINI_TROC_KM, "
        query += "    PERIINI_TROC_HORA, "
        query += "    PERIINI_TROC_QUANT, "
        query += "    PERIINI_AMOS_KM, "
        query += "    DATAINI_AMOS_KM, "
        query += "    PERIINI_AMOS_HORA, "
        query += "    PERIINI_AMOS_QUANT, "
        query += "    QUANT_TROC_SUG, "
        query += "    CAPACOMP, "
        query += "    PORCREMO, "
        query += "    PERITROC_KM, "
        query += "    PERITROC_HORA, "
        query += "    PERITROC_QUANT, "
        query += "    PERIAMOS_KM, "
        query += "    PERIAMOS_HORA, "
        query += "    PERIAMOS_QUANT, "
        query += "    CODICAMA_TROC_SUG, "
        query += "    CODICAMA_REMO_SUG, "
        query += "    QUANT_REMO_SUG, "
        query += "    PERIINI_TROC_DIA, "
        query += "    PERIINI_AMOS_DIA, "
        query += "    PERITROC_DIA, "
        query += "    PERIAMOS_DIA, "
        query += "    CODIINES_AMO "
        query += ") "
        query += "VALUES "
        query += "(?,?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?,?)";


        executeInsert(query, [
            { type: "int", value: IDEQUI },//IDEQUI
            { type: "int", value: 501 },//CODICOMP
            { type: "int", value: 0 },//CODIINES
            { type: "int", value: 405 },//CODIMATE
            { type: "int", value: 0 },//PERIINI_TROC_KM
            { type: "datetime", value: "2025-10-01 00:00:00.000" },//DATAINI_TROC_KM
            { type: "int", value: 0 },//PERIINI_TROC_HORA
            { type: "int", value: 0 },//PERIINI_TROC_QUANT
            { type: "int", value: 0 },//PERIINI_AMOS_KM
            { type: "datetime", value: "2025-10-01 00:00:00.000" },//DATAINI_AMOS_KM
            { type: "int", value: 0 },//PERIINI_AMOS_HORA
            { type: "int", value: 0 },//PERIINI_AMOS_QUANT
            { type: "float", value: 20.0000 },//QUANT_TROC_SUG
            { type: "float", value: 20.00 },//CAPACOMP
            { type: "float", value: 1.00 },//PORCREMO
            { type: "int", value: 10000 },//PERITROC_KM
            { type: "int", value: 0 },//PERITROC_HORA
            { type: "int", value: 0 },//PERITROC_QUANT
            { type: "int", value: 0 },//PERIAMOS_KM
            { type: "int", value: 0 },//PERIAMOS_HORA
            { type: "int", value: 0 },//PERIAMOS_QUANT
            { type: "int", value: 0 },//CODICAMA_TROC_SUG
            { type: "int", value: 0 },//CODICAMA_REMO_SUG
            { type: "float", value: 20.0000 },//QUANT_REMO_SUG
            { type: "int", value: 0 },//PERIINI_TROC_DIA
            { type: "int", value: 0 },//PERIINI_AMOS_DIA
            { type: "int", value: 0 },//PERITROC_DIA
            { type: "int", value: 0 },//PERIAMOS_DIA
            { type: "int", value: 0 },//CODIINES_AMO
        ], "/jdbc/Sisma");
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(typeof error === "string" ? error : JSON.stringify(error));
        }
    }
}
function insereFiltros(IDEQUI) {
    try {


        var query = "";
        query += "INSERT INTO "
        query += "EQUIPFILTR ( "
        query += "    IDEQUI, "
        query += "    CODIFILT, "
        query += "    CODIINES, "
        query += "    PERIINI_TROC_KM, "
        query += "    DATAINI_TROC_KM, "
        query += "    PERIINI_TROC_HORA, "
        query += "    PERIINI_TROC_QUANT, "
        query += "    PERIINI_LIMP_KM, "
        query += "    DATAINI_LIMP_KM, "
        query += "    PERIINI_LIMP_HORA, "
        query += "    PERIINI_LIMP_QUANT, "
        query += "    PERITROC_KM, "
        query += "    PERITROC_HORA, "
        query += "    PERITROC_QUANT, "
        query += "    PERILIMP_KM, "
        query += "    PERILIMP_HORA, "
        query += "    PERILIMP_QUANT, "
        query += "    CODICAMA_TROC_SUG, "
        query += "    CODICAMA_LIMP_SUG, "
        query += "    ESFAFILT, "
        query += "    CODIMAT, "
        query += "    PERIINI_TROC_DIA, "
        query += "    PERIINI_LIMP_DIA, "
        query += "    PERITROC_DIA, "
        query += "    PERILIMP_DIA, "
        query += "    QUANTIDADE "
        query += ") "
        query += "VALUES "
        query += "(?,?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?)"


        executeInsert(query, [
            { type: "int", value: IDEQUI },//IDEQUI
            { type: "int", value: 701 },//CODIFILT
            { type: "int", value: 0 },//CODIINES
            { type: "int", value: 0 },//PERIINI_TROC_KM
            { type: "datetime", value: "2025-10-01 00:00:00.000" },//DATAINI_TROC_KM
            { type: "int", value: 0 },//PERIINI_TROC_HORA
            { type: "int", value: 0 },//PERIINI_TROC_QUANT
            { type: "int", value: 0 },//PERIINI_LIMP_KM
            { type: "datetime", value: "2025-10-01 00:00:00.000" },//DATAINI_LIMP_KM
            { type: "int", value: 0 },//PERIINI_LIMP_HORA
            { type: "int", value: 0 },//PERIINI_LIMP_QUANT
            { type: "int", value: 10000 },//PERITROC_KM
            { type: "int", value: 0 },//PERITROC_HORA
            { type: "int", value: 0 },//PERITROC_QUANT
            { type: "int", value: 0 },//PERILIMP_KM
            { type: "int", value: 0 },//PERILIMP_HORA
            { type: "int", value: 0 },//PERILIMP_QUANT
            { type: "int", value: 0 },//CODICAMA_TROC_SUG
            { type: "int", value: 0 },//CODICAMA_LIMP_SUG
            { type: "varchar", value: "*W950/26" },//ESFAFILT
            { type: "varchar", value: "30.001.00024" },//CODIMAT
            { type: "int", value: 0 },//PERIINI_TROC_DIA
            { type: "int", value: 0 },//PERIINI_LIMP_DIA
            { type: "int", value: 0 },//PERITROC_DIA
            { type: "int", value: 0 },//PERILIMP_DIA
            { type: "int", value: 0 },//QUANTIDADE
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
        var query = "INSERT INTO ";
        query += "    EQUIPAMENTOS_CONTRATOS_AUXILIAR (PREFIXO, VALOR_MOBILIZADO, UN_MOBILIZADO, VALOR_EXTRA, UN_EXTRA, STATUS, MAODEOBRA) ";
        query += "VALUES ";
        query += "    (?,?,?,?,?,?,?) ";

        return executeInsert(query, [
            {type:"varchar", value:EQUIPAMENTO.PREFIXO},//PREFIXO
            {type:"float", value:EQUIPAMENTO.VALOR_MOBILIZADO},//VALOR_MOBILIZADO
            {type:"varchar", value:EQUIPAMENTO.TIPO_VALOR_MOBILIZADO},//UN_MOBILIZADO
            {type:"float", value:EQUIPAMENTO.VALOR_EXTRA},//VALOR_EXTRA
            {type:"varchar", value:EQUIPAMENTO.TIPO_VALOR_EXTRA},//UN_EXTRA
            {type:"int", value:1},//STATUS
            {type:"float", value:EQUIPAMENTO.VALOR_MAODEOBRA},//MAODEOBRA
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


function getFornecedorPorCNPJ(isPAouMA, CNPJ) {
    try {
        if (isPAouMA == "MA") {
            var query = "SELECT CODITERC FROM TERCEIRO WHERE INSCFEDERAL = ?";

            return executaQuery(query, [
                { type: "varchar", value: CNPJ }
            ], "/jdbc/Sisma");

        }
        else if (isPAouMA == "PA") {
            var query = "SELECT CODIPROP FROM PROPRIETARIO WHERE INSCFEDERAL = ?";
            return executaQuery(query, [
                { type: "varchar", value: CNPJ }
            ], "/jdbc/Sisma");

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

/*
var prefixo = "MA01.979";
var ds = DatasetFactory.getDataset("dsInsereEquipamentoSisma",null,[
    DatasetFactory.createConstraint("PREFIXO", prefixo, prefixo, ConstraintType.MUST)
],null)
*/