function createDataset(fields, constraints, sortFields) {
    var newDataset = DatasetBuilder.newDataset();
    newDataset.addColumn("status");
    newDataset.addColumn("mensagem");

    var conn = null;
    var stmt = null;

    try {
        if (!constraints || constraints.length === 0) {
            throw "Constraints não informadas!";
        }

        var prefixo = constraints[0] ? constraints[0].initialValue : null;
        var valorEquipamento = constraints[1] ? constraints[1].initialValue : null;
        var valorFipe = constraints[2] ? constraints[2].initialValue : null;
        var valorImplemento = constraints[3] ? constraints[3].initialValue : null;
        var valorDepreciacao = constraints[4] ? constraints[4].initialValue : null;
        var precoEquipamento = constraints[5] ? constraints[5].initialValue : null;
        var finalizadoEm = constraints[6] ? constraints[6].initialValue : null;
        var classificacaoBem = constraints[7] ? constraints[7].initialValue : null;
       
        if (!prefixo) {
            throw "Constraint obrigatória 'PREFIXO' não informada!";
        }

        var query = "UPDATE EQUIPAMENTOS_CONTRATOS_AUXILIAR SET ";
        var setParts = [];
        var params = [];

        if (valorEquipamento) { setParts.push("VALOR_EQUIPAMENTO = ?"); params.push(valorEquipamento); }
        if (valorFipe) { setParts.push("VALOR_FIPE = ?"); params.push(valorFipe); }
        if (valorImplemento) { setParts.push("VALOR_IMPLEMENTO = ?"); params.push(valorImplemento); }
        if (valorDepreciacao) { setParts.push("VALOR_DEPRECIACAO = ?"); params.push(valorDepreciacao); }
        if (precoEquipamento) { setParts.push("PRECO_EQUIPAMENTO = ?"); params.push(precoEquipamento); }
        if (finalizadoEm) { setParts.push("FINALIZADO_EM = ?"); params.push(finalizadoEm); }
        if (classificacaoBem) { setParts.push("CLASSIFICACAO_BEM = ?"); params.push(classificacaoBem); }
        
        if (setParts.length === 0) {
            throw "Nenhum campo de atualização informado!";
        }

        query += setParts.join(", ") + " WHERE PREFIXO = ?";
        params.push(prefixo);

        log.info("Query final update equipamentos: " + query);
        log.dir(params);

        var ic = new javax.naming.InitialContext();
        var ds = ic.lookup("/jdbc/CastilhoCustom");
        conn = ds.getConnection();
        stmt = conn.prepareStatement(query);

        for (var i = 0; i < params.length; i++) {
            stmt.setString(i + 1, params[i]);
        }

        var updated = stmt.executeUpdate();
        stmt.close();
        conn.close();

        newDataset.addRow(["SUCCESS", "Atualização concluída com sucesso. Registros afetados: " + updated]);

    } catch (e) {
        log.error("❌ Erro no dataset dsUpdateAnaliseEquipamento: " + e);
        newDataset.addRow(["ERRO", e.message || e]);
        if (stmt) stmt.close();
        if (conn) conn.close();
    }

    return newDataset;
}

