function createDataset(fields, constraints, sortFields) {
    var conn = null, stmt = null;
    try {
        if (!constraints || constraints.length === 0) {
            throw "Constraint obrigatória 'ID_TCNT_AUXILIAR' não informada!";
        }

        var idContrato = constraints[0].initialValue; 
        log.info("ID do contrato recebido: " + idContrato);

        if (!idContrato) {
            throw "Constraint obrigatória 'ID_TCNT_AUXILIAR' não informada!";
        }

        var myQuery = "SELECT DISTINCT " +
        "TCNT_AUXILIAR_ITENS.ID_TCNT_AUXILIAR, " +
        "VIEW_EQUIPAMENTOS_CONTRATOS.STATUS, " +
        "TCNT_AUXILIAR_ITENS.PREFIXO, " +
        "VIEW_EQUIPAMENTOS_CONTRATOS.DESCRICAO, " +
        "VIEW_EQUIPAMENTOS_CONTRATOS.FABRICANTE, " +
        "VIEW_EQUIPAMENTOS_CONTRATOS.MODELO, " +
        "VIEW_EQUIPAMENTOS_CONTRATOS.MAODEOBRA, " +
        "VIEW_EQUIPAMENTOS_CONTRATOS.VALOR_LOCACAO, " +
        "VIEW_EQUIPAMENTOS_CONTRATOS.VALOR_FIPE, " +
        "VIEW_EQUIPAMENTOS_CONTRATOS.VALOR_IMPLEMENTO, " +
        "VIEW_EQUIPAMENTOS_CONTRATOS.VALOR_EQUIPAMENTO, " +
        "VIEW_EQUIPAMENTOS_CONTRATOS.NEGOCIACAO_SUPRIMENTOS " +
        "FROM TCNT_AUXILIAR_ITENS " +
        "LEFT JOIN VIEW_EQUIPAMENTOS_CONTRATOS " +
        "ON TCNT_AUXILIAR_ITENS.PREFIXO = VIEW_EQUIPAMENTOS_CONTRATOS.PREFIXO COLLATE SQL_Latin1_General_CP1_CI_AS " +
        "WHERE TCNT_AUXILIAR_ITENS.ID_TCNT_AUXILIAR = '" + idContrato + "'";

        log.info("🔎 Executando query PAOLA: " + myQuery);

        var ic = new javax.naming.InitialContext();
        var ds = ic.lookup("/jdbc/CastilhoCustom");
        conn = ds.getConnection();
        stmt = conn.prepareStatement(myQuery);

        var rs = stmt.executeQuery();
        var columnCount = rs.getMetaData().getColumnCount();
        var dataset = DatasetBuilder.newDataset();

        for (var i = 1; i <= columnCount; i++) {
            dataset.addColumn(rs.getMetaData().getColumnName(i));
        }

        while (rs.next()) {
            var row = [];
            for (var j = 1; j <= columnCount; j++) {
                row.push(String(rs.getObject(j) || ""));
            }
            dataset.addRow(row);
        }

        return dataset;

    } catch (e) {
        log.error("❌ Erro ao executar dataset: " + e);
        var dsError = DatasetBuilder.newDataset();
        dsError.addColumn("ERRO");
        dsError.addRow([String(e)]);
        return dsError;
    } finally {
        try { if (stmt) stmt.close(); } catch (e) {}
        try { if (conn) conn.close(); } catch (e) {}
    }
}
