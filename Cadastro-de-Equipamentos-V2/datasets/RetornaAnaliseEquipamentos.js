
function createDataset(fields, constraints, sortFields) {

    try {
        var params = getConstraints(constraints);
        log.info("🧩 Constraints recebidas: " + JSON.stringify(params));

        var myQuery = `
           SELECT 
    TCNT_AUXILIAR.ID_FLUIG,
    TCNT_AUXILIAR.TIPO_CONTRATO,
    TCNT_AUXILIAR.*,
    ML001121.*,
    STATUS_EQUIPAMENTOS.DESC_STATUS_EQUIPAMENTO,
    STATUS_EQUIPAMENTOS.STATUS as STATUS_EQUIP_ITEM,
    EQ_AUX.FINALIZADO_EM
FROM TCNT_AUXILIAR
INNER JOIN (
    SELECT DISTINCT 
        ID_TCNT_AUXILIAR, 
        STATUS,
        VIEW_EQUIPAMENTOS_CONTRATOS.DESC_STATUS_EQUIPAMENTO
    FROM TCNT_AUXILIAR_ITENS
    INNER JOIN VIEW_EQUIPAMENTOS_CONTRATOS 
        ON TCNT_AUXILIAR_ITENS.PREFIXO = VIEW_EQUIPAMENTOS_CONTRATOS.PREFIXO 
        COLLATE SQL_Latin1_General_CP1_CI_AS
) AS STATUS_EQUIPAMENTOS 
    ON STATUS_EQUIPAMENTOS.ID_TCNT_AUXILIAR = TCNT_AUXILIAR.ID
LEFT JOIN (
    SELECT 
        TCNT_AUXILIAR_ITENS.ID_TCNT_AUXILIAR,
        MAX(EQUIPAMENTOS_CONTRATOS_AUXILIAR.FINALIZADO_EM) AS FINALIZADO_EM
    FROM TCNT_AUXILIAR_ITENS
    INNER JOIN EQUIPAMENTOS_CONTRATOS_AUXILIAR
        ON TCNT_AUXILIAR_ITENS.PREFIXO = EQUIPAMENTOS_CONTRATOS_AUXILIAR.PREFIXO
        COLLATE SQL_Latin1_General_CP1_CI_AS
    GROUP BY TCNT_AUXILIAR_ITENS.ID_TCNT_AUXILIAR
) AS EQ_AUX
    ON EQ_AUX.ID_TCNT_AUXILIAR = TCNT_AUXILIAR.ID
INNER JOIN [fluig_desenvolvimento].dbo.ML001121 
    ON TCNT_AUXILIAR.ID_FLUIG = ML001121.numProces

        `;
        var whereParts = [];
        var i = 0;

        for (var campo in params) {
            var valor = params[campo];

            if (valor == null || valor === "") continue;


            if (campo === "ID_FLUIG") {
                whereParts.push("TCNT_AUXILIAR.ID_FLUIG = '" + valor + "'");
            } else if (campo === "solicitante") {
                whereParts.push("ML001121.solicitante LIKE '%" + valor + "%'");
            } else if (campo === "obra") {
                whereParts.push("ML001121.obra LIKE '%" + valor + "%'");
            } else if (campo === "DATA_ABERTURA" || campo === "dataAberturaSol") {              
                whereParts.push("ML001121.dataAberturaSol = '" + valor + "'");
            } else if (campo === "CRIADO_EM") {
                whereParts.push("ML001121.criadoEm = '" + valor + "'");
            } else if (campo === "FINALIZADO_EM") {
                whereParts.push("ML001121.finalizadoEm = '" + valor + "'");
            } else {
                whereParts.push(campo + " LIKE '%" + valor + "%'");
            }
            i++;
        }

        if (whereParts.length > 0) {
            myQuery += " WHERE " + whereParts.join(" AND ");
        }

        log.info("🔍 Query final montada:");
        log.info(myQuery);

        var retorno = executaQuery(myQuery, [], "/jdbc/CastilhoCustom");
        if (retorno.length > 0) log.info("🧾 Exemplo linha[0]: " + JSON.stringify(retorno[0]));

        return returnDataset("SUCCESS", "", JSON.stringify(retorno));

    } catch (error) {
        log.error("❌ ERRO DATASET DSAnaliseEquipamentos: " + error);
        if (typeof error === "object") {
            var mensagem = "";
            for (var k in error) { mensagem += k + ": " + error[k] + " - "; }
            log.error(mensagem);
            log.dir(error);
            return returnDataset("ERRO", mensagem, null);
        } else {
            return returnDataset("ERRO", String(error), null);
        }
    }
}


function getConstraints(constraints) {
    var retorno = {};
    if (constraints != null) {
        for (var i = 0; i < constraints.length; i++) {
            var c = constraints[i];
            var name = c.fieldName || c._field || c.field || c._fieldName;
            var val = c.initialValue;
            retorno[name] = val;
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
            var campo = listConstrainstObrigatorias[i];
            if (!constraints[campo]) {
                retornoErro.push(campo);
            }
        }
        if (retornoErro.length > 0) {
            throw "Constraints obrigatórias não informadas (" + retornoErro.join(", ") + ")";
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
            } else if (val.type == "float") {
                stmt.setFloat(counter, val.value);
            } else if (val.type == "date" || val.type == "datetime") {
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
        try { if (stmt != null) stmt.close(); } catch (ex) { log.error("Erro fechar stmt: " + ex); }
        try { if (conn != null) conn.close(); } catch (ex) { log.error("Erro fechar conn: " + ex); }
    }
}

