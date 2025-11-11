var ConsultaCadastroDeEquipamentos = SuperWidget.extend({
    variavelNumerica: null,
    variavelCaracter: null,

    init: function () {
        console.log("45");
        var self = this;

        var $button = $("#button-search");
        var originalText = "Buscar";
        var loadingInterval;

        const inputCpfCnpj = document.getElementById("cpf");
        aplicarMascaraCpfCnpj(inputCpfCnpj);
        
        const inputValorLocacao = document.getElementById("valorLocacao");
        aplicarMascaraMoeda(inputValorLocacao);
    //    preencherObrasDoUsuario()
        $button.css({
            minWidth: "120px",
            color: "#fff",
            border: "none"
        });

        $("#button-search").click(function () {
            self.buscaResultados();
            $button.prop("disabled", true)
                .text("Buscando")
                .css({
                    backgroundColor: "#ffc107",
                    color: "#000",
                    minWidth: "120px",
                    transition: "background-color 0.3s ease"
                })
                .addClass("loading-yellow");

            var dots = 0;
            loadingInterval = setInterval(function () {
                dots = (dots + 1) % 4;
                $button.text("Buscando" + ".".repeat(dots));
            }, 500);

            $(document).one("buscaFinalizada", function () {
                clearInterval(loadingInterval);
                $button.prop("disabled", false)
                    .text(originalText)
                    .removeClass("loading-yellow")
                    .css({
                        backgroundColor: "#777777ff",
                        color: "#fff"
                    });
            });

        });
        $("#filtrosHeader").click(function () {
            var filtrosBody = $("#filtrosBody");
            var setinha = $("#setinha");

            if (filtrosBody.is(":visible")) {
                filtrosBody.slideUp(300);
                setinha.css("transform", "rotate(-90deg)");
            } else {
                filtrosBody.slideDown(300);
                setinha.css("transform", "rotate(0deg)");
            }
        });
    },

    bindings: {
        local: {
            execute: ["click_executeAction"],
        },
        global: {},
    },

    executeAction: function (htmlElement, event) { },

    buscaResultados: function () {
        var self = this;
        let valorLocacao = $("#valorLocacao").val();
        if (valorLocacao) {
            valorLocacao = valorLocacao
                .replace(/[R$\s.]/g, "") 
                .replace(",", "."); 
        }
        var filtros = {
            PREFIXO: $("#prefixo").val(),
            DESCRICAO: $("#descricao").val(),
            MODELO: $("#modelo").val(),
            FABRICANTE: $("#fabricante").val(),
            FORNECEDOR_CNPJ: $("#cpf").val(),
            FORNECEDOR: $("#fornecedor").val(),
            VALOR_LOCACAO: valorLocacao,
            OBRA: $("#localizacao").val(),
            CONTRATO: $('#contrato').val()
        };
        var constraints = [];
        for (var campo in filtros) {
            if (filtros[campo] && filtros[campo].trim() !== "") {
                constraints.push(
                    DatasetFactory.createConstraint(
                        campo,
                        filtros[campo],
                        filtros[campo],
                        ConstraintType.MUST
                    )
                );
            }
        }

        DatasetFactory.getDataset(
            "dsConsultaVIEW_EQUIPAMENTOS_CONTRATOS",
            null,
            constraints,
            null,
            {
                success: function (dataset) {

                    if (dataset.values && dataset.values.length > 0 && dataset.values[0].RESULT) {
                        var dados = JSON.parse(dataset.values[0].RESULT);
                        var statusFiltro = $("input[name='decisao']:checked").val();
                        if (statusFiltro && statusFiltro.trim() !== "") {
                            dados = dados.filter(function (item) {
                                var statusEquipamento = item.DESC_STATUS_EQUIPAMENTO;

                                if (statusFiltro === "Ativo") {
                                    return statusEquipamento === "Pendente Contrato";

                                } else if (statusFiltro === "Inativo") {
                                    return statusEquipamento === "Equipamento desmobilizado" ||
                                        statusEquipamento === "Contrato encerrado";
                                }
                                return true;
                            });

                        }

                        self.retornaDataset(dados);
                    } else {
                        console.warn("⚠️ Nenhum dado retornado ou RESULT vazio");
                        self.retornaDataset([]);
                    }
                    $(document).trigger("buscaFinalizada");
                },
                error: function (err) {
                    console.error("❌ Erro ao buscar dataset:", err);
                    self.retornaDataset([]);
                    $(document).trigger("buscaFinalizada");
                },
            }
        );
    },

    retornaDataset: function (dados) {
        try {
            var self = this;

            if (!self.dataTable) {
                self.dataTable = $("#dataTableFilter").DataTable({
                    data: [],
                    destroy: true,
                    pageLength: 25,
                    deferRender: true,
                    language: { sEmptyTable: "Nenhum registro encontrado", lengthMenu: "Resultados por página _MENU_", sInfo: "Mostrando de _START_ até _END_ de _TOTAL_ registros", sInfoEmpty: "Mostrando 0 até 0 de 0 registros", sInfoFiltered: "(Filtrados de _MAX_ registros)", sInfoPostFix: "", sInfoThousands: ".", sLengthMenu: "_MENU_ resultados por página", sLoadingRecords: "Carregando...", sProcessing: "Processando...", sZeroRecords: "Nenhum registro encontrado", sSearch: "Pesquisar", oPaginate: { sNext: "Próximo", sPrevious: "Anterior", sFirst: "Primeiro", sLast: "Último", }, oAria: { sSortAscending: ": Ordenar colunas de forma ascendente", sSortDescending: ": Ordenar colunas de forma descendente", }, select: { rows: { _: "Selecionado %d linhas", 0: "Nenhuma linha selecionada", 1: "Selecionado 1 linha", }, }, buttons: { copy: "Copiar para a área de transferência", copyTitle: "Cópia bem sucedida", copySuccess: { 1: "Uma linha copiada com sucesso", _: "%d linhas copiadas com sucesso", }, }, },
                    columns: [
                        { data: "PREFIXO", title: "Prefixo" },
                        { data: "DESCRICAO", title: "Descrição" },
                        { data: "MODELO", title: "Modelo" },
                        { data: "FABRICANTE", title: "Fabricante" },
                        { data: "FORNECEDOR_CNPJ", title: "CPF/CNPJ", width: "160px" },
                        { data: "FORNECEDOR", title: "Fornecedor" },
                        {
                            data: "VALOR_LOCACAO",
                            title: "Valor de Locação",
                            render: function (data) {
                                if (!data || isNaN(data)) return "-";
                                return parseFloat(data).toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                });
                            },
                        },
                        { data: "OBRA", title: "Localização" },
                        {
                            data: "DESC_STATUS_EQUIPAMENTO",
                            title: "Status",
                            render: function (data, type, row) {
                                if (data == null || data === undefined || data === "" ||
                                    (typeof data === 'string' && (data.trim() === "" || data.toLowerCase() === "null"))) {
                                    return "-";
                                }
                                return data;
                            }
                        },
                        {
                            data: null,
                            title: "Ações",
                            render: function () {
                                return `
                                <div style="cursor: pointer; display: flex; align-items: center; gap: 10px">
                                    <button class="btnSol" title="Solicitação (Visualizar)" style="border:none; background:none">
                                        <i class="flaticon flaticon-view icon-md" aria-hidden="true"></i>
                                    </button>
                                    <button class="btnAnexos" title="Anexos" style="border:none; background:none">
                                        <i class="flaticon flaticon-paperclip icon-md" aria-hidden="true"></i>
                                    </button>
                                </div>`;
                            },
                        },
                    ],
                });
            }
            self.dataTable.clear();
            self.dataTable.rows.add(dados).draw();
            // self.dataTable.rows.add(dados.slice(0, 500)).draw();

            $("#dataTableFilter").off("click", ".btnSol").on("click", ".btnSol", function () {
                var rowData = self.dataTable.row($(this).closest("tr")).data();
                if (rowData) self.abrirModalVisualiza(rowData);
            });

            $("#dataTableFilter").off("click", ".btnAnexos").on("click", ".btnAnexos", function () {
                var rowData = self.dataTable.row($(this).closest("tr")).data();
                if (rowData) self.abrirModalAnexos(rowData);
            });

        } catch (error) {
            console.error("❌ Erro ao processar o dataset:", error);
        }
    },


    abrirModalVisualiza: function (rowData) {
        (async () => {
            const baseUrl = "http://desenvolvimento.castilho.com.br:3232/portal/p/1/ecmnavigation?app_ecm_navigation_doc=";

            const docEquip = await createMultipleLinks(rowData.ANEXOS_DOCUMENTACAO);
            const fotos = await createMultipleLinks(rowData.ANEXOS_FOTOS);
            const laudo = await createMultipleLinks(rowData.ANEXOS_LAUDO);
            const manutencao = await createMultipleLinks(rowData.ANEXOS_PLANO_MANUTENCAO);
            const art = await createMultipleLinks(rowData.ANEXOS_ART);
            function renderLinks(campo) {
                if (!campo || campo.trim() === "") return "<span style='color:red'>❌ Não anexado</span>";

                const ids = campo.split(",").map(id => id.trim());
                return ids.map(id => `
                 <a href="${baseUrl + id}" target="_blank" style="display:inline-block; margin-right:8px;">
                     <i class="flaticon flaticon-attachment icon-sm" style="color:#007bff"></i> ${id}
                 </a>
             `).join("");
            }
            var self = this;
            var modalContent = `
    <div class="panel-body" style="display: block;">

        <!-- Identificação (Equipamento e Obra) -->
      <div class="panel panel-primary" style="border: none; padding: 10px;">
            <div class="panel-heading" style="color: #58595b; border-color: #58595b17; background-color: white">
                <h4 class="panel-title">
                   Identificação (Equipamento e Obra)
                </h4>
            </div>
            <div class="panel-body">
                <div class="row">
                    <div class="col-md-6"><b style="color: #636E72">Coliga/Empresa:</b> ${rowData.COLIGADA == 1
                    ? "1 - Construtora Castilho"
                    : rowData.COLIGADA == 12
                        ? "12 - Dromos"
                        : rowData.COLIGADA == 13
                            ? "13 - Epya"
                            : "-"
                }</div>
                    <div class="col-md-6"><strong style="color: #636E72">Obra:</strong> ${trataNull(rowData.OBRA)}</div>
                  
                </div>
                <div class="row">
                  <div class="col-md-6"><strong style="color: #636E72">Descrição do Equipamento:</strong> ${rowData.DESCRICAO || "-"}</div>
                    <div class="col-md-6"><strong style="color: #636E72">Prefixo:</strong> ${rowData.PREFIXO || "-"}</div>
                </div>
                 <div class="row">
                  <div class="col-md-6"><strong style="color: #636E72">Contrato:</strong> ${rowData.CONTRATO || "-"}</div>
                </div>
            </div>
        </div>

        <!-- Detalhes Técnicos e Financeiros -->
          <div class="panel panel-primary" style="border: none; padding: 10px;">
            <div class="panel-heading" style="color: #58595b; border-color: #58595b17; background-color: white">
                <h4 class="panel-title">
                    Detalhes Técnicos e Financeiros
                </h4>
            </div>
            <div class="panel-body" style="display: block;">
                <div class="row">
                    <div class="col-md-6"><strong style="color: #636E72">Categoria:</strong> ${rowData.CODICONTA || "-"}</div>
                    <div class="col-md-6"><strong style="color: #636E72">Classe Mecânica:</strong> ${rowData.CLASSEMECANICA || "-"}</div>
                   
                </div>
                <div class="row">
                    <div class="col-md-6"><strong style="color: #636E72">Classe Operacional:</strong> ${rowData.CLASSEOPERACIONAL || "-"}</div>
                    <div class="col-md-6"><strong style="color: #636E72">Ano de Fabricação:</strong> ${!rowData.ANO_FABRICACAO || rowData.ANO_FABRICACAO.toLowerCase() === "null" ? "-" : rowData.ANO_FABRICACAO}</div>
                </div>
                <div class="row">
                    <div class="col-md-6"><strong style="color: #636E72">Modelo (Ano):</strong> ${!rowData.ANO_MODELO || rowData.ANO_MODELO.toLowerCase() === "null" ? "-" : rowData.ANO_MODELO}</div>
                    <div class="col-md-6"><strong style="color: #636E72">Placa:</strong> ${!rowData.PLACA || rowData.PLACA.toLowerCase() === "null" ? "-" : rowData.PLACA}</div>
                </div>
                <div class="row">
                    <div class="col-md-6"><strong style="color: #636E72">Chassis:</strong> ${!rowData.CHASSI || rowData.CHASSI.toLowerCase() === "null" ? "-" : rowData.CHASSI}</div>
                    <div class="col-md-6"><strong style="color: #636E72">Modelo:</strong> ${!rowData.MODELO || rowData.MODELO.toLowerCase() === "null" ? "-" : rowData.MODELO}</div>
                </div>
                <div class="row">  
                    <div class="col-md-6"><strong style="color: #636E72">Fabricante:</strong> ${!rowData.FABRICANTE || rowData.FABRICANTE.toLowerCase() === "null" ? "-" : rowData.FABRICANTE}</div>
                    <div class="col-md-6"><b style="color: #636E72">Potência do Motor:</b> ${!rowData.POTENCIA || rowData.POTENCIA.toLowerCase() === "null" ? "-" : rowData.POTENCIA}</div>
                </div>
                <div class="row">                  
                    <div class="col-md-6"><strong style="color: #636E72">Capacidade Operacional:</strong> ${!rowData.UN_MOBILIZADO || rowData.UN_MOBILIZADO.toLowerCase() === "null" ? "-" : rowData.UN_MOBILIZADO}</div>
                    <div class="col-md-6"><strong style="color: #636E72">Valor da Capacidade:</strong> ${!rowData.VALOR_MOBILIZADO || rowData.VALOR_MOBILIZADO.toLowerCase() === "null" ? "-" : rowData.VALOR_MOBILIZADO}</div>
                </div>
                <div class="row">
                    <div class="col-md-6"><strong style="color: #636E72">Valor Mobilização:</strong> ${!rowData.VALOR_MOBILIZADO ||
                    rowData.VALOR_MOBILIZADO.toLowerCase() === "null"
                    ? "-"
                    : rowData.VALOR_MOBILIZADO
                }</div>
                        <div class="col-md-6"><strong style="color: #636E72">Valor Extra:</strong> ${!rowData.VALOR_EXTRA || rowData.VALOR_EXTRA.toLowerCase() === "null"
                    ? "-"
                    : rowData.VALOR_EXTRA
                }</div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                    <b style="color: #636E72">Valor de Locação:</b>
                        ${rowData.VALOR_LOCACAO
                    ? "R$ " +
                    parseFloat(rowData.VALOR_LOCACAO).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                    })
                    : "-"
                }
                    </div>
                <div class="col-md-4"><strong style="color: #636E72">Mão de Obra:</strong> ${!rowData.MAODEOBRA || rowData.MAODEOBRA.toLowerCase() === "null"
                    ? "-"
                    : rowData.MAODEOBRA
                }</div>
            </div>
            </div>
        </div>

        <!-- Dados Operacionais -->
        <div class="panel panel-primary" style="border: none; padding: 10px;">
            <div class="panel-heading" style="color: #58595b; border-color: #58595b17; background-color: white">
                <h4 class="panel-title">
                  Dados Operacionais
                </h4>
            </div>
            <div class="panel-body" style="display: block;">
                <div class="row">
                    <div class="col-md-6"><b style="color: #636E72">Data de Chegada na Obra:</b> ${rowData.DATA_CHEGADA ? rowData.DATA_CHEGADA.split(" ")[0].split("-").reverse().join("/") : "-"}</div>
                    <div class="col-md-6"><strong style="color: #636E72">Km/Horas Atuais:</strong> ${rowData.KM_ATUAIS || "-"} / ${rowData.HORAS_ATUAIS || "-"}</div>
                   
                </div>
                  <div class="row">
                   <div class="col-md-6"><strong style="color: #636E72">Tipo de Combustível:</strong> ${!rowData.COMBUSTIVEL || rowData.COMBUSTIVEL.toLowerCase() === "null" ? "-" : rowData.COMBUSTIVEL}</div>
                <div class="col-md-6"><strong style="color: #636E72">Capacidade do Tanque:</strong> ${!rowData.CAPACIDADE_COMBUSTIVEL ||
                    rowData.CAPACIDADE_COMBUSTIVEL.toLowerCase() === "null"
                    ? "-"
                    : rowData.CAPACIDADE_COMBUSTIVEL
                }</div>
                <div class="col-md-6"><strong style="color: #636E72">Consumo Médio:</strong> ${rowData.RELACAO_KM_HORA || "-"
                }</div>
            </div>
            </div>
        </div>

        <!-- Fornecedor -->
         <div class="panel panel-primary" style="border: none; padding: 10px;">
            <div class="panel-heading" style="color: #58595b; border-color: #58595b17; background-color: white">
                <h4 class="panel-title">
                    Fornecedor
                </h4>
            </div>
            <div class="panel-body" style="display: block;">
                <div class="row">
                    <div class="col-md-6"><strong style="color: #636E72">CPF/CNPJ:</strong> ${!rowData.FORNECEDOR_CNPJ || rowData.FORNECEDOR_CNPJ.toLowerCase() === "null" ? "-" : rowData.FORNECEDOR_CNPJ}</div>
                    <div class="col-md-6"><strong style="color: #636E72">Nome / Razão Social:</strong> ${!rowData.FORNECEDOR || rowData.FORNECEDOR.toLowerCase() === "null" ? "-" : rowData.FORNECEDOR}</div>                   
                </div>
                 <div class="row">
                  <div class="col-md-6"><strong style="color: #636E72">Endereço:</strong> -</div>
                 </div>
            </div>
        </div>
        
   <div class="panel panel-primary" style="border: none; padding: 10px;">
        <div class="panel-heading" style="color: #58595b; border-color: #58595b17; background-color: white">
            <h4 class="panel-title">Anexos</h4>
        </div>

     <div class="panel-body" style="padding: 20px; background: white;">
        <div style="
            display: flex;
            gap: 30px;
            align-items: flex-start;
        ">
            <!-- Coluna Esquerda -->
            <div style="flex: 1;">
                <div style="margin-bottom: 15px;">
                    <strong>Documentação Equipamento:</strong><br>
                    <div style="padding-left:10px;">${docEquip}</div>
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Laudo Técnico:</strong><br>
                    <div style="padding-left:10px;">${laudo}</div>
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>ART:</strong><br>
                    <div style="padding-left:10px;">${art}</div>
                </div>
            </div>

            <!-- Coluna Direita -->
            <div style="flex: 1;">
                <div style="margin-bottom: 15px;">
                    <strong>Foto do Equipamento:</strong><br>
                    <div style="padding-left:10px;">${fotos}</div>
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Plano de Manutenção:</strong><br>
                    <div style="padding-left:10px;">${manutencao}</div>
                </div>
            </div>
        </div>
    </div>
</div>
    </div>
    </div>
    </div>
    `;
            var modalId = 'modalDetalhesEquipamento_' + new Date().getTime();
            FLUIGC.modal({
                title: 'Detalhes do Equipamento',
                content: modalContent,
                id: modalId,
                size: 'large',
                cssClass: 'meu-modal-anexo',
            });
        })();
    },
   
    abrirModalAnexos: async function (rowData) {
        const docEquip = await createMultipleLinks(rowData.ANEXOS_DOCUMENTACAO);
        const fotos = await createMultipleLinks(rowData.ANEXOS_FOTOS);
        const laudo = await createMultipleLinks(rowData.ANEXOS_LAUDO);
        const manutencao = await createMultipleLinks(rowData.ANEXOS_PLANO_MANUTENCAO);
        const art = await createMultipleLinks(rowData.ANEXOS_ART);

        const formatarData = (data) => {
            if (!data || data === "null") return "-";
            const partes = data.split("-");
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        };

        const vencimentoLaudo = formatarData(rowData.DATA_VENCIMENTO_LAUDO);
        const vencimentoArt = formatarData(rowData.DATA_VENCIMENTO_ART);

        const estiloCard = `
            background: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 12px 15px;
            margin-bottom: 10px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        `;

        const estiloTitulo = `
            color: #1a1a1a;
            font-weight: 600;
            font-size: 15px;
        `;

        const estiloData = `
            color: #c9302c;
            font-weight: bold;
            font-size: 13px;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            margin-top: 4px;
        `;

        const modalContent = `
            <div class="panel-body" style="display: block; padding: 10px;">
                <div style="display: flex; justify-content: space-between; gap: 15px;">
                    <div style="flex: 1;">
                        <div style="${estiloCard}">
                            <div style="${estiloTitulo}">Documentação do Equipamento</div>
                            <div>${docEquip}</div>
                        </div>
                        <div style="${estiloCard}">
                            <div style="${estiloTitulo}">Laudo Técnico</div>
                            <div>${laudo}</div>
                            <div style="${estiloData}">
                                <i class="fluigicon fluigicon-warning-sign icon-sm"></i>
                                Data de Vencimento: ${vencimentoLaudo}
                            </div>
                        </div>
                        <div style="${estiloCard}">
                            <div style="${estiloTitulo}">ART</div>
                            <div>${art}</div>
                            <div style="${estiloData}">
                                <i class="fluigicon fluigicon-warning-sign icon-sm"></i>
                                Data de Vencimento: ${vencimentoArt}
                            </div>
                        </div>
                    </div>

                    <div style="flex: 1;">
                        <div style="${estiloCard}">
                            <div style="${estiloTitulo}">Foto do Equipamento</div>
                            <div>${fotos}</div>
                        </div>
                        <div style="${estiloCard}">
                            <div style="${estiloTitulo}">Plano de Manutenção</div>
                            <div>${manutencao}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const modalId = 'modalAnexos_' + new Date().getTime();

        FLUIGC.modal({
            title: '📎 Anexos do Equipamento',
            content: modalContent,
            id: modalId,
            size: 'large',
            actions: [{ 'label': 'Fechar', 'autoClose': true }]
        });
    }

});


function trataNull(valor) {
    return valor == null || valor === "" ? "-" : valor;
}


async function createMultipleLinks(anexoIds) {
    if (!anexoIds || anexoIds === "null" || anexoIds === "NULL" || anexoIds.toString().trim() === "") {
        return "<span style='color: #6c757d;'>-</span>";
    }

    const ids = anexoIds
        .toString()
        .split(',')
        .map(id => id.trim())
        .filter(id => id && id !== "null");

    let linksHtml = "";

    for (const id of ids) {
        try {
            const constraint = DatasetFactory.createConstraint("documentPK.documentId", id, id, ConstraintType.MUST);
            const ds = DatasetFactory.getDataset("document", ["documentDescription"], [constraint], null);
            const nomeArquivo =
                ds && ds.values && ds.values.length > 0 ? ds.values[0].documentDescription : `Documento ${id}`;
            linksHtml += await htmlNovoAnexo(id, nomeArquivo, false);
        } catch (e) {
            console.error(`❌ Erro ao buscar nome do documento ID ${id}:`, e);
            linksHtml += await htmlNovoAnexo(id, `Documento ${id}`, false);
        }
    }

    return linksHtml || "<span style='color: #6c757d;'>-</span>";
}

async function htmlNovoAnexo(documentId, documentName, permiteExclusao) {
    var html =
        `<div class="btn btnAnexo">
        <i class="flaticon flaticon-download icon-md" aria-hidden="true"></i>
        <b><a target="_blank" href=${documentId == "#" ? "#" : await promiseBuscaDownloadUrlDocumentoNoFLuig(documentId)}>
            ${documentName}
        </a></b>
        ${!permiteExclusao ? "" :
            `<button class="btn btnDeletarAnexo" data-documentId="${documentId}">
                <i class="flaticon flaticon-close icon-sm" aria-hidden="true"></i>
            </button>`}
    </div>`;

    return html;
}



function aplicarMascaraCpfCnpj(input) {
    input.addEventListener('input', function () {
        let valor = this.value.replace(/\D/g, ''); 
        if (valor.length <= 11) {
            this.value = valor
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        } else {
            this.value = valor
                .replace(/^(\d{2})(\d)/, '$1.$2')
                .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                .replace(/\.(\d{3})(\d)/, '.$1/$2')
                .replace(/(\d{4})(\d)/, '$1-$2');
            this.maxLength = 18; 
        }
    });
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' || e.key === 'Delete') {
            this.removeAttribute('maxLength');
        }
    });
}


function aplicarMascaraMoeda(input) {
    input.addEventListener("input", function () {
        let valor = this.value.replace(/\D/g, ""); 
        if (valor === "") {
            this.value = "";
            return;
        }
        valor = (parseInt(valor, 10) / 100).toFixed(2) + "";
        valor = valor.replace(".", ",");
        valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        this.value = "R$ " + valor;
    });
    input.addEventListener("blur", function () {
        if (this.value === "R$ 0,00" || this.value === "R$ NaN,00") {
            this.value = "";
        }
    });
}


function preencherObrasDoUsuario() {
    const userCode = WCMAPI.userCode;
    if (!userCode) {
        console.error("O valor de 'solicitante' está vazio ou não foi encontrado.");
        FLUIGC.toast({
            title: "Erro:",
            message: "O usuário solicitante não está definido.",
            type: "warning"
        });
        return;
    }

    try {
        const permissoes = buscaObrasPorPermissaoDoUsuario(userCode, true);
        if (permissoes.length > 0) {
            const selectObra = $("#localizacao");
            selectObra.empty();

            let optionsObra = "<option value='' id='option'></option>";
            let codcoligadaAtual = "";

            permissoes.forEach(ccusto => {
                if (codcoligadaAtual !== ccusto.CODCOLIGADA) {
                    if (codcoligadaAtual !== "") {
                        optionsObra += "</optgroup>";
                    }
                    optionsObra += `<optgroup label="${ccusto.CODCOLIGADA} - ${ccusto.NOMEFANTASIA}">`;
                    codcoligadaAtual = ccusto.CODCOLIGADA;
                }

                const optionValue = `${ccusto.CODCOLIGADA} - ${ccusto.CODCCUSTO} - ${ccusto.perfil}`;
                const optionLabel = `${ccusto.CODCCUSTO} - ${ccusto.perfil}`;
                optionsObra += `<option value="${optionValue}">${optionLabel}</option>`;

            });
            optionsObra += "</optgroup>";
            selectObra.append(optionsObra);
        } else {
            FLUIGC.toast({
                title: "Aviso:",
                message: "Nenhuma permissão encontrada para o usuário.",
                type: "warning"
            });
        }
    } catch (error) {
        console.error("Erro ao preencher obras do usuário:", error);
        FLUIGC.toast({
            title: "Erro ao preencher obras do usuário:",
            message: error.message || error,
            type: "danger"
        });
    }
}
