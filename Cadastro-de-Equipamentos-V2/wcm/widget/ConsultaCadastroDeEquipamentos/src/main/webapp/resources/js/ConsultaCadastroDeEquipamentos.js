var ConsultaCadastroDeEquipamentos = SuperWidget.extend({
    variavelNumerica: null,
    variavelCaracter: null,

    init: function () {
        console.log("18");
        var self = this;
        $("#button-search").click(function () {
            self.buscaResultados();
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

        var filtros = {
            PREFIXO: $("#prefixo").val(),
            DESCRICAO: $("#descricao").val(),
            MODELO: $("#modelo").val(),
            FABRICANTE: $("#fabricante").val(),
            FORNECEDOR_CNPJ: $("#cpf").val(),
            FORNECEDOR: $("#fornecedor").val(),
            VALOR_LOCACAO: $("#valorLocacao").val(),
            OBRA: $("#localizacao").val(),
            STATUS: $("input[name='decisao']:checked").val(), // ativo/inativo
        };

        console.log("📥 Filtros capturados:", filtros);
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
                    console.log("✅ Dataset retornado:", dataset);

                    if (
                        dataset.values &&
                        dataset.values.length > 0 &&
                        dataset.values[0].RESULT
                    ) {
                        var dados = JSON.parse(dataset.values[0].RESULT);
                        self.retornaDataset(dados);
                    } else {
                        console.warn("⚠️ Nenhum dado retornado ou RESULT vazio");
                        self.retornaDataset([]);
                    }
                },
                error: function (err) {
                    console.error("❌ Erro ao buscar dataset:", err);
                    self.retornaDataset([]);
                },
            }
        );
    },

    retornaDataset: function (dados) {

        try {
            var self = this;
            var dataTable = null;
            if (!$.fn.DataTable.isDataTable("#dataTableFilter")) {
                dataTable = $("#dataTableFilter").DataTable({
                    destroy: true,
                    data: dados,
                    stripeClasses: [],
                    createdRow: function (row, data, dataIndex) {
                        $(row).css("background-color", "#ffffff");
                    },
                    language: {
                        sEmptyTable: "Nenhum registro encontrado",
                        lengthMenu: "Resultados por página _MENU_",
                        sInfo: "Mostrando de _START_ até _END_ de _TOTAL_ registros",
                        sInfoEmpty: "Mostrando 0 até 0 de 0 registros",
                        sInfoFiltered: "(Filtrados de _MAX_ registros)",
                        sInfoPostFix: "",
                        sInfoThousands: ".",
                        sLengthMenu: "_MENU_ resultados por página",
                        sLoadingRecords: "Carregando...",
                        sProcessing: "Processando...",
                        sZeroRecords: "Nenhum registro encontrado",
                        sSearch: "Pesquisar",
                        oPaginate: {
                            sNext: "Próximo",
                            sPrevious: "Anterior",
                            sFirst: "Primeiro",
                            sLast: "Último",
                        },
                        oAria: {
                            sSortAscending: ": Ordenar colunas de forma ascendente",
                            sSortDescending: ": Ordenar colunas de forma descendente",
                        },
                        select: {
                            rows: {
                                _: "Selecionado %d linhas",
                                0: "Nenhuma linha selecionada",
                                1: "Selecionado 1 linha",
                            },
                        },
                        buttons: {
                            copy: "Copiar para a área de transferência",
                            copyTitle: "Cópia bem sucedida",
                            copySuccess: {
                                1: "Uma linha copiada com sucesso",
                                _: "%d linhas copiadas com sucesso",
                            },
                        },
                    },
                    columns: [
                        { data: "PLACA", title: "ID" }, // ou outra chave para usar como ID
                        { data: "PREFIXO", title: "PREFIXO" },
                        { data: "DESCRICAO", title: "DESCRIÇÃO" },
                        { data: "MODELO", title: "MODELO" },
                        { data: "FABRICANTE", title: "FABRICANTE" },
                        { data: "FORNECEDOR_CNPJ", title: "CPF/CNPJ" },
                        { data: "FORNECEDOR", title: "FORNECEDOR" },
                        {
                            data: "VALOR_LOCACAO",
                            title: "VALOR DE LOCAÇÃO",
                            render: function (data, type, row) {
                                return (data ?? "-") === "-" ? "-" : data;
                            },
                        },
                        { data: "OBRA", title: "LOCALIZAÇÃO" },
                        { data: "STATUS", title: "STATUS" },
                        {
                            data: null,
                            title: "AÇÕES",
                            render: function () {
                                return `
                            <div style="cursor: pointer; display: flex; align-items: center; gap: 10px">
                                 <button class="btnSol" title="Solicitação (Visualizar)" style="border:none; background:none">
                                    <i class="flaticon flaticon-documents icon-md" aria-hidden="true"></i>
                                </button>
                                  <button class="btnAnexos" title="Anexos" style="border:none; background:none">
                                    <i class="flaticon flaticon-paperclip icon-md" aria-hidden="true"></i>
                                </button>
                            </div>
        `;
                            },
                        },
                    ],
                    // destroy: true,
                });

            } else {
                dataTable = $("#dataTableFilter").DataTable();
                dataTable.clear();
                dataTable.rows.add(dados).draw();
            }
            $("#dataTableFilter").off("click", ".btnSol");
            $("#dataTableFilter").on("click", ".btnSol", function () {
                var tr = $(this).closest("tr");
                var rowData = dataTable.row(tr).data();
                if (rowData) {
                    self.abrirModalVisualiza(rowData);
                }
            });
            $("#dataTableFilter").off("click", ".btnAnexos");
            $("#dataTableFilter").on("click", ".btnAnexos", function () {
                var tr = $(this).closest("tr");
                var rowData = dataTable.row(tr).data();
                if (rowData) {
                    self.abrirModalAnexos(rowData);
                }
            });
        } catch (error) {
            console.error("Erro ao processar o dataset:", error);
        }
    },

    abrirModalVisualiza: function (rowData) {
        var self = this;

        var modalContent = `
    <div class="panel-body" style="display: block;">

        <!-- Identificação (Equipamento e Obra) -->
        <div class="panel panel-primary" style="border: none; padding: 10px;">
            <div class="panel-heading" style="padding: 10px; color: #58595b; border-color: #58595b17; background-color: white; cursor: default;">
                <h4 class="panel-title" style="display: inline-block; vertical-align: middle; width: 100%;">
                    <div style="display: flex; align-items: center;">Identificação (Equipamento e Obra)</div>
                </h4>
            </div>
            <div class="panel-body" style="display: block;">
                <div class="row">
                    <div class="col-md-4"><b>Coliga/Empresa:</b> ${rowData.COLIGADA == 1
                ? "1 - Construtora Castilho"
                : rowData.COLIGADA == 12
                    ? "12 - Dromos"
                    : rowData.COLIGADA == 13
                        ? "13 - Epya"
                        : "-"
            }</div>
                    <div class="col-md-4"><strong>Obra:</strong> ${trataNull(rowData.OBRA)}</div>
                    <div class="col-md-4"><strong>Descrição do Equipamento:</strong> ${rowData.DESCRICAO || "-"}</div>
                </div>
                <div class="row">
                    <div class="col-md-4"><strong>Prefixo:</strong> ${rowData.PREFIXO || "-"}</div>
                </div>
            </div>
        </div>

        <!-- Detalhes Técnicos e Financeiros -->
        <div class="panel panel-primary" style="border: none; padding: 10px;">
            <div class="panel-heading" style="padding: 10px; color: #58595b; border-color: #58595b17; background-color: white; cursor: default;">
                <h4 class="panel-title" style="display: inline-block; vertical-align: middle; width: 100%;">
                    <div style="display: flex; align-items: center;">Detalhes Técnicos e Financeiros</div>
                </h4>
            </div>
            <div class="panel-body" style="display: block;">
                <div class="row">
                    <div class="col-md-4"><strong>Categoria:</strong> ${rowData.CODICONTA || "-"}</div>
                    <div class="col-md-4"><strong>Classe Mecânica:</strong> ${rowData.CLASSEMECANICA || "-"}</div>
                    <div class="col-md-4"><strong>Classe Operacional:</strong> ${rowData.CLASSEOPERACIONAL || "-"}</div>
                </div>
                <div class="row">
                    <div class="col-md-4"><strong>Ano de Fabricação:</strong> ${!rowData.ANO_FABRICACAO || rowData.ANO_FABRICACAO.toLowerCase() === "null" ? "-" : rowData.ANO_FABRICACAO}</div>
                    <div class="col-md-4"><strong>Modelo (Ano):</strong> ${!rowData.ANO_MODELO || rowData.ANO_MODELO.toLowerCase() === "null" ? "-" : rowData.ANO_MODELO}</div>
                    <div class="col-md-4"><strong>Placa:</strong> ${!rowData.PLACA || rowData.PLACA.toLowerCase() === "null" ? "-" : rowData.PLACA}</div>
                </div>
                <div class="row">
                    <div class="col-md-4"><strong>Chassis:</strong> ${!rowData.CHASSI || rowData.CHASSI.toLowerCase() === "null" ? "-" : rowData.CHASSI}</div>
                    <div class="col-md-4"><strong>Modelo:</strong> ${!rowData.MODELO || rowData.MODELO.toLowerCase() === "null" ? "-" : rowData.MODELO}</div>
                    <div class="col-md-4"><strong>Fabricante:</strong> ${!rowData.FABRICANTE || rowData.FABRICANTE.toLowerCase() === "null" ? "-" : rowData.FABRICANTE}</div>
                </div>
                <div class="row">
                    <div class="col-md-4"><b>Potência do Motor:</b> ${!rowData.POTENCIA || rowData.POTENCIA.toLowerCase() === "null" ? "-" : rowData.POTENCIA}</div>
                    <div class="col-md-4"><strong>Capacidade Operacional:</strong> ${!rowData.UN_MOBILIZADO || rowData.UN_MOBILIZADO.toLowerCase() === "null" ? "-" : rowData.UN_MOBILIZADO}</div>
                    <div class="col-md-4"><strong>Valor da Capacidade:</strong> ${!rowData.VALOR_MOBILIZADO || rowData.VALOR_MOBILIZADO.toLowerCase() === "null" ? "-" : rowData.VALOR_MOBILIZADO}</div>
                </div>
                  <div class="row">
                <div class="col-md-4"><strong>Valor Mobilização:</strong> ${!rowData.VALOR_MOBILIZADO ||
                rowData.VALOR_MOBILIZADO.toLowerCase() === "null"
                ? "-"
                : rowData.VALOR_MOBILIZADO
            }</div>
                <div class="col-md-4"><strong>Valor Extra:</strong> ${!rowData.VALOR_EXTRA || rowData.VALOR_EXTRA.toLowerCase() === "null"
                ? "-"
                : rowData.VALOR_EXTRA
            }</div>
                
                <div class="col-md-4">
    <b>Valor de Locação:</b>
    ${rowData.VALOR_LOCACAO
                ? "R$ " +
                parseFloat(rowData.VALOR_LOCACAO).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                })
                : "-"
            }
</div>
            </div>
            <div class="row">
                <div class="col-md-4"><strong>Mão de Obra:</strong> ${!rowData.MAODEOBRA || rowData.MAODEOBRA.toLowerCase() === "null"
                ? "-"
                : rowData.MAODEOBRA
            }</div>
            </div>
            </div>
        </div>

        <!-- Dados Operacionais -->
        <div class="panel panel-primary" style="border: none; padding: 10px;">
            <div class="panel-heading" style="padding: 10px; color: #58595b; border-color: #58595b17; background-color: white; cursor: default;">
                <h4 class="panel-title" style="display: inline-block; vertical-align: middle; width: 100%;">
                    <div style="display: flex; align-items: center;">Dados Operacionais</div>
                </h4>
            </div>
            <div class="panel-body" style="display: block;">
                <div class="row">
                    <div class="col-md-4"><b>Data de Chegada na Obra:</b> ${rowData.DATA_CHEGADA ? rowData.DATA_CHEGADA.split(" ")[0].split("-").reverse().join("/") : "-"}</div>
                    <div class="col-md-4"><strong>Km/Horas Atuais:</strong> ${rowData.KM_ATUAIS || "-"} / ${rowData.HORAS_ATUAIS || "-"}</div>
                    <div class="col-md-4"><strong>Tipo de Combustível:</strong> ${!rowData.COMBUSTIVEL || rowData.COMBUSTIVEL.toLowerCase() === "null" ? "-" : rowData.COMBUSTIVEL}</div>
                </div>
                  <div class="row">
                <div class="col-md-4"><strong>Capacidade do Tanque:</strong> ${!rowData.CAPACIDADE_COMBUSTIVEL ||
                rowData.CAPACIDADE_COMBUSTIVEL.toLowerCase() === "null"
                ? "-"
                : rowData.CAPACIDADE_COMBUSTIVEL
            }</div>
                <div class="col-md-4"><strong>Consumo Médio:</strong> ${rowData.RELACAO_KM_HORA || "-"
            }</div>
            </div>
            </div>
        </div>

        <!-- Fornecedor -->
        <div class="panel panel-primary" style="border: none; padding: 10px;">
            <div class="panel-heading" style="padding: 10px; color: #58595b; border-color: #58595b17; background-color: white; cursor: default;">
                <h4 class="panel-title" style="display: inline-block; vertical-align: middle; width: 100%;">
                    <div style="display: flex; align-items: center;">Fornecedor</div>
                </h4>
            </div>
            <div class="panel-body" style="display: block;">
                <div class="row">
                    <div class="col-md-4"><strong>CPF/CNPJ:</strong> ${!rowData.FORNECEDOR_CNPJ || rowData.FORNECEDOR_CNPJ.toLowerCase() === "null" ? "-" : rowData.FORNECEDOR_CNPJ}</div>
                    <div class="col-md-4"><strong>Nome / Razão Social:</strong> ${!rowData.FORNECEDOR || rowData.FORNECEDOR.toLowerCase() === "null" ? "-" : rowData.FORNECEDOR}</div>
                    <div class="col-md-4"><strong>Endereço:</strong> -</div>
                </div>
            </div>
        </div>
          <div class="panel panel-primary" style="border: none; padding: 10px;">
        <div class="panel-heading"
            style="padding: 10px; color: #58595b; border-color: #58595b17; background-color: #FFFFFF; cursor: default;">
            <h4 class="panel-title" style="display: inline-block; vertical-align: middle; width: 100%;">
                <div style="display: flex; align-items: center;">
                    Anexos
                </div>
            </h4>
        </div>
        <div class="panel-body" style="display: block;">
            <div class="panel panel-primary" style="border: 1px solid #ddd; padding: 10px;">
                <div class="panel-body">
                    <div class="row">
                    <h5 class="panel-title" style="color: grey;">Documentação Anexada</h5>
                    </div>
                </div>
            </div>
        </div>
    </div>

    </div>
    `;
        var modalId = 'modalDetalhesEquipamento_' + new Date().getTime();
        FLUIGC.modal({
            title: '<div style="visibility: hidden;">-</div>',
            content: modalContent,
            id: modalId,
            size: 'large',
            cssClass: 'meu-modal-anexo',
            actions: [{
                'label': 'Fechar',
                'autoClose': true
            }]
        });
    },
    abrirModalAnexos: function (rowData) {
        var modalContent = `
    <div class="panel-body" style="display: block;">
        <div class="panel panel-primary" style="border: none; padding: 10px;">
            <div class="panel-heading" style="padding: 10px; color: #58595b; border-color: #58595b17; background-color: white; cursor: default;">
                <h4 class="panel-title" style="display: inline-block; vertical-align: middle; width: 100%;">
                    <div style="display: flex; align-items: center;">Anexos do Equipamento</div>
                </h4>
            </div>
            <div class="panel-body" style="display: block;">
                <div class="row" style="margin-bottom: 10px;">
                    <div class="col-md-12">
                        <i class="flaticon flaticon-close icon-sm" style="color: red;"></i> Documentação do Equipamento
                        <button style="float: right;" class="btnDownload" data-anexo="documentacao">Download</button>
                    </div>
                </div>
                <div class="row" style="margin-bottom: 10px;">
                    <div class="col-md-12">
                        <i class="flaticon flaticon-close icon-sm" style="color: red;"></i> Foto do Equipamento
                        <button style="float: right;" class="btnDownload" data-anexo="foto">Download</button>
                    </div>
                </div>
                <div class="row" style="margin-bottom: 10px;">
                    <div class="col-md-12">
                        <i class="flaticon flaticon-close icon-sm" style="color: red;"></i> Laudo Técnico
                        <button style="float: right;" class="btnDownload" data-anexo="laudo">Download</button>
                    </div>
                </div>
                <div class="row" style="margin-bottom: 10px;">
                    <div class="col-md-12">
                        <i class="flaticon flaticon-close icon-sm" style="color: red;"></i> Plano de Manutenção
                        <button style="float: right;" class="btnDownload" data-anexo="plano">Download</button>
                    </div>
                </div>
                <div class="row" style="margin-bottom: 10px;">
                    <div class="col-md-12">
                        <i class="flaticon flaticon-close icon-sm" style="color: red;"></i> ART
                        <button style="float: right;" class="btnDownload" data-anexo="art">Download</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

        var modalId = 'modalAnexos_' + new Date().getTime();
        FLUIGC.modal({
            title: 'Anexos do Equipamento',
            content: modalContent,
            id: modalId,
            size: 'large',
            actions: [{
                'label': 'Fechar',
                'autoClose': true
            }]
        });

        // Aqui você pode adicionar os eventos de download
        $(`#${modalId} .btnDownload`).click(function () {
            var tipoAnexo = $(this).data("anexo");
            // Lógica de download vai aqui, por exemplo:
            alert("Baixando: " + tipoAnexo + " do equipamento " + rowData.PLACA);
        });
    }



});

function trataNull(valor) {
    return valor == null || valor === "" ? "-" : valor;
}


