
function createDataset(fields, constraints, sortFields) {
    try {
        var constraints = getConstraints(constraints);

        if (!constraints || constraints.length === 0) {
            throw "Constraints não informadas!";
        }

        var prefixo = constraints.PREFIXO;
        var modo = constraints.MODO;

        if (!prefixo) {
            throw "Constraint obrigatória 'PREFIXO' não informada!";
        }

        var quantidadeRetorno = null;

        if (modo == "EDITAR_APENAS_STATUS") {
            var status = constraints.STATUS;
            var usuarioAnalise = constraints.USUARIO_ANALISE;

            if (!status) {
                throw "Constraint 'STATUS' obrigatória para edição apenas de status!";
            }

            var query = "UPDATE EQUIPAMENTOS_CONTRATOS_AUXILIAR SET STATUS = ?, USUARIO_ANALISE = ? WHERE PREFIXO = ?";

            quantidadeRetorno = executeInsert(query, [
                {type:"int", value:status},
                {type:"string", value:usuarioAnalise},
                {type:"string", value:prefixo},
            ], "/jdbc/CastilhoCustom");

        } else if (modo == "EDITAR_TUDO") {
            var valorEquipamento = constraints.VALOR_EQUIPAMENTO;
            var valorFipe = constraints.VALOR_FIPE;
            var valorImplemento = constraints.VALOR_IMPLEMENTO;
            var valorDepreciacao = constraints.VALOR_DEPRECIACAO;
            var precoEquipamento = constraints.PRECO_EQUIPAMENTO;
            var finalizadoEm = constraints.FINALIZADO_EM;
            var classificacaoBem = constraints.CLASSIFICACAO_BEM;
            var negociacaoSuprimentos = constraints.NEGOCIACAO_SUPRIMENTOS;
            var status = constraints.STATUS;
            var usuarioAnalise = constraints.USUARIO_ANALISE;

            var setParts = [];
            var valuesList = [];

            if (valorEquipamento) { setParts.push("VALOR_EQUIPAMENTO = ?"); valuesList.push({ type: "float", value: valorEquipamento }); }
            if (valorFipe) { setParts.push("VALOR_FIPE = ?"); valuesList.push({ type: "float", value: valorFipe }); }
            if (valorImplemento) { setParts.push("VALOR_IMPLEMENTO = ?"); valuesList.push({ type: "float", value: valorImplemento }); }
            if (valorDepreciacao) { setParts.push("VALOR_DEPRECIACAO = ?"); valuesList.push({ type: "float", value: valorDepreciacao }); }
            if (precoEquipamento) { setParts.push("PRECO_EQUIPAMENTO = ?"); valuesList.push({ type: "float", value: precoEquipamento }); }
            if (finalizadoEm) { setParts.push("FINALIZADO_EM = ?"); valuesList.push({ type: "date", value: finalizadoEm }); }
            if (classificacaoBem) { setParts.push("CLASSIFICACAO_BEM = ?"); valuesList.push({ type: "float", value: classificacaoBem }); }
            if (negociacaoSuprimentos) { setParts.push("NEGOCIACAO_SUPRIMENTOS = ?"); valuesList.push({ type: "string", value: negociacaoSuprimentos }); }
            if (status) { setParts.push("STATUS = ?"); valuesList.push({ type: "int", value: status }); }
            if (usuarioAnalise) { setParts.push("USUARIO_ANALISE = ?"); valuesList.push({ type: "string", value: usuarioAnalise }); }

            if (setParts.length === 0) {
                throw "Nenhum campo de atualização informado!";
            }

            query = "UPDATE EQUIPAMENTOS_CONTRATOS_AUXILIAR SET " + setParts.join(", ") + " WHERE PREFIXO = ?";
            valuesList.push({type:"string",value: prefixo});

            
            quantidadeRetorno = executeInsert(query, valuesList, "/jdbc/CastilhoCustom");

        } else {
            throw "Modo inválido: " + modo;
        }

        log.info("Query final update equipamentos: " + query);

        if (modo == "EDITAR_APENAS_STATUS") {
            return returnDataset("SUCCESS", "Equipamento liberado para análise com sucesso!", "");
        } else {
            return returnDataset("SUCCESS", "Atualização concluída com sucesso. Registros afetados: " + quantidadeRetorno, "");
        }
    } catch (e) {
        log.error("❌ Erro no dataset dsUpdateAnaliseEquipamento: " + e);
        return returnDataset("ERRO", e.message || e, "");
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
function executeInsert(query, constraints, dataSource) {
    try {
        log.info("executandoQuery");
        log.info(query);
        log.dir(constraints);

        // var dataSource = dataSource;
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


        var resultCount = stmt.executeUpdate();
        return  resultCount;
        
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
function returnDataset(STATUS, MENSAGEM, RESULT) {
    var dataset = DatasetBuilder.newDataset();
    dataset.addColumn("STATUS");
    dataset.addColumn("MENSAGEM");
    dataset.addColumn("RESULT");
    dataset.addRow([STATUS, MENSAGEM, RESULT]);
    return dataset;
}