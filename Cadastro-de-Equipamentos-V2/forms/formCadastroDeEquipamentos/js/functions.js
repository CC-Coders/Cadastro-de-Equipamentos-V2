function promiseBuscaModelosDeEquipamentosDoSisma(){
    return new Promise((resolve, reject)=>{
        DatasetFactory.getDataset("dsConsultaModelosSisma",null,null,null,{
            success:ds=>{
                if (ds.values[0].STATUS != "SUCCESS") {
                    reject(ds.values[0].MENSAGEM);
                }else{
                    resolve(JSON.parse(ds.values[0].RESULT));
                }
            },
            error:error=>{
                reject(error);
            }
        });
    });
}
function preencheOptionsDosModelos(){
    var html = "<option></option>";
    html+= modelos.map(e=> `<option value="${e.ID_MODELO}">${e.MODELO}</option>`).join("");
    $("#modelo").html(html);
    $("#modelo").selectize({
        onChange: async function (value, isOnInitialize) {
            preencheInformacoesDoModelo(value);
        }
    });
}
function preencheInformacoesDoModelo(ID_MODELO){
    if (!ID_MODELO) {
        $("#fabricante").val("");
        $("#classeMecanica").val("");
        $("#classOperacional").val("");
        $("#potenciaMotor").val("");
    }

    var found = modelos.find(e=> e.ID_MODELO == ID_MODELO);
    if (!found) {
        throw "Modelo não encontrado";
    }


    $("#fabricante").val(found.FABRICANTE);
    $("#classeMecanica").val(found.CLASSEMECANICA);
    $("#classOperacional").val(found.CLASSEOPERACIONAL);
    $("#potenciaMotor").val(found.POTENCIAHP);
}


function preenchePermissoesDoUsuario(){
    permissoes = buscaObrasPorPermissaoDoUsuario($("#userCode").val());
    var coligadas = Array.from(
        new Map(permissoes.map(e => [e.CODCOLIGADA, { NOME: e.NOMEFANTASIA, CODIGO: e.CODCOLIGADA }])).values()
    );

    $("#coligada")[0].selectize.addOption(coligadas.map(e=>{return {value:`${e.CODIGO} - ${e.NOME}`, text:`${e.CODIGO} - ${e.NOME}`}}));
}
function preencheObras(CODCOLIGADA){
    $("#obra")[0].selectize.clearOptions();
    var obras = permissoes.filter(e=>e.CODCOLIGADA==CODCOLIGADA);
    $("#obra")[0].selectize.addOption(obras.map(e=>{return {value:`${e.CODCCUSTO} - ${e.perfil}`, text:`${e.CODCCUSTO} - ${e.perfil}`}}));
}


function buscaFornecedores(){
    return new Promise((resolve, reject)=>{
        DatasetFactory.getDataset("FCFO", ["CODCFO", "CGCCFO", "NOMEFANTASIA"], [
            DatasetFactory.createConstraint("ATIVO", 1, 1, ConstraintType.MUST),
            DatasetFactory.createConstraint("CODCOLIGADA", 0, 0, ConstraintType.MUST)
        ], null, {
            success:ds=>{
                resolve(ds.values);
            },
            error:error=>{
                reject(error)  ;
            }
        });
    });
}
async function insereOptionsDosFornecedores(){
    var fornecedores = await buscaFornecedores();
    $("#fornecedor")[0].selectize.addOption(fornecedores.map(e=>{return {value:`${e.CODCFO}`, text:`${e.CGCCFO} - ${e.NOMEFANTASIA}`}}));
}