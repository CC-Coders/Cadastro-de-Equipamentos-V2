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
        
        $("#IDMODE").val("");
        $("#CODICLME").val("");
        $("#IDCLOP").val("");
        $("#CODIFABR").val("");
        $("#CODIFABR").val("");
        $("#CODIESPE").val("");
    }

    var found = modelos.find(e=> e.ID_MODELO == ID_MODELO);
    if (!found) {
        throw "Modelo não encontrado";
    }


    $("#fabricante").val(found.FABRICANTE);
    $("#classeMecanica").val(found.CLASSEMECANICA);
    $("#classOperacional").val(found.CLASSEOPERACIONAL);
    $("#potenciaMotor").val(found.POTENCIAHP);

    $("#IDMODE").val(found.IDMODE);
    $("#CODICLME").val(found.CODICLME);
    $("#IDCLOP").val(found.IDCLOP);
    $("#CODIFABR").val(found.CODIFABR);
    $("#CODIFABR").val(found.CODIFABR);
    $("#CODIESPE").val(found.CODIESPE);
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
        DatasetFactory.getDataset("FCFO", [], [
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
    $("#fornecedor")[0].selectize.addOption(fornecedores.map(e=>{return {value:`${e.CODCFO} - ${e.CGCCFO}`, text:`${e.CGCCFO} - ${e.NOMEFANTASIA}`}}));
}

function buscaEnderecoFornecedor(CGCCFO){
    return new Promise((resolve, reject)=>{
        DatasetFactory.getDataset("RetornaEnderecoFornecedor", null, [
            DatasetFactory.createConstraint("CGCCFO", CGCCFO, CGCCFO, ConstraintType.MUST)
        ], null, {
            success:ds=>{
                if (ds.values.length == 0) {
                    reject("Nenhum fornecedor encontrado");
                }

                resolve(ds.values[0]);
            },
            error:error=>{
                reject(error);
            }
        });
    });
}

// Anexos
function anexarDocumento(){
    $("#inputFile").click();
}

async function loadFile(file) {
    try {
        const tipoAnexo = $("#tipoAnexo").val();
        var divTarget = "";
        if (tipoAnexo == "Documentação do Equipamento") {
            divTarget = "#divListaAnexosDocumentacaoEquipamento";
        }
        else if (tipoAnexo == "Foto do Equipamento") {
            divTarget = "#divListaAnexosFotoEquipamento";
        }
        else if (tipoAnexo == "Laudo Técnico") {
            divTarget = "#divListaAnexosLaudo";
        }
        else if (tipoAnexo == "Plano de Manutenção") {
            divTarget = "#divListaAnexosPlanoManutencao";
        }
        else if (tipoAnexo == "ART") {
            divTarget = "#divListaAnexosART";
        }


        var target = await insereCarregandoAnexo(divTarget);
        const parentId = pastaAnexosEquipamento[env];
        const name = file.name;
        const documentId = await promiseCriaDocFluig_retornaDocumentId(file, parentId);


        $(divTarget).append(await htmlNovoAnexo(documentId, name));
        
        
        if($(divTarget).find(".btnAnexo").length > 0){
            $(divTarget).siblings("span").text("✅");
        }else{
            $(divTarget).siblings("span").text("❌");
        }


        $(target).remove();
        $(divTarget).find(".btnDeletarAnexo:last").off("click").on("click", function () {
            var target = $(this);
            FLUIGC.message.confirm({
                message: 'Deseja excluir esse anexo?',
                title: '',
                labelYes: 'Sim',
                labelNo: 'Não'
            }, function (result, el, ev) {
                if (result) {
                    $(target).closest(".btnAnexo").remove();
                }
            });
        });
    } catch (error) {
        throw error;
    }

    async function insereCarregandoAnexo(divTarget) {
        $(divTarget).append(await htmlNovoAnexo("#", "Carregando..."));
        return $(divTarget).find(".btnAnexo:last");
    }
}


async function htmlNovoAnexo(documentId, documentName){
    var html = 
    `<div class="btn btn-default btnAnexo">
        <b><a target="_blank" href=${documentId == "#"? "#": await promiseBuscaDownloadUrlDocumentoNoFLuig(documentId)}>${documentName}</a></b>
        <button class="btn btnDeletarAnexo">
            <i class="flaticon flaticon-close icon-xs" aria-hidden="true"></i>
        </button>
    </div>`;

    console.log(html);
    return html;
}

// Utils
function getServerURL() {
    var ds = DatasetFactory.getDataset("dsGetServerURL", null, null, null);
    return ds.values[0].URL;
}
function promiseCriaDocFluig_retornaDocumentId(file, parentId) {
    return new Promise((resolve, reject) => {
        var reader = new FileReader();
        var fileName = file.name;

        reader.readAsDataURL(file);
        reader.onload = function (e) {
            var bytes = e.target.result.split("base64,")[1];

            // Chama Dataset de Criação de Documento
            DatasetFactory.getDataset(
                "CriacaoDocumentosFluig",
                null,
                [
                    DatasetFactory.createConstraint("conteudo", bytes, bytes, ConstraintType.MUST),
                    DatasetFactory.createConstraint("nome", fileName, fileName, ConstraintType.SHOULD),
                    DatasetFactory.createConstraint("descricao", fileName, fileName, ConstraintType.SHOULD),
                    DatasetFactory.createConstraint("pasta", parentId, parentId, ConstraintType.SHOULD),
                ],
                null,
                {
                    success: function (dataset) {
                        if (!dataset || dataset == "" || dataset == null) {
                            // Retorna com erro
                            reject("Houve um erro na comunicação com o webservice de criação de documentos. Tente novamente!");
                        }

                        if (dataset.values[0][0] == "false") {
                            // Retorna com erro
                            reject("Erro ao criar arquivo. Favor entrar em contato com o administrador do sistema. Mensagem: " + dataset.values[0][1]);
                        } else {
                            // Retorna com Sucesso
                            console.log("### GEROU docID = " + dataset.values[0].Resultado);
                            resolve(dataset.values[0].Resultado);
                        }
                    },
                    error: function (error) {
                        reject(error);
                    },
                }
            );
        };
    });
}