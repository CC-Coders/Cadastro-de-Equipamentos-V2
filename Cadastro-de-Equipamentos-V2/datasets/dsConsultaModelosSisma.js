function createDataset(fields, constraints, sortFields) {
    try {
        var constraints = getConstraints(constraints);
        lancaErroSeConstraintsObrigatoriasNaoInformadas(constraints, ["CODIESPE"]);

        var query = "";
        query += "SELECT ";
        query += "   MODELO.IDMODE as ID_MODELO, ";
        query += "   DESCRRESUM as MODELO_RESUMIDO, ";
        query += "   DESCRCOMPL as MODELO, ";
        query += "   FABRICANTE.CODIFABR as ID_FABRICANTE, ";
        query += "   FABRICANTE.DESCRICAO as FABRICANTE, ";
        query += "   CLASSMECAN.CODICLME as ID_CLASSEMECANICA, ";
        query += "   CLASSMECAN.DESCRICAO as CLASSEMECANICA, ";
        query += "   CLASSOPERA.IDCLOP as ID_CLASSEOPERACIONAL, ";
        query += "   CLASSOPERA.DESCRICAO as CLASSEOPERACIONAL, ";
        query += "   POTENCIAHP,";
		query += "   ITEMCARACTEC.DESCRICAO,";
		query += "   UNIDADE.DESCRICAO as UNIDADE, ";
		query += "   MODELO.CODIESPE as CODIESPE ";
        query += "FROM ";
        query += "   MODELO ";
        query += "   INNER JOIN FABRICANTE ON FABRICANTE.CODIFABR = MODELO.CODIFABR ";
        query += "   INNER JOIN CLASSMECAN ON CLASSMECAN.CODICLME = MODELO.CODICLME ";
        query += "   INNER JOIN CLASSOPERA ON CLASSOPERA.IDCLOP = MODELO.IDCLOP ";
		query += "   LEFT JOIN ITEMMODCARTEC ON MODELO.IDMODE = ITEMMODCARTEC.IDMODE ";
		query += "   LEFT JOIN ITEMCARACTEC ON ITEMCARACTEC.ITEM = ITEMMODCARTEC.ITEM ";
		query += "   LEFT JOIN UNIDADE ON ITEMCARACTEC.CODIUNID = UNIDADE.CODIUNID ";
        query += "WHERE ";
        query += "   MODELO.CODIINES = 0 ";
        query += "   AND MODELO.CODIESPE = ? ";
        query += "   AND MODELO.CODIMODE <> 0 "; // Não retorna um modelo inválido ( "Não informado" ) do SISMA
        query += "   AND MODELO.DESCRRESUM NOT LIKE 'PE%' ";

        var retorno = executaQuery(query, [
            { type: "int", value: constraints.CODIESPE }
        ], "/jdbc/Sisma");
        return returnDataset("SUCCESS","",JSON.stringify(retorno));

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
function executaQuery(query, constraints, dataSorce) {
    try {
        var dataSource = dataSorce;
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