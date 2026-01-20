
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
        var modo = constraints[1] ? constraints[1].initialValue : null;

        if (!prefixo) {
            throw "Constraint obrigatória 'PREFIXO' não informada!";
        }

        var query = "";
        var params = [];

        if (modo == "EDITAR_APENAS_STATUS") {
            var status = constraints[2] ? constraints[2].initialValue : null;
            var usuarioAnalise = constraints[3] ? constraints[3].initialValue : null; // 👈 Novo campo

            if (!status) {
                throw "Constraint 'STATUS' obrigatória para edição apenas de status!";
            }

            query = "UPDATE EQUIPAMENTOS_CONTRATOS_AUXILIAR SET STATUS = ?, USUARIO_ANALISE = ? WHERE PREFIXO = ?";
            params.push(parseInt(status));
            params.push(usuarioAnalise); 
            params.push(prefixo);
        } else if (modo == "EDITAR_TUDO") {
            var valorEquipamento = constraints[2] ? constraints[2].initialValue : null;
            var valorFipe = constraints[3] ? constraints[3].initialValue : null;
            var valorImplemento = constraints[4] ? constraints[4].initialValue : null;
            var valorDepreciacao = constraints[5] ? constraints[5].initialValue : null;
            var precoEquipamento = constraints[6] ? constraints[6].initialValue : null;
            var finalizadoEm = constraints[7] ? constraints[7].initialValue : null;
            var classificacaoBem = constraints[8] ? constraints[8].initialValue : null;
            var negociacaoSuprimentos = constraints[9] ? constraints[9].initialValue : null;

            var setParts = [];

            if (valorEquipamento) { setParts.push("VALOR_EQUIPAMENTO = ?"); params.push(valorEquipamento); }
            if (valorFipe) { setParts.push("VALOR_FIPE = ?"); params.push(valorFipe); }
            if (valorImplemento) { setParts.push("VALOR_IMPLEMENTO = ?"); params.push(valorImplemento); }
            if (valorDepreciacao) { setParts.push("VALOR_DEPRECIACAO = ?"); params.push(valorDepreciacao); }
            if (precoEquipamento) { setParts.push("PRECO_EQUIPAMENTO = ?"); params.push(precoEquipamento); }
            if (finalizadoEm) { setParts.push("FINALIZADO_EM = ?"); params.push(finalizadoEm); }
            if (classificacaoBem) { setParts.push("CLASSIFICACAO_BEM = ?"); params.push(classificacaoBem); }
            if (negociacaoSuprimentos) { setParts.push("NEGOCIACAO_SUPRIMENTOS = ?"); params.push(negociacaoSuprimentos); }

            if (setParts.length === 0) {
                throw "Nenhum campo de atualização informado!";
            }

            query = "UPDATE EQUIPAMENTOS_CONTRATOS_AUXILIAR SET " + setParts.join(", ") + " WHERE PREFIXO = ?";
            params.push(prefixo);

        } else {
            throw "Modo inválido: " + modo;
        }

        log.info("Query final update equipamentos: " + query);
        log.dir(params);

        var ic = new javax.naming.InitialContext();
        var ds = ic.lookup("/jdbc/CastilhoCustom");
        conn = ds.getConnection();
        stmt = conn.prepareStatement(query);

//        for (var i = 0; i < params.length; i++) {
//            if (typeof params[i] === "number") {
//                stmt.setInt(i + 1, params[i]);
//            } else {
//                stmt.setString(i + 1, params[i]);
//            }
//        }
        for (var i = 0; i < params.length; i++) {

            var value = params[i];

            // Se for NUMBER → Int
            if (typeof value === "number") {
                stmt.setBigDecimal(i + 1, new java.math.BigDecimal(String(value)));
                continue;
            }

            // Se for data no formato YYYY-MM-DD → DATE
            if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                stmt.setDate(i + 1, java.sql.Date.valueOf(value));
                continue;
            }

            // Padrão → String
            stmt.setString(i + 1, value);
        }

        var updated = stmt.executeUpdate();
        stmt.close();
        conn.close();

      //  newDataset.addRow(["SUCCESS", "Atualização concluída com sucesso. Registros afetados: " + updated]);
        if (modo == "EDITAR_APENAS_STATUS" || modo === "EDITAR_APENAS_STATUS") {
            newDataset.addRow(["SUCCESS", "Equipamento liberado para análise com sucesso!"]);
        } else {
            newDataset.addRow(["SUCCESS", "Atualização concluída com sucesso. Registros afetados: " + updated]);
        }
    } catch (e) {
        log.error("❌ Erro no dataset dsUpdateAnaliseEquipamento: " + e);
        newDataset.addRow(["ERRO", e.message || e]);
        if (stmt) stmt.close();
        if (conn) conn.close();
    }

    return newDataset;
}

