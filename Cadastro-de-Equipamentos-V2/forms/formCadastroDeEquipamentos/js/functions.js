function preenchePermissoesDoUsuario(permissaoGeral = null){
    permissoes = buscaObrasPorPermissaoDoUsuario($("#userCode").val(), permissaoGeral);
    var coligadas = Array.from(
        new Map(permissoes.map(e => [e.CODCOLIGADA, { NOME: e.NOMEFANTASIA, CODIGO: e.CODCOLIGADA }])).values()
    );

    $("#coligada")[0].selectize.addOption(coligadas.map(e=>{return {value:`${e.CODIGO} - ${e.NOME}`, text:`${e.CODIGO} - ${e.NOME}`}}));
}
function preencheObras(CODCOLIGADA){
    var previousValue = $("#obra").val();
    $("#obra")[0].selectize.clearOptions();
    var obras = permissoes.filter(e=>e.CODCOLIGADA==CODCOLIGADA);
    $("#obra")[0].selectize.addOption(obras.map(e=>{return {value:`${e.CODCCUSTO} - ${e.perfil}`, text:`${e.CODCCUSTO} - ${e.perfil}`}}));
    $("#obra")[0].selectize.setValue(previousValue);
}
function alteraCategoriaDaSolicitacao(categoria) {
    if (categoria == "") {
        $(".inputPA, .inputOutros, .inputMA").closest("div.inputGroup").hide();
    }
    if (categoria == "MA") {
        $(".inputPA, .inputOutros").closest("div.inputGroup").hide();
        $(".inputMA").closest("div.inputGroup").show();
        $("#CODIESPE").val(1);
    }
    if (categoria == "PA") {
        $(".inputMA, .inputOutros").closest("div.inputGroup").hide();
        $(".inputPA").closest("div.inputGroup").show();
        $("#CODIESPE").val(5);
    }
    if (categoria == "Outros") {
        $(".inputMA, .inputPA").closest("div.inputGroup").hide();
        $(".inputOutros").closest("div.inputGroup").show();
    }
}

// Modelo
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
    var previousValue = $("#modelo").val();
    var html = "<option></option>";
    html+= modelos.map(e=> `<option value="${e.ID_MODELO} - ${e.MODELO}">${e.MODELO}</option>`).join("");
    $("#modelo").html(html);
    $("#modelo").val(previousValue);
    $("#modelo").selectize({
        onChange: async function (value, isOnInitialize) {
            const [ID_MODELO, MODELO] = value.split(" - ");
            preencheInformacoesDoModelo(ID_MODELO);
        }
    });
}
async function preencheInformacoesDoModelo(ID_MODELO){
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
    }

    var found = modelos.find(e=> e.ID_MODELO == ID_MODELO);
    if (!found) {
        throw "Modelo não encontrado";
    }


    $("#fabricante").val(found.FABRICANTE);
    $("#classeMecanica").val(found.CLASSEMECANICA);
    $("#classOperacional").val(found.CLASSEOPERACIONAL);
    $("#potenciaMotor").val(found.POTENCIAHP);

    $("#IDMODE").val(found.ID_MODELO);
    $("#CODICLME").val(found.ID_CLASSEMECANICA);
    $("#IDCLOP").val(found.ID_CLASSEOPERACIONAL);
    $("#CODIFABR").val(found.ID_FABRICANTE);

    var combustivel = await promiseConsultaCombustivelPorModelo(found.ID_MODELO);
    $("#tipoCombustivel").html("<option></option>");
    for (const item of combustivel) {
        $("#tipoCombustivel").append(`<option value="${item.CODIMATE}">${item.DESCRICAO}</option>`);
    }

    var caracteristicasTecnicas = await promiseConsultaCaracteristicasTecnicas(found.ID_MODELO);
    $("#tableCaracteristicasTecnicas>tbody").html("");
    for (const item of caracteristicasTecnicas) {
        $("#tableCaracteristicasTecnicas>tbody").append(htmlItemCaracTec(item));
    }



}
function verificaSePrefixoCadastradoNoSisma(PREFIXO){
    return new Promise((resolve, reject)=>{
        DatasetFactory.getDataset("dsConsultaEquipamentoSisma", null,[
            DatasetFactory.createConstraint("PREFIXO", PREFIXO, PREFIXO, ConstraintType.MUST)            
        ],null,{
            success:ds=>{
                if (ds.values[0].STATUS != "SUCCESS") {
                    reject(ds.values[0].MESSAGE);
                }
                else{
                    if (JSON.parse(ds.values[0].RESULT).length >0) {
                        resolve(true);
                    }else{
                        resolve(false);
                    }
                }
            },
            error:e=>{
                reject(e);
            }
        });
    });
}

// Fornecedor
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
    var previousValue = $("#fornecedor").val();
    var fornecedores = await buscaFornecedores();
    $("#fornecedor")[0].selectize.clear();
    $("#fornecedor")[0].selectize.clearOptions();
    $("#fornecedor")[0].selectize.addOption(fornecedores.map(e=>{return {value:`${e.CODCFO} - ${e.CGCCFO} - ${e.NOMEFANTASIA}`, text:`${e.CGCCFO} - ${e.NOMEFANTASIA}`}}));
    $("#fornecedor")[0].selectize.setValue(previousValue);
}

// Caracteristicas Tecnicas
function geraTabelaCaracteristicasTecnicas(){
    var json = JSON.parse($("#JSONCARACTERISTICASTECNICAS").val());
    
    $("#tableCaracteristicasTecnicas>tbody").html("");
    for (const item of json) {
        $("#tableCaracteristicasTecnicas>tbody").append(htmlItemCaracTec(item));
    }
}
function htmlItemCaracTec(data) {
    var permiteAlteracao = $("#atividade").val() != ATIVIDADES.QSST && $("#formMode").val() != "VIEW";
    var html =
        `<tr>
            <input type="hidden" class="TIPOCARAC" value="${data.TIPOCARAC}"/>
            <input type="hidden" class="CODICATC" value="${data.CODICATC}"/>
            <input type="hidden" class="ITEM" value="${data.ITEM}"/>
            <td><input class="form-control DESCRICAO" value="${data.DESCRICAO}" readonly /></td>
            <td><input class="form-control VALOR_PADRAO" value="${data.VALOR_PADRAO}" readonly /></td>
            <td><input class="form-control VALOR" value="${data.VALOR}" ${!permiteAlteracao ? "readonly" : ""} /></td>
            <td><input class="form-control SIGLA" value="${data.SIGLA}" readonly /></td>
        </tr>`;
    return html;
}

// Consultas
function promiseConsultaCaracteristicasTecnicas(IDMODE){
    return new Promise((resolve, reject)=>{
        DatasetFactory.getDataset("dsConsultaCaracteriticasTecnicasDoModelo",null,[
            DatasetFactory.createConstraint("IDMODE", IDMODE, IDMODE, ConstraintType.MUST)
        ],null,{
            success:(ds=>{
                if (ds.values[0].STATUS != "SUCCESS") {
                    reject(ds.values[0].MENSAGEM);
                }else{
                    var retorno = JSON.parse(ds.values[0].RESULT);
                    resolve(retorno);
                }
            }),
            error:(e=>reject(error))
        });
    })
}
function promiseConsultaCombustivelPorModelo(IDMODE){
      return new Promise((resolve, reject)=>{
        DatasetFactory.getDataset("dsConsultaCombustivelPorModelo",null,[
            DatasetFactory.createConstraint("IDMODE", IDMODE, IDMODE, ConstraintType.MUST)
        ],null,{
            success:(ds=>{
                if (ds.values[0].STATUS != "SUCCESS") {
                    reject(ds.values[0].MENSAGEM);
                }else{
                    var retorno = JSON.parse(ds.values[0].RESULT);
                    resolve(retorno);
                }
            }),
            error:(e=>reject(error))
        });
    })
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

        salvaIdAnexo(tipoAnexo, documentId);

        $(divTarget).append(await htmlNovoAnexo(documentId, name, true));
        
        
        if($(divTarget).find(".btnAnexo").length > 0){
            $(divTarget).closest(".row").find(".spanStatusAnexos").text("✅");
        }else{
            $(divTarget).closest(".row").siblings(".spanStatusAnexos").text("❌");
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
                    removerAnexos(target);
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

    function salvaIdAnexo(tipo, documentId){
        var divTarget;
        
        if (tipo == "Documentação do Equipamento") {
            divTarget = "#anexosDocumentosEquipamento";
        }
        else if (tipo == "Foto do Equipamento") {
            divTarget = "#anexosFotosEquipamentos";
        }
        else if (tipo == "Laudo Técnico") {
            divTarget = "#anexosLaudoTecnico";
        }
        else if (tipo == "Plano de Manutenção") {
            divTarget = "#anexpsPlanoManutencao";
        }
        else if (tipo == "ART") {
            divTarget = "#anexosART";
        }


        var val = $(divTarget).val();
        if (val == "") {
            val = [];
        }else{
            val=val.split(",");
        }
        val.push(documentId);
        $(divTarget).val(val.join(","));
    }
}
async function htmlNovoAnexo(documentId, documentName, permiteExclusao){
    var html = 
    `<div class="btn btn-default btnAnexo">
        <b><a target="_blank" href=${documentId == "#"? "#": await promiseBuscaDownloadUrlDocumentoNoFLuig(documentId)}>${documentName}</a></b>
        ${!permiteExclusao ? "" :
            `<button class="btn btnDeletarAnexo" data-documentId="${documentId}">
                <i class="flaticon flaticon-close icon-sm" aria-hidden="true"></i>
            </button>`}
    </div>`;

    return html;
}
async function geraAnexos() {
    var anexosDocumentosEquipamento = $("#anexosDocumentosEquipamento").val();
    var anexosFotosEquipamentos = $("#anexosFotosEquipamentos").val();
    var anexosLaudoTecnico = $("#anexosLaudoTecnico").val();
    var anexpsPlanoManutencao = $("#anexpsPlanoManutencao").val();
    var anexosART = $("#anexosART").val();

    insereAnexo("#divListaAnexosDocumentacaoEquipamento", anexosDocumentosEquipamento);
    insereAnexo("#divListaAnexosFotoEquipamento", anexosFotosEquipamentos);
    insereAnexo("#divListaAnexosLaudo", anexosLaudoTecnico);
    insereAnexo("#divListaAnexosPlanoManutencao", anexpsPlanoManutencao);
    insereAnexo("#divListaAnexosART", anexosART);

    async function insereAnexo(target, documentList) {
        if (documentList != "") {
            documentList = documentList.split(",");
            var permiteExclusao = false;
            if ($("#atividade").val() == ATIVIDADES.QSST) {
                // Permite ao QSST remover os arquivos referente a segurança
                if (target == "#divListaAnexosLaudo" || target ==  "#divListaAnexosPlanoManutencao" || target == "#divListaAnexosART") {
                    permiteExclusao = true;
                }
                
            }
            else if($("#atividade").val() == ATIVIDADES.INICIO || $("#atividade").val() == ATIVIDADES.INICIO_0){
                permiteExclusao = true;
            }

            for (const documentId of documentList) {
                var html = await htmlNovoAnexo(documentId,await promiseGetDocumentDescription(documentId),permiteExclusao);
                $(target).append(html);
                if (permiteExclusao) {
                    $(target).find(".btnDeletarAnexo:last").off("click").on("click", function () {
                        var target = $(this);
                        FLUIGC.message.confirm({
                            message: 'Deseja excluir esse anexo?',
                            title: '',
                            labelYes: 'Sim',
                            labelNo: 'Não'
                        }, function (result, el, ev) {
                            if (result) {
                                removerAnexos(target);
                                $(target).closest(".btnAnexo").remove();
                            }
                        });
                    });
                }
            }

            if($(target).find(".btnAnexo").length > 0){
                $(target).closest(".row").find(".spanStatusAnexos").text("✅");
            }else{
                $(target).closest(".row").find(".spanStatusAnexos").text("❌");
            }
        }
    }
}
function removerAnexos(target){
    var documentId = $(target).attr("data-documentId");
    var divTarget = $(target).closest(".divListaAnexos").attr("id");



        var inputTarget;
        
        if (divTarget == "divListaAnexosDocumentacaoEquipamento") {
            inputTarget = "#anexosDocumentosEquipamento";
        }
        else if (divTarget == "divListaAnexosFotoEquipamento") {
            inputTarget = "#anexosFotosEquipamentos";
        }
        else if (divTarget == "divListaAnexosLaudo") {
            inputTarget = "#anexosLaudoTecnico";
        }
        else if (divTarget == "divListaAnexosPlanoManutencao") {
            inputTarget = "#anexpsPlanoManutencao";
        }
        else if (divTarget == "divListaAnexosART") {
            inputTarget = "#anexosART";
        }

        
        var list = $(inputTarget).val().split(",");
        list = list.filter(e=> e != documentId);
        $(inputTarget).val(list.join(","));




    $(target).closest(".btnAnexo").remove();
   
        if($("#"+divTarget).find(".btnAnexo").length > 0){
            $("#"+divTarget).closest(".row").find(".spanStatusAnexos").text("✅");
        }else{
            $("#"+divTarget).closest(".row").find(".spanStatusAnexos").text("❌");
        }
        

}

// Historico
async function asyncMontaHistorico() {
    var linhasHistorico = getLinhasHistorico();

    // Inverte a Lista para motrar o Histórico do Mais Recente para o Mais Antigo
    linhasHistorico = linhasHistorico.reverse();

    for (const linha of linhasHistorico) {
        var html = geraHtmlHistorico(linha);

        // Primeiro insere a linha do HTML, depois cria a <img/> e insere na DIV
        $("#divLinhasHistorico").append(html);
        $(".divImageUser:last").append(await promiseBuscaImagemUsuario(linha.USUARIO));
    }

    function getLinhasHistorico() {
        var retorno = [];
        $("#tableHistorico>tbody>tr:not(:first)").each(function () {
            retorno.push({
                USUARIO: $(this).find(".tableHistoricoUsuario").val(),
                DATA: $(this).find(".tableHistoricoData").val(),
                OBSERVACAO: $(this).find(".tableHistoricoObservacao").val(),
                ACAO: $(this).find(".tableHistoricoAcao").val(),
                ATIVIDADE: $(this).find(".tableHistoricoAtividade").val(),
            });
        });
        return retorno;
    }
    function geraHtmlHistorico(linha) {
        var DATA = linha.DATA.split(" ");
        DATA = DATA[0].split("-").reverse().join("/") + " " + DATA[1];

        var html = `<div class="card">
                <div class="card-body" style="${linha.ACAO == "Aprovado" ? "border:solid 1px green;" : linha.ACAO == "Reprovado" ? "border:solid 1px red;" : ""} ">
                    <div style="display:flex;">
                        <div class="divImageUser" style="margin-right:20px;"></div>
                        <div>
                            <h3 class="card-title" style="margin-bottom:0px; color:black;">${BuscaNomeUsuario(linha.USUARIO)} <small>${linha.ACAO}</small></h3>
                            <small>${DATA}</small>
                            <p class="card-text">${linha.OBSERVACAO && linha.OBSERVACAO.trim() ? linha.OBSERVACAO : ""}</p>
                        </div>
                    </div>
                </div>
            </div>`;

        return html;
    }
    function promiseBuscaImagemUsuario(usuario) {
        return new Promise(async (resolve, reject) => {
            const res = await fetch("/api/public/social/image/" + usuario);
            const blob = await res.blob();
            const img = new Image();
            img.width = "60";
            img.height = "60";
            img.classList.add("userImage");
            img.src = URL.createObjectURL(blob);
            await img.decode();
            resolve(img);
        });
    }
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
function promiseGetDocumentDescription(documentId){
    return new Promise((resolve, reject)=> {
        $.ajax({
            url: `/content-management/api/v2/documents/${documentId}`,
            contentType: "application/json",
            method: "GET",
            error: function (x, e) {
                console.log(x);
                console.log(e);
                FLUIGC.toast({
                    message: "Erro ao buscar documento: " + e,
                    type: "warning"
                });
                reject("Erro ao buscar boletim de medição!");
            },
            success: function (data) {
                resolve(data.description);
            }
        });
    });
}