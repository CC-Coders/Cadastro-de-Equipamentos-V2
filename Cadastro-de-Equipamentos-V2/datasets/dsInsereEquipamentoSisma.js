function createDataset(fields, constraints, sortFields) {
    try {
        var constraints = getConstraints(constraints);
        lancaErroSeConstraintsObrigatoriasNaoInformadas(constraints, ["PREFIXO"]);

        var IDEQUI = geraNovoIDEQUI();

        insereEquipamento(IDEQUI, constraints.PREFIXO);
        insereTransfdiv3(IDEQUI);
       

        return returnDataset("SUCCESS","", IDEQUI);
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


function geraNovoIDEQUI(){
    var query = "(SELECT MAX(IDEQUI) + 1 as IDEQUI FROM EQUIPAMENTO)";
    var retorno = executaQuery(query,[],"/jdbc/Sisma");
    log.dir(retorno);
    return retorno[0].IDEQUI;
}
function insereEquipamento(IDEQUI, PREFIXO){
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
        query += " CODIINES)";//STATUS
        query += " VALUES ";
        query += "(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        
        var retorno = executeInsert(query, [
            {type:"int",value:IDEQUI},//IDEQUI
            {type:"int",value:"0"},//CODITERC
            {type:"int",value:"1"},//CODIESPE
            {type:"varchar",value:PREFIXO},//Prefixo
            {type:"int",value:"2"},//CODIDIV2
            {type:"int",value:"104"},//CODIDIV3
            {type:"int",value:"2"},//CODIMEDI
            {type:"int",value:"1795"},//IDMODE
            {type:"int",value:"1"},//CODICLME
            {type:"int",value:"152"},//IDCLOP
            {type:"int",value:"15"},//CODIFABR
            {type:"varchar",value:"123456"},//NUMECHAS
            {type:"int",value:"2019"},//ANOFABRI
            {type:"int",value:"2019"},//ANOMODELO
            {type:"int",value:"1"},//DIV2CONTA
            {type:"varchar",value:"1.3.01"},//CODICONTA
            {type:"int",value:"1"},//DIV2CCUSTOMB
            {type:"varchar",value:"1.2.023"},//CODICCUSTOMB
            {type:"int",value:"1"},//DIV2CCUSTOOP
            {type:"varchar",value:"1.2.023"},//CODICCUSTOOP
            {type:"int",value:"123456"},//NUMEBEM
            {type:"int",value:"10"},//POTENCIAHP
            {type:"int",value:"1236"},//CODIPROP
            {type:"varchar",value:"Cadastro teste via integração"},//DESCRICAO
            {type:"float",value:"1200"},//ALUGUEL_CONTRATO
            {type:"varchar",value:"123456"},//NUMSERIE
            {type:"int",value:"0"},//CODIPAIS
            {type:"int",value:"0"},//SIGLAUF
            {type:"int",value:"56"},//CODIUSU
            {type:"varchar",value:PREFIXO},//ORDENA
            {type:"int",value:"0"},//CODIINES
        ], "/jdbc/Sisma");

        log.info("dsInsereEquipamentoSisma executou insert");
        log.dir(retorno);
        return retorno;
}
function insereTransfdiv3(IDEQUI){
    var query = "";
    query += "INSERT INTO TRANSFDIV3 ";
    query += "(IDEQUI, DATAHORA, NUMEDOCU, CODIDIV3, INSTDIG, CODIUSU_DIG) ";
    query += "VALUES ";
    query += "(?,?,?,?,?,?)";

    executeInsert(query, [
        {type:"int", value:IDEQUI},
        {type:"datetime", value:"2025-10-01 00:00:00.000"},
        {type:"int", value:"0"},
        {type:"int", value:"104"},
        {type:"datetime", value:"2025-10-01 13:06:55.000"},
        {type:"int", value:"56"},
    ], "/jdbc/Sisma");
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
            throw "Constraints obrigatorias nao informadas (" + retornoErro.join(", ") + ")";
        }
    } catch (error) {
        throw error;
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

    } catch (e) {
        log.error("ERRO==============> " + e.message);
        throw e;
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
    var dataSource = dataSource;
    var ic = new javax.naming.InitialContext();
    var ds = ic.lookup(dataSource);

    log.info("executandoQuery");
    log.info(query);
    log.dir(constraints);
    try {
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
    } catch (e) {
        log.error("ERRO==============> " + e.message);
        throw e;
    } finally {
        if (stmt != null) {
            stmt.close();
        }
        if (conn != null) {
            conn.close();
        }
    }
}