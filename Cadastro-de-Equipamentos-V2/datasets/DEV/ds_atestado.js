function createDataset(fields, constraints, sortFields) {
	
    var newDataset = DatasetBuilder.newDataset();    
    var chapa = constraints[0].initialValue;  
    var obra = constraints[1].initialValue; 
    var coligada = constraints[2].initialValue;
    log.error("Obra: "+ obra);
    log.error("Chapa: "+ chapa);    
    log.error("Coligada:"+ coligada)
    
//    var selectQuery = "SELECT PFUNC.CHAPA as chapa, " +
//    "PFUNC.NOME as nome, " +
//    "PFUNCAO.NOME as funcao," +
//    "PSECAO.NROCENCUSTOCONT as obra " +
//    "FROM PFUNC " +
//    "INNER JOIN PSECAO ON PFUNC.CODCOLIGADA = PSECAO.CODCOLIGADA AND PFUNC.CODSECAO = PSECAO.CODIGO " +
//    "INNER JOIN PFUNCAO ON PFUNC.CODCOLIGADA = PFUNCAO.CODCOLIGADA AND PFUNC.CODFUNCAO = PFUNCAO.CODIGO " +
//    "WHERE PFUNC.CODSITUACAO <> 'D' AND PFUNC.CODCOLIGADA = 1 AND PFUNC.CHAPA = '"+ chapa + "' AND PSECAO.NROCENCUSTOCONT = '" + obra + "'"
    
    var selectQuery = "SELECT PFUNC.CHAPA as chapa, " +
    "PFUNC.NOME as nome, " +
    "PFUNCAO.NOME as funcao," +
    "PSECAO.NROCENCUSTOCONT as obra " +
    "FROM PFUNC " +
    "INNER JOIN PSECAO ON PFUNC.CODCOLIGADA = PSECAO.CODCOLIGADA AND PFUNC.CODSECAO = PSECAO.CODIGO " +
    "INNER JOIN PFUNCAO ON PFUNC.CODCOLIGADA = PFUNCAO.CODCOLIGADA AND PFUNC.CODFUNCAO = PFUNCAO.CODIGO " +
    "WHERE PFUNC.CODSITUACAO <> 'D' AND PFUNC.CODCOLIGADA = '"+ coligada+"' AND PFUNC.CHAPA = '"+ chapa + "' AND PSECAO.NROCENCUSTOCONT = '" + obra + "'"
    
    var dataSource = "/jdbc/RM";
    var ic = new javax.naming.InitialContext();
    var ds = ic.lookup(dataSource);
    var conn = null;
    var stmt = null;
    var rs = null;

    try {
        conn = ds.getConnection();
        stmt = conn.createStatement();
        rs = stmt.executeQuery(selectQuery);
        var columnCount = rs.getMetaData().getColumnCount();

        if (columnCount > 0) {
            for (var i = 1; i <= columnCount; i++) {
                newDataset.addColumn(rs.getMetaData().getColumnName(i));
            }

            while (rs.next()) {
                var arr = new Array();
                for (var i = 1; i <= columnCount; i++) {
                    var obj = rs.getObject(rs.getMetaData().getColumnName(i));
                    if (null != obj) {
                        arr[i - 1] = rs.getObject(rs.getMetaData().getColumnName(i)).toString();
                    } else {
                        arr[i - 1] = "null";
                    }
                }
                newDataset.addRow(arr);
            }
        }
    } catch (error) {
        log.error(error.message);
    } finally {
        if (rs != null) {
            rs.close();
        }
        if (stmt != null) {
            stmt.close();
        }
        if (conn != null) {
            conn.close();
        }
    }

    return newDataset;
}

//function PfuncQuery(chapa, obra) {
//    var query =  "SELECT PFUNC.CHAPA as chapa, " +
//    "PFUNC.NOME as nome, " +
//    "PFUNCAO.NOME as funcao," +
//    "PSECAO.NROCENCUSTOCONT as obra " +
//    "FROM PFUNC " +
//    "INNER JOIN PSECAO ON PFUNC.CODCOLIGADA = PSECAO.CODCOLIGADA AND PFUNC.CODSECAO = PSECAO.CODIGO " +
//    "INNER JOIN PFUNCAO ON PFUNC.CODCOLIGADA = PFUNCAO.CODCOLIGADA AND PFUNC.CODFUNCAO = PFUNCAO.CODIGO " +  
//    "WHERE PFUNC.TEMPRAZOCONTR = 1 AND PFUNC.CODSITUACAO <> 'D' AND PFUNC.CODCOLIGADA = 1 AND PFUNC.CHAPA = '"+ chapa + "' AND PSECAO.NROCENCUSTOCONT = '" + obra + "'";
//
//    log.info("query ta retornando: " + query)
//    return query;
//}
