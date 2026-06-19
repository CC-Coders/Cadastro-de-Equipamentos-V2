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

    // É aberta uma conexão para cada banco
    // Antes cada INSERT abria e fechava a conexão, agora todas compartilham essas duas
    var ic = new javax.naming.InitialContext();
    var connSisma = ic.lookup("/jdbc/Sisma").getConnection();
    var connCustom = ic.lookup("/jdbc/CastilhoCustom").getConnection();

    // Desligado o commit (execução) automático.
    // Isso faz com que os INSERT's fiquem "na fila", pendente, sem rodar e gravar os dados no banco
    // Só gravam (faz INSERT) quando chamamos commit() lá embaixo.
    connSisma.setAutoCommit(false);
    connCustom.setAutoCommit(false);

    try {
        // Agora passamos a conexão correspondente para cada função

        insereEquipamento(IDEQUI, EQUIPAMENTO, constraints.NUMPROCESS, constraints.isPAouMA, constraints.CGCCFO, connSisma);
        insereTransfdiv3(IDEQUI, EQUIPAMENTO, connSisma);
        insereTransfConta(IDEQUI, EQUIPAMENTO, connSisma);

        if (constraints.isPAouMA == "MA") {
            insereTransfModuloCE(IDEQUI, EQUIPAMENTO, connSisma)
            insereDieselNoModeloSeNaoExistir(EQUIPAMENTO, connSisma);
            insereCombustivel(IDEQUI, EQUIPAMENTO, connSisma);
            insereTanqueCombustivel(IDEQUI, EQUIPAMENTO, connSisma);
            insereCaracteristicasTecnicas(IDEQUI, JSON.parse(constraints.CARCTERISTICAS), EQUIPAMENTO, connSisma);
        }
        
        insereMedidorEquipamento(IDEQUI, EQUIPAMENTO, connSisma);
        insereCompartimento(IDEQUI, EQUIPAMENTO, connSisma);

        insereValorLocacaoMensal(IDEQUI, EQUIPAMENTO, connSisma);
        insereObservacaoEquip(IDEQUI, EQUIPAMENTO, connSisma);
        insereFiltros(IDEQUI, EQUIPAMENTO, connSisma);

        // Banco CastilhoCustom
        insereCadastroAuxiliar(EQUIPAMENTO, connCustom);

        // Chegou até aqui = todos os INSERT's executaram sem erro.
        // Agora sim será gravado (feito INSERT) de tudo, nos 2 bancos de uma vez.
        connSisma.commit();
        connCustom.commit();

    } catch (error) {
        // Se algum INSERT falhar
        // Cancelamos todos os INSERTS, sem cadastrar "meio certo"

        log.error("## cadastraEquipamento: erro em algum INSERT, iniciando rollback. Erro: ");
        log.dir(error);
        try { 
            connSisma.rollback(); 
        } catch (e) {
            log.error("## Erro no rollback do Sisma: " + e);
        }
        try { 
            connCustom.rollback(); 
        } catch (e) {
            log.error("## Erro no rollback do Custom: " + e);
        }
        throw error;

    } finally {
        // O bloco finally sempre executa, com erro ou sem.
        // Garantimos que as conexões são fechadas independente se deu erro ou não.
        // Se não fechar, o banco fica com conexões presas e para de responder com o tempo.
        
        try { connSisma.close(); } catch (e) {}
        try { connCustom.close(); } catch (e) {}

    }
 
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
function insereEquipamento(IDEQUI, EQUIPAMENTO, NUMPROCESS, isPAouMA, CNPJ, conn) { // conn = conexão compartilhada da transação, aberta em cadastraEquipamento
    try {
        var fornecedor = getFornecedorPorCNPJ(isPAouMA, CNPJ)[0];

        if (!fornecedor) {
            throw "Fornecedor não encontrado no Sisma. Favor entrar em contato com o administrador do sistema.";
        }

        log.info("dsInsereEquipamentoSisma fornecedor:");
        log.dir(fornecedor);
        
        var obra = getObra(EQUIPAMENTO.CODCOLIGADA, EQUIPAMENTO.CODCCUSTO)[0];

        if (!obra) {
            throw "Obra não encontrada no Sisma. Favor entrar em contato com o administrador do sistema.";
        }

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

        query += "VIDABASE_HORA, " // VIDABASE_HORA é o mesmo valor que vai em INI_HORIMETRO
        query += "VIDABASE_KM, " // VIDABASE_KM é o mesmo valor que vai em INI_HODOMETRO
        
        query += "ENTRAOM, " // ENTRAOM é para permitir abrir OS para o equip
        query += "ENTRAABASTECE, " // ENTRAABASTECE é para permitir abrir o cadastro de equipamento (dava erro de não poder converter valor null em int) e lançar ficha de abast.

        query += " CODIINES)";//STATUS
        query += " VALUES ";
        query += "(?,?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?)";

        log.info("dsInsereEquipamentoSisma query:");
        log.dir(query);


        var retorno = executeInsert(query, [
            { type: "int", value: IDEQUI },//IDEQUI
            { type: "int", value: parseInt(isPAouMA == "MA" ? fornecedor.CODIPROP : 0) },//CODITERC
            { type: "int", value: EQUIPAMENTO.CODIESPE },//CODIESPE
            { type: "varchar", value: EQUIPAMENTO.PREFIXO },//Prefixo
            { type: "int", value: "2" },//CODIDIV2
            { type: "int", value: obra.CODIDIV3 },//CODIDIV3
            { type: "int", value: EQUIPAMENTO.CODIMEDI },//CODIMEDI
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
            { type: "int", value: EQUIPAMENTO.CODCOLIGADA },//DIV2CCUSTOMB
            { type: "varchar", value: EQUIPAMENTO.CODCCUSTO },//CODICCUSTOMB
            { type: "int", value: EQUIPAMENTO.CODCOLIGADA },//DIV2CCUSTOOP
            { type: "varchar", value: EQUIPAMENTO.CODCCUSTO },//CODICCUSTOOP
            { type: "int", value: NUMPROCESS },//NUMEBEM
            { type: "int", value: EQUIPAMENTO.POTENCIAHP },//POTENCIAHP
            { type: "int", value: isPAouMA == "PA" ? fornecedor.CODITERC : 0 },//CODIPROP
            { type: "varchar", value: EQUIPAMENTO.DESCRICAO },//DESCRICAO
            { type: "float", value: EQUIPAMENTO.ALUGUEL_CONTRATO },//ALUGUEL_CONTRATO
            { type: "varchar", value: EQUIPAMENTO.NUMECHAS },//NUMSERIE
            { type: "int", value: "0" },//CODIPAIS
            { type: "int", value: "0" },//SIGLAUF
            { type: "int", value: "1" },//CODIUSU
            { type: "varchar", value: EQUIPAMENTO.PREFIXO },//ORDENA
            { type: "int", value: "0" },//CODICATEGORIA
            { type: "int", value: "0" },//CODISITUEQ - Alterado de 1 (LIBERADO) para 0 (ATIVO OBRA)
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
            { type: "int", value: "0" },//PADRCODIOPER
            { type: "int", value: "0" },//PADRCODILOTR
            { type: "int", value: "0" },//INICODIOPER
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
            { type: "int", value: EQUIPAMENTO.INI_HODOMETRO || '0' },//INI_HODOMETRO
            { type: "int", value: EQUIPAMENTO.INI_HORIMETRO || '0'  },//INI_HORIMETRO

            { type: "int", value: EQUIPAMENTO.VIDABASE_HORA || '0' }, // VIDABASE_HORA
            { type: "int", value: EQUIPAMENTO.VIDABASE_KM || '0' }, // VIDABASE_KM

            { type: "int", value: "1" }, // ENTRAOM
            { type: "int", value: "1" }, // ENTRAABASTECE 

            { type: "int", value: "0" },//CODIINES
        ], conn);

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
function insereTransfdiv3(IDEQUI, EQUIPAMENTO, conn) { // conn = conexão compartilhada da transação, aberta em cadastraEquipamento
    try {
        var obra = getObra(EQUIPAMENTO.CODCOLIGADA, EQUIPAMENTO.CODCCUSTO)[0];
        log.info("dsInsereEquipamentoSisma obra:");
        log.dir(obra);

        var query = "";
        query += "INSERT INTO TRANSFDIV3 ";
        query += "(IDEQUI, DATAHORA, NUMEDOCU, CODIDIV3, INSTDIG, CODIUSU_DIG) ";
        query += "VALUES ";
        query += "(?,CONVERT(datetime, ?, 121),?,?,CONVERT(datetime, ?, 121),?)";

        executeInsert(query, [
            { type: "int", value: IDEQUI },
            { type: "datetime", value: EQUIPAMENTO.DATACHEGADA },
            { type: "int", value: "0" },
            { type: "int", value: obra.CODIDIV3 },
            { type: "datetime", value: EQUIPAMENTO.DATACHEGADA },
            { type: "int", value: "1" },
        ], conn);
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
function insereTransfConta(IDEQUI, EQUIPAMENTO, conn) { // conn = conexão compartilhada da transação, aberta em cadastraEquipamento
    
    // Necessario esse INSERT para quando abrir a OS ele auto preencher os campos com essas informações de Coligada e Centro de Custo, além o valor fixo de CodiConta.

    try {
        var query = "";
        query += "INSERT INTO TRANSFCONTA "
        query += "( "
        query += "  IDEQUI, "
        query += "  DATAHORA, "
        query += "  NUMEDOCU, "
        query += "  DIV2CCUSTOCOMB, "
        query += "  CODICCUSTOCOMB, "
        query += "  DIV2CONTACOMB, "
        query += "  CODICONTACOMB, "
        query += "  DIV2CCUSTOLUBR, "
        query += "  CODICCUSTOLUBR, "
        query += "  DIV2CONTALUBR, "
        query += "  CODICONTALUBR, "
        query += "  DIV2CCUSTOPECAS, "
        query += "  CODICCUSTOPECAS, "
        query += "  DIV2CONTAPECAS, "
        query += "  CODICONTAPECAS, "
        query += "  DIV2CCUSTOOP, "
        query += "  CODICCUSTOOP "
        query += ") "
        query += "VALUES "
        query += "(?, CONVERT(datetime, ?, 121) ,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

        executeInsert(query, [
            { type: "int", value: IDEQUI }, // IDEQUI
            { type: "datetime", value: EQUIPAMENTO.DATACHEGADA }, // DATAHORA
            { type: "int", value: '0' }, // Numero de documento

            { type: "varchar", value: EQUIPAMENTO.CODCOLIGADA }, // DIV2CCUSTOCOMB
            { type: "varchar", value: EQUIPAMENTO.CODCCUSTO }, // CODICCUSTOCOMB 

            { type: "varchar", value: EQUIPAMENTO.CODCOLIGADA }, // DIV2CONTACOMB
            { type: "varchar", value: '1.3.02' }, // CODICONTAPECAS, '1.3.002' é 'MANUTENÇÃO OBRA'

            { type: "varchar", value: EQUIPAMENTO.CODCOLIGADA }, // DIV2CCUSTOLUBR
            { type: "varchar", value: EQUIPAMENTO.CODCCUSTO }, // CODICCUSTOLUBR

            { type: "varchar", value: EQUIPAMENTO.CODCOLIGADA }, // DIV2CONTALUBR
            { type: "varchar", value: '1.3.02' }, // CODICONTAPECAS, '1.3.002' é 'MANUTENÇÃO OBRA'

            { type: "varchar", value: EQUIPAMENTO.CODCOLIGADA }, // DIV2CCUSTOPECAS
            { type: "varchar", value: EQUIPAMENTO.CODCCUSTO }, // CODICCUSTOPECAS

            { type: "varchar", value: EQUIPAMENTO.CODCOLIGADA }, // DIV2CONTAPECAS
            { type: "varchar", value: '1.3.02' }, // CODICONTAPECAS, '1.3.002' é 'MANUTENÇÃO OBRA'

            { type: "varchar", value: EQUIPAMENTO.CODCOLIGADA }, // DIV2CCUSTOOP
            { type: "varchar", value: EQUIPAMENTO.CODCCUSTO }, // CODICCUSTOOP
        ], conn);
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(typeof error === "string" ? error : JSON.stringify(error));
        }
    }
}
function insereTransfModuloCE(IDEQUI, EQUIPAMENTO, conn) { // conn = conexão compartilhada da transação, aberta em cadastraEquipamento

    // A pedido da Central, esse INSERT impacta em outros momentos de transf... para poder puxar info's automatico

    try {
        var query = "";
        query += "INSERT INTO TRANSFTIPOEQUIPCE "
        query += "( "
        query += "  IDEQUI, "
        query += "  DATAHORA, "
        query += "  NUMEDOCU, "
        query += "  CODITECE "
        query += ") "
        query += "VALUES "
        query += "(?, CONVERT(datetime, ?, 121) ,?,?)";

        executeInsert(query, [
            { type: "int", value: IDEQUI }, // IDEQUI
            { type: "datetime", value: EQUIPAMENTO.DATACHEGADA }, // DATAHORA
            { type: "int", value: '0' }, // Numero de documento
            { type: "int", value: '1' }, // CODITECE
        ], conn);
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(typeof error === "string" ? error : JSON.stringify(error));
        }
    }
}
function insereCombustivel(IDEQUI, EQUIPAMENTO, conn) { // conn = conexão compartilhada da transação, aberta em cadastraEquipamento
    try {
        var query = "";
        query += "INSERT INTO EQUIPCOMBU ";
        query += "( ";
        query += "  DATAHORA, ";
        query += "  ATUAL, ";
        query += "  CODIMATE, ";
        query += "  IDEQUI, ";
        query += "  CODITANQ, ";
        query += "  TIPOCONTROLE, ";
        query += "  CONTROLACONSUMO, ";
        query += "  CAPATANQ_ABAST, ";
        query += "  CAPATANQ_CONV, ";
        query += "  PRINCIPAL, ";
        query += "  CONSCOMB_KM, ";
        query += "  CONSCOMB_HORA, ";
        query += "  CODIUNID, ";
        query += "  CONSCOMB2M ";
        query += ") ";
        query += "  VALUES ";
        query += "(CONVERT(datetime, ?, 121),?,?,?,?,?,?,?,?,?, ?,?,?,?)";

        executeInsert(query, [
            { type: "datetime", value: EQUIPAMENTO.DATACHEGADA },
            { type: "int", value: "1" }, // ATUAL
            { type: "int", value: EQUIPAMENTO.CODIMATE_COMBUSTIVEL },
            { type: "int", value: IDEQUI },
            { type: "int", value: "1" }, // CODITANQ
            { type: "int", value: "2" }, // TIPOCONTROLE
            { type: "int", value: "1" }, // CONTROLACONSUMO
            { type: "float", value: EQUIPAMENTO.CAPATANQ_ABAST },
            { type: "float", value: EQUIPAMENTO.CAPATANQ_ABAST },
            { type: "int", value: EQUIPAMENTO.PRINCIPAL },
            { type: "float", value: EQUIPAMENTO.CONSUMO_KM || 0 },
            { type: "float", value: EQUIPAMENTO.CONSUMO_HORA || 0 },
            { type: "int", value: EQUIPAMENTO.CODIUNID_CAPACIDADE_COMBUSTIVEL },
            { type: "float", value: "0.00" }, // CONSCOMB2M
        ], conn);
    } catch (error) {
        var msg = "";

        if (error && error.javaException) {
            msg = error.javaException.getMessage();
        } else if (error && error.message) {
            msg = error.message;
        } else {
            msg = String(error);
        }

        log.error("ERRO==============> " + msg);
        throw "Erro ao executar Dataset: " + msg;
    }
}
function insereDieselNoModeloSeNaoExistir(EQUIPAMENTO, conn) { // conn = conexão compartilhada da transação.
    
    // A função interna insereCombustivelNoModelo enxerga conn automaticamente (isso é chamado de "closure" no JS).
    try {
        var combustiveisModelo = consultaCombustiveisCadastradosNoModelo(EQUIPAMENTO);
        var principal = 1;

        if (combustiveisModelo && combustiveisModelo.length > 0) {
            for (var i = 0; i < combustiveisModelo.length; i++) {
                var item = combustiveisModelo[i];

                if (item.CODIMATE == EQUIPAMENTO.CODIMATE_COMBUSTIVEL) {
                    log.info("Combustível já cadastrado no modelo. IDMODE: " + EQUIPAMENTO.IDMODE + " CODIMATE: " + EQUIPAMENTO.CODIMATE_COMBUSTIVEL);

                    EQUIPAMENTO.PRINCIPAL = item.PRINCIPAL == "1" ? 1 : 0;
                    return;
                }

                if (item.PRINCIPAL == "1") {
                    principal = 0;
                }
            }
        }

        EQUIPAMENTO.PRINCIPAL = principal;
        insereCombustivelNoModelo(EQUIPAMENTO, principal);

    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(typeof error === "string" ? error : JSON.stringify(error));
        }
    }

    // INSERT
    function insereCombustivelNoModelo(EQUIPAMENTO, principal) {
        try {
            var query = "";
            query += "INSERT INTO MODELCOMBU ";
            query += "( ";
            query += "  IDMODE, ";
            query += "  CODIMATE, ";
            query += "  PRINCIPAL, ";
            query += "  CONSCOMB_KM, ";
            query += "  CONSCOMB_HORA, ";
            query += "  CAPATANQ, ";
            query += "  FATCONVLITROS ";
            query += ") ";
            query += "VALUES ";
            query += "(?,?,?,?,?,?,?)";

            executeInsert(query, [
                { type: "int", value: EQUIPAMENTO.IDMODE },
                { type: "int", value: EQUIPAMENTO.CODIMATE_COMBUSTIVEL },
                { type: "int", value: principal },
                { type: "float", value: EQUIPAMENTO.CONSUMO_KM || 0 },
                { type: "float", value: EQUIPAMENTO.CONSUMO_HORA || 0 },
                { type: "float", value: EQUIPAMENTO.CAPATANQ_ABAST || 0 },
                { type: "float", value: 1 },
            ], conn);

        } catch (error) {
            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error(typeof error === "string" ? error : JSON.stringify(error));
            }
        }
    }
}
function insereTanqueCombustivel(IDEQUI, EQUIPAMENTO, conn) { // conn = conexão compartilhada da transação, aberta em cadastraEquipamento
    try {
        var query = "";
        query += "INSERT INTO EQUIPTANQ ";
        query += "(IDEQUI, CODITANQ, DATA, ATUAL, CAPATANQ_ABAST, CAPATANQ_CONV)";
        query += " VALUES ";
        query += "(?,?,CONVERT(datetime, ?, 121),?,?,?)";

        executeInsert(query, [
            { type: "int", value: IDEQUI },
            { type: "int", value: "1" }, // CODITANQ
            { type: "datetime", value: EQUIPAMENTO.DATACHEGADA },
            { type: "int", value: "1" }, // ATUAL
            { type: "float", value: EQUIPAMENTO.CAPATANQ_ABAST },
            { type: "float", value: EQUIPAMENTO.CAPATANQ_ABAST },
        ], conn);
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(typeof error === "string" ? error : JSON.stringify(error));
        }
    }
}
function insereMedidorEquipamento(IDEQUI, EQUIPAMENTO, conn) { // conn = conexão compartilhada da transação, aberta em cadastraEquipamento

    // Necessario para o SISMA pedir horimetro/hodometro no preenchimento da ficha de abastecimento no modulo MB.

    try{
        var query = "";
        query += "INSERT INTO "
        query += "EQUIPMEDIDOR ( "
        query += "  IDEQUI, "
        query += "  DATAHORA, "
        query += "  CODIMEDI_OLEO, "
        query += "  CODIMEDI_FILTRO, "
        query += "  CODIMEDI_CONSUMO, "
        query += "  CODIMEDI_AMOSTRAGEM, "
        query += "  CODIMEDI_LAVAGEM, "
        query += "  CODIMEDI_CONTROLE "
        query += ") "
        query += "VALUES "
        query += "(?,CONVERT(datetime, ?, 121),?,?,?,?,?,?)";

        executeInsert(query, [
            { type: "int", value: IDEQUI }, // IDEQUI
            { type: "datetime", value: EQUIPAMENTO.DATACHEGADA }, // DATAHORA
            { type: "int", value: EQUIPAMENTO.CODIMEDI }, // COMEDI
            { type: "int", value: EQUIPAMENTO.CODIMEDI }, // COMEDI
            { type: "int", value: EQUIPAMENTO.CODIMEDI }, // COMEDI
            { type: "int", value: EQUIPAMENTO.CODIMEDI }, // COMEDI
            { type: "int", value: EQUIPAMENTO.CODIMEDI }, // COMEDI
            { type: "int", value: EQUIPAMENTO.CODIMEDI }, // COMEDI
        ], conn);
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(typeof error === "string" ? error : JSON.stringify(error));
        }
    }
}
function insereCompartimento(IDEQUI, EQUIPAMENTO, conn) { // conn = conexão compartilhada da transação, aberta em cadastraEquipamento
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
        ], conn);
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
function insereFiltros(IDEQUI, EQUIPAMENTO, conn) { // conn = conexão compartilhada da transação, aberta em cadastraEquipamento
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
        ], conn);
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(typeof error === "string" ? error : JSON.stringify(error));
        }
    }
}
function insereValorLocacaoMensal(IDEQUI, EQUIPAMENTO, conn) { // conn = conexão compartilhada da transação, aberta em cadastraEquipamento

    // A pedido da Central, fazer INSERT na tabela de valores de custo de locação (mensais) dos equipamentos
    // Feito uma inserção (via SISMA/INSERT) inicial, os demais meses/anos é criado automaticamente pelo o SISMA.

    var obra = getObra(EQUIPAMENTO.CODCOLIGADA, EQUIPAMENTO.CODCCUSTO)[0];
    
    try {
        var query = "";
        query += "INSERT INTO "
        query += "CECUSTOLOCA ( "
        query += "  MESANO, "
        query += "  IDEQUI, "
        query += "  CODIDIV3, "
        query += "  CODITIPOLOC, "
        query += "  CODICOTR, "
        query += "  IDADE, "
        query += "  CUSTO_MERCADO_BASE "
        query += ") "
        query += "VALUES "
        query += "(CONVERT(datetime, ?, 121),?,?,?,?,?,?)";

        executeInsert(query, [
            { type: "datetime", value: EQUIPAMENTO.DATACHEGADA },
            { type: "int", value: IDEQUI }, // IDEQUI
            { type: "varchar", value: obra.CODIDIV3 }, // CODIDIV3
            { type: "int", value: '2' }, // CODITIPOLOC
            { type: "int", value: '2' }, // CODICOTR
            { type: "int", value: (new Date().getFullYear() - EQUIPAMENTO.ANOFABRI + 1) }, // IDADE
            { type: "float", value: EQUIPAMENTO.ALUGUEL_CONTRATO }, // CUSTO_MERCADO_BASE que é o mesmo valor que ALUGUEL_CONTRATO
        ], conn);
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(typeof error == "string" ? error : JSON.stringify(error));
        }
    }
}
function insereObservacaoEquip(IDEQUI, EQUIPAMENTO, conn) { // conn = conexão compartilhada da transação, aberta em cadastraEquipamento

    // A pedido da Central, adicionar o link da solicitação atual na Observação do equipamento.

    try {
        var query = "";
        query += "INSERT INTO EQUIPOBSERVACAO "
        query += "( "
        query += "  IDEQUI, "
        query += "  DATAHORAMOV, "
        query += "  OBSERVACAO "
        query += ") "
        query += "VALUES "
        query += "(?, CONVERT(datetime, ?, 121) ,?)";

        executeInsert(query, [
            { type: "int", value: IDEQUI }, // IDEQUI
            { type: "datetime", value: EQUIPAMENTO.DATACHEGADA }, // DATAHORA
            { type: "varchar", value: EQUIPAMENTO.URL_SOLICITACAO }, // Url do processo atual
        ], conn);
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(typeof error === "string" ? error : JSON.stringify(error));
        }
    }
}

function insereCadastroAuxiliar(EQUIPAMENTO, conn) { // conn = conexão compartilhada da transação (para o banco CastilhoCustom)
    try {
        var query = "INSERT INTO EQUIPAMENTOS_CONTRATOS_AUXILIAR (";
        query += "    PREFIXO, ";
        query += "    VALOR_DESMOBILIZACAO, ";
        query += "    UN_DESMOBILIZACAO,";
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
        query += "    (?,?,?,?,?,?,?,?,?,? ,?,?,?,?,?,?) ";

        return executeInsert(query, [
            {type:"varchar", value:EQUIPAMENTO.PREFIXO},//PREFIXO
            {type:"float", value:EQUIPAMENTO.VALOR_DESMOBILIZACAO},//VALOR_DESMOBILIZACAO
            {type:"varchar", value:EQUIPAMENTO.UN_DESMOBILIZACAO},//UN_DESMOBILIZACAO
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
        ], conn);  

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
function insereCaracteristicasTecnicas(IDEQUI, CARACTECNICA, EQUIPAMENTO, conn) { // conn = conexão compartilhada da transação, aberta em cadastraEquipamento
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
                ], conn);



                var query= "";
                query += "INSERT INTO ITEMEQUIPCARTEC (IDEQUI, TIPOCARAC, CODICATC, ITEM, VALOR) VALUES (?,?,?,?,?)";
        
                executeInsert(query, [
                    {type:"int", value:IDEQUI},
                    {type:"int", value:item.TIPOCARAC},
                    {type:"int", value:item.CODICATC},
                    {type:"int", value:item.ITEM},
                    {type:"float", value:String(item.VALOR).replace(",", ".")},
                ], conn);
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
function consultaCombustiveisCadastradosNoModelo(EQUIPAMENTO) {
    try {
        var query = "SELECT ";
        query += "IDMODE, ";
        query += "CODIMATE, ";
        query += "PRINCIPAL ";
        query += "FROM MODELCOMBU ";
        query += "WHERE IDMODE = ? ";

        return executaQuery(query, [
            { type: "int", value: EQUIPAMENTO.IDMODE },
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
function executeInsert(query, constraints, dataSourceOrConn) {
    // O terceiro parâmetro era sempre uma string com o nome do banco (ex: "/jdbc/Sisma").
    // Renomeamos para dataSourceOrConn porque agora pode ser duas coisas:
    //   - Uma string "/jdbc/Sisma" -> comportamento antigo, abre e fecha conexão aqui dentro
    //   - Um objeto de conexão já aberta -> usa ela e NÃO fecha (quem abriu é responsável)

    try {
        log.info("executandoQuery");
        log.info(query);
        log.dir(constraints);

        var ic = new javax.naming.InitialContext();

        // ownConn = true -> veio como string, nós já abrimos a conexão aqui
        // ownConn = false -> veio como conexão já aberta de fora (modo transação)
        var ownConn = typeof dataSourceOrConn === "string";

        if (ownConn) {
            // Comportamento original: busca o banco pelo nome e abre uma conexão nova
            var ds = ic.lookup(dataSourceOrConn);
            conn = ds.getConnection();

        } else {
            // Modo transação: usa a conexão que veio de fora
            // Essa conexão já tem autoCommit=false, então o INSERT fica pendente
            // até o commit() ou roulback() lá em cadastraEquipamento
            conn = dataSourceOrConn;
        }

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
        // Só fecha conexão se foi a gente que abriu (ownConn = true)
        // Se veio de fora (ownConn = false), deixa aberta - quem abriu fecha
        // Fecha antes do commit/rollback cancela a transação inteira, evitando cadastro "quebrado"
        if (ownConn && conn != null) {
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

    var segundos = date.getSeconds();
    if (segundos < 10) {
        segundos = "0" + segundos;
    }    

    var dateTime = [ano, mes, dia].join("-") + " " + hora + ":" + minutos + ":" + segundos;
    return dateTime
}