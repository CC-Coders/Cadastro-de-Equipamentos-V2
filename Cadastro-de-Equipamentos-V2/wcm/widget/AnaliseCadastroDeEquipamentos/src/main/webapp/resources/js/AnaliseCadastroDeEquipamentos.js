
var MyWidget = SuperWidget.extend({
    variavelNumerica: null,
    variavelCaracter: null,

    init: function () {
        var self = this;
        console.log("94")
        var $button = $("#button-search");
        var originalText = "Buscar";
        var loadingInterval;

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
        $('.date').daterangepicker({
            singleDatePicker: true,
            showDropdowns: true,
            autoUpdateInput: false,
            autoApply: true,
            locale: {
                format: 'DD/MM/YYYY',
                applyLabel: 'Aplicar',
                cancelLabel: 'Cancelar',
                daysOfWeek: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
                monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
                firstDay: 1
            }
        });

        $('.date').on('apply.daterangepicker', function (ev, picker) {
            $(this).val(picker.startDate.format('DD/MM/YYYY'));
        });

        $('.date').on('cancel.daterangepicker', function (ev, picker) {
            $(this).val('');
        });

        $('#filtrosHeader').click(function () {
            var filtrosBody = $('#filtrosBody');
            var setinha = $('#setinha');

            if (filtrosBody.is(':visible')) {
                filtrosBody.slideUp(300);
                setinha.css('transform', 'rotate(-90deg)');
            } else {
                filtrosBody.slideDown(300);
                setinha.css('transform', 'rotate(0deg)');
            }
        });
    },

    bindings: {
        local: {
            'execute': ['click_executeAction']
        },
        global: {}
    },

    executeAction: function (htmlElement, event) { },





    buscaResultados: function () {
        var that = this;
        var filtros = {
            ID_FLUIG: $("#nsolicitacao").val(),
            SOLICITANTE: $("#solicitante").val(),
            OBRA: $("#obra").val(),
            DATA_ABERTURA: $("#dataAbertura").val(),
            CRIADO_EM: $("#criado").val(),
            FINALIZADO_EM: $("#finalizado").val()
        };

        var constraints = [];
        for (var campo in filtros) {
            var valor = filtros[campo];
            if (valor && valor.trim() !== "") {
                if (campo === "DATA_ABERTURA") {
                    var partes = valor.split("/");
                    if (partes.length === 3) {
                        valor = partes[2] + "-" + partes[1] + "-" + partes[0];
                    }
                }
                constraints.push(
                    DatasetFactory.createConstraint(
                        campo,
                        valor,
                        valor,
                        ConstraintType.MUST
                    )
                );
            }
        }
        DatasetFactory.getDataset("RetornaAnaliseEquipamentos", null, constraints, null, {
            success: function (dataset) {
                if (!dataset || !dataset.values || dataset.values.length === 0) {
                    FLUIGC.toast({
                        title: "Atenção: ",
                        message: "Nenhum dado encontrado no dataset.",
                        type: "warning"
                    });
                    return;
                }
                var resultadoBruto = dataset.values[0].RESULT;
                var registros = [];
                try {
                    registros = resultadoBruto ? JSON.parse(resultadoBruto) : dataset.values;
                } catch (e) {
                    console.error("❌ Erro ao fazer parse do RESULT:", e);
                    registros = [];
                }
                var dados = registros.map(function (item) {
                    return {
                        ID_FLUIG: item.ID_FLUIG || "-",
                        PERIODO_LOCACAO: item.periodoLocacao || "-",
                        VALOR_FIPE: item.VALOR_FIPE || "-",
                        VALOR_IMPLEMENTO: item.VALOR_IMPLEMENTO || "-",
                        VALOR_EQUIPAMENTO: item.VALOR_EQUIPAMENTO || "-",
                        ID: item.ID || "-",
                        USUARIO_LOGADO: item.USUARIO_ANALISE || "-",
                        SOLICITANTE: item.solicitante || "-",
                        OBRA: item.obra || "-",
                        FORNECEDOR: item.hiddenFORNECEDOR || "-",
                        DATA_ABERTURA: item.dataAberturaSol || "-",
                        CRIADO_EM: "-",
                        FINALIZADO_EM: (item.FINALIZADO_EM && item.FINALIZADO_EM !== "null" && item.FINALIZADO_EM !== "")
                            ? item.FINALIZADO_EM
                            : "-",
                        STATUS_EQUIP_ITEM: item.STATUS_EQUIP_ITEM || "-",
                        DESC_STATUS_EQUIPAMENTO: item.DESC_STATUS_EQUIPAMENTO || "-",
                        ACOES: `
                            <button class="btnAnexos" title="Anexos" style="border:none; background:none">
                                <i class="flaticon flaticon-paperclip icon-md" aria-hidden="true"></i>
                            </button>`
                    };
                });
                if ($.fn.DataTable.isDataTable("#dataTableFilter")) {
                    $("#dataTableFilter").DataTable().clear().destroy();
                }

                var dataTable = $("#dataTableFilter").DataTable({
                    data: dados,
                    columns: [
                        { data: "ID", title: "ID", visible: false },
                        { data: "ID_FLUIG", title: "Nº DA SOLICITAÇÃO" },
                        { data: "PERIODO_LOCACAO", title: "PERIODO_LOCACAO", visible: false },
                        { data: "VALOR_IMPLEMENTO", title: "VALOR_IMPLEMENTO", visible: false },
                        { data: "VALOR_FIPE", title: "VALOR_FIPE", visible: false },
                        { data: "VALOR_EQUIPAMENTO", title: "VALOR_EQUIPAMENTO", visible: false },
                        { data: "USUARIO_LOGADO", title: "USUARIO_LOGADO", visible: false },
                        { data: "SOLICITANTE", title: "SOLICITANTE" },
                        { data: "OBRA", title: "OBRA" },
                        { data: "FORNECEDOR", title: "FORNECEDOR" },
                        {
                            data: "DATA_ABERTURA",
                            title: "DATA DE ABERTURA",
                            render: function (data, type, row) {
                                if (!data) return "-";
                                var partes = data.split("-"); // "YYYY-MM-DD"
                                if (partes.length !== 3) return data;
                                return partes[2] + "/" + partes[1] + "/" + partes[0]; // DD/MM/YYYY
                            }
                        },
                        { data: "CRIADO_EM", title: "CRIADO EM" },
                        { data: "FINALIZADO_EM", title: "FINALIZADO EM" },
                        {
                            data: null,
                            title: "STATUS",
                            render: function (data, type, row) {
                                const codigo = parseInt(row.STATUS_EQUIP_ITEM);
                                const desc = row.DESC_STATUS_EQUIPAMENTO || "-";
                                if (isNaN(codigo)) return desc;
                                switch (codigo) {
                                    case 2: return "Pendente";
                                    case 3: return "Realizado";
                                    case 7: return "Em Andamento";
                                    default: return desc;
                                }
                            }
                        },
                        {
                            data: null,
                            title: "AÇÕES",
                            render: function (data, type, row) {
                                return `
                                    <div style="cursor: pointer; display: flex; align-items: center; gap: 10px">
                                        <button class="btnEdit" title="Editar" style="border:none; background:none">
                                            <i class="flaticon flaticon-edit-square icon-md" aria-hidden="true"></i>
                                        </button>
                                        <button class="btnSolicitacao" title="Abrir Solicitação" 
                                            style="border:none; background:none" 
                                            data-processo="${row.ID_FLUIG}">
                                            <i class="flaticon flaticon-documents icon-md" aria-hidden="true"></i>
                                        </button>
                                    </div>
                                `;
                            },
                        }
                    ],
                    searching: false,
                    paging: false,
                    info: false,
                    ordering: false,
                    stripeClasses: [],
                    language: {
                        emptyTable: "Nenhum registro encontrado"
                    },
                });

                $("#dataTableFilter").off("click", ".btnSolicitacao").on("click", ".btnSolicitacao", function () {
                    console.log("clicou")
                    var processo = $(this).data("processo");
                    console.log(processo)
                    if (processo && processo !== "-") {
                        var url = "http://desenvolvimento.castilho.com.br:3232/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=" + processo;
                        window.open(url, '_blank');
                    } else {
                        FLUIGC.toast({
                            title: "Atenção",
                            message: "Número de processo não disponível",
                            type: "warning"
                        });
                    }
                });
                $("#dataTableFilter").off("click", ".btnEdit").on("click", ".btnEdit", function () {
                    var rowData = dataTable.row($(this).closest("tr")).data();
                    if (rowData) {
                        that.abrirModalEdit(rowData);
                    } else {
                        console.warn("⚠️ [btnEdit] Nenhum dado encontrado para esta linha!");
                    }
                });
                $(document).trigger("buscaFinalizada");
            },
            error: function (err) {
                console.error("Erro ao buscar dataset:", err);
                $(document).trigger("buscaFinalizada");
            }
        });
    },



    abrirModalEdit: function (rowData) {
        var idContrato = rowData.ID;
        var usuarioLogado = rowData.USUARIO_LOGADO
        var modalId = 'modalEditEquipamento_' + new Date().getTime();
        var modalContent = `
            <div class="panel-body" style="display:block; height: 100%;">
                <div class="panel panel-primary" style="border:none; padding:10px; height: 100%;">
                    <div class="panel-body table-container" style="height: calc(100% - 60px); padding:0; overflow-y: auto;">
                        <table id="dataTableEdit" class="table table-bordered" style="width: 100%; margin: 0;">
                            <thead>
                                <tr>
                                    <th style="width: 80px;">Prefixo</th>
                                    <th style="width: 150px;">Descrição</th>
                                    <th style="width: 100px;">Marca</th>
                                    <th style="width: 100px;">Modelo</th>
                                    <th style="width: 120px;">Período Locação</th>
                                    <th style="width: 120px;">Valor Locação (R$)</th> 
                                    <th style="width: 120px;">Valor Atual (R$)</th>  
                                    <th style="width: 100px;">FIPE (R$)</th>   
                                    <th style="width: 120px;">Implemento (R$)</th>   
                                    <th style="width: 140px;">Depreciação Implemento (R$)</th> 
                                    <th style="width: 140px;">Preço Equipamento (R$)</th> 
                                    <th style="width: 140px;">Classificação do Bem</th> 
                                    <th style="width: 100px;">Mão de Obra</th>
                                    <th style="width: 100px;">Referência</th>
                                    <th style="width: 80px;">Ações</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        FLUIGC.modal({
            title: 'Editar Equipamento',
            content: modalContent,
            id: modalId,
            size: 'full',
            cssClass: 'meu-modal-edit',
            actions: [
                { label: 'Fechar', autoClose: true },
                {
                    label: 'Editar',
                    autoClose: false,
                    classType: 'btn-primary btn-editar-equipamento'
                }
            ]
        });
        var c = [DatasetFactory.createConstraint("ID_TCNT_AUXILIAR", idContrato, idContrato, ConstraintType.MUST)];
        DatasetFactory.getDataset("RetornaDetalhesEquipamentos", null, c, null, {
            success: function (ds) {
                if (!ds || !ds.values || ds.values.length === 0) {
                    FLUIGC.toast({
                        title: "Aviso: ",
                        message: "Nenhum equipamento encontrado para este contrato.",
                        type: "warning"
                    });
                    return;
                }
                var tableData = ds.values.map(function (item) {
                    console.log(rowData)
                    console.log(item);
                    return {
                        prefixo: item.PREFIXO || "-",
                        descricao: item.DESCRICAO || "-",
                        marca: item.FABRICANTE || "-",
                        modelo: item.MODELO || "-",
                        periodo_locacao: rowData.PERIODO_LOCACAO || "-",
                        valor_fipe: rowData.VALOR_FIPE || "-",
                        valor_implemento: rowData.VALOR_IMPLEMENTO || "-",
                        valor_atual: rowData.VALOR_EQUIPAMENTO || "-",
                        valor_locacao: item.VALOR_LOCACAO || "-",
                        mao_obra: item.MAODEOBRA || "-",
                        classificacaoBem: item.CLASSIFICACAO_BEM || "-"
                    };
                });
                var alturaMaxima = $('.meu-modal-edit .table-container').height();
                $("#dataTableEdit").DataTable({
                    data: tableData,
                    destroy: true,
                    columns: [
                        { data: "prefixo", width: "80px" },
                        { data: "descricao", width: "150px" },
                        { data: "marca", width: "100px" },
                        { data: "modelo", width: "100px" },
                        {
                            data: "periodo_locacao",
                            width: "120px",
                            render: function (data, type, row) {
                                if (!data || !data.includes("até")) return data || "-";
                                try {
                                    var partes = data.split(" até ");
                                    var inicio = partes[0].trim().split("/");
                                    var fim = partes[1].trim().split("/");
                                    var d1 = new Date(inicio[2], inicio[1] - 1, inicio[0]);
                                    var d2 = new Date(fim[2], fim[1] - 1, fim[0]);
                                    if (isNaN(d1) || isNaN(d2)) return data;
                                    var diffDias = Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
                                    return `${diffDias} dias`;
                                } catch (e) {
                                    return data;
                                }
                            }
                        },
                        {
                            data: "valor_locacao",
                            width: "120px",
                            className: "dt-right",
                            render: function (data, type, row) {
                                if (!data || data === "-" || data === "null") return "-";

                                var s = String(data).trim();
                                if (s.indexOf(',') > -1 && s.indexOf('.') > -1) {
                                    s = s.replace(/\./g, '').replace(',', '.');
                                } else if (s.indexOf(',') > -1) {
                                    s = s.replace(',', '.');
                                }
                                var numero = parseFloat(s);
                                if (isNaN(numero)) return "-";

                                return numero.toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL"
                                });
                            }
                        },
                        {
                            data: null,
                            width: "120px",
                            render: function (data, type, row) {
                                const valor = row.valor_atual && row.valor_atual !== "-" && row.valor_atual !== "null"
                                    ? formatarMoeda(row.valor_atual)
                                    : "";
                                return `<input type="text" class="form-control valorAtual" placeholder="R$ 0,00" value="${valor}">`;
                            }
                        },
                        {
                            data: null,
                            width: "100px",
                            render: function (data, type, row) {
                                const valor = row.valor_fipe && row.valor_fipe !== "-" && row.valor_fipe !== "null"
                                    ? formatarMoeda(row.valor_fipe)
                                    : "";
                                return `<input type="text" class="form-control valorFipe" placeholder="R$ 0,00" value="${valor}">`;
                            }
                        },
                        {
                            data: null,
                            width: "120px",
                            render: function (data, type, row, meta) {
                                const valor = row.valor_implemento && row.valor_implemento !== "-" && row.valor_implemento !== "null"
                                    ? formatarMoeda(row.valor_implemento)
                                    : "";
                                return `<input type="text" class="form-control valorImplemento" 
                                         placeholder="R$ 0,00" 
                                         value="${valor}"
                                         data-row-index="${meta.row}">`;
                            }
                        },
                        {
                            data: null,
                            width: "100px",
                            render: function (data, type, row, meta) {
                                var valorBase = parseFloat(row.implemento) || 0;
                                var resultado = (valorBase * 0.05 * 10).toFixed(2);
                                return `<input type="text" class="form-control depreciacaoImplemento" 
                                         value="${resultado}" 
                                         placeholder="R$ 0,00" 
                                         readonly 
                                         data-row-index="${meta.row}">`;
                            }
                        },
                        {
                            data: null,
                            width: "100px",
                            render: function (data, type, row, meta) {
                                var valorBase = parseFloat(row.fipe) || 0;
                                var valorImplemento = parseFloat(row.implemento) || 0;
                                var depImplemento = valorImplemento * 0.05 * 10;
                                var resultado = (valorBase + depImplemento).toFixed(2);
                                var input = `<input type="text" class="form-control precoEquipamento" 
                                                  value="${resultado}" 
                                                  placeholder="R$ 0,00" 
                                                  readonly 
                                                  data-row-index="${meta.row}">`;

                                return input;
                            }
                        },
                        {
                            data: null,
                            width: "140px",
                            render: function (data, type, row, meta) {
                                var valorLocacao = parseFloat(row.valor_locacao) || 0;
                                var maoObra = parseFloat(row.mao_obra) || 0;
                                var precoEquipamento = 0;
                                var table = $('#dataTableEdit').DataTable();
                                var rowNode = table.row(meta.row).node();
                                if (rowNode) {
                                    var precoInput = $(rowNode).find('.precoEquipamento');
                                    if (precoInput.length) {
                                        precoEquipamento = parseFloat(precoInput.val()) || 0;
                                    }
                                }

                                var percentual = 0;
                                if (precoEquipamento > 0) {
                                    percentual = ((valorLocacao - maoObra) / precoEquipamento * 100).toFixed(2);
                                }

                                console.log("Linha", meta.row, "- Valor Locação:", valorLocacao, "Mão de Obra:", maoObra, "Preço Equipamento:", precoEquipamento, "Classificação Bem (%):", percentual);

                                return `<input type="text" class="form-control classificacaoBem" value="${percentual}" readonly>`;
                            }
                        },
                        {
                            data: "mao_obra",
                            width: "100px",
                            render: function (data, type, row) {
                                var valor = parseFloat(data);
                                if (!isNaN(valor)) {
                                    return valor > 0 ? 'SIM' : 'NÃO';
                                }
                                return 'NÃO';
                            }
                        },
                        {
                            data: null,
                            width: "100px",
                            render: function () {
                                return `<input type="text" class="form-control referencia">`;
                            }
                        },
                        {
                            data: null,
                            render: function () {
                                return `<button class="btnSalvarItem btn btn-primary btn-sm">Salvar</button>`;
                            }
                        }
                    ],
                    scrollX: true,
                    scrollCollapse: false,
                    paging: false,
                    searching: false,
                    info: false,
                    ordering: false,
                    autoWidth: false,
                    fixedColumns: false,
                    stripeClasses: [],
                    language: { emptyTable: "Nenhum registro encontrado" }
                });

                var table = $("#dataTableEdit").DataTable();
                $(document).on('input', '#dataTableEdit .valorAtual, #dataTableEdit .valorFipe, #dataTableEdit .valorImplemento', function () {
                    let valor = $(this).val().replace(/\D/g, "");
                    let numero = (parseInt(valor, 10) / 100).toFixed(2);
                    numero = numero.replace('.', ',');
                    numero = numero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                    $(this).val('R$ ' + numero);
                });

                table.on('draw.dt', function () {
                    table.rows().every(function () {
                        const row = $(this.node());
                        const valorFipe = limparMoeda(row.find('.valorFipe').val());
                        const valorImplemento = limparMoeda(row.find('.valorImplemento').val());
                        const valorLocacao = limparMoeda(row.find('td:eq(5)').text());
                        const maoObra = limparMoeda(row.find('td:eq(10)').text());

                        const depreciacaoImplemento = (valorImplemento * 0.05 * 10).toFixed(2);
                        row.find('.depreciacaoImplemento').val(formatarMoeda(depreciacaoImplemento));

                        const precoEquipamento = (valorFipe + parseFloat(depreciacaoImplemento)).toFixed(2);
                        row.find('.precoEquipamento').val(formatarMoeda(precoEquipamento));

                        let percentual = 0;
                        if (parseFloat(precoEquipamento) > 0) {
                            percentual = ((valorLocacao - maoObra) / parseFloat(precoEquipamento) * 100).toFixed(1);
                        }

                        const campoClassificacao = row.find('.classificacaoBem');
                        campoClassificacao.val(formatarPercentual(percentual));
                        campoClassificacao.css('box-shadow', percentual > 3
                            ? 'inset 0 0 0 1000px #f8d7da'
                            : 'inset 0 0 0 1000px #d4edda');
                    });
                });
                table.draw();
                $('#dataTableEdit').find('input').prop('readonly', true);
                $('#dataTableEdit').find('.btnSalvarItem').prop('disabled', true);

                $(document).on('input', '#dataTableEdit .valorFipe, #dataTableEdit .valorImplemento', function () {
                    var row = $(this).closest('tr');

                    // --- Captura dos valores numéricos ---
                    var valorFipe = limparMoeda(row.find('.valorFipe').val());
                    var valorImplemento = limparMoeda(row.find('.valorImplemento').val());
                    var valorLocacao = limparMoeda(row.find('td:eq(5)').text());
                    var maoObra = limparMoeda(row.find('td:eq(10)').text());

                    // --- Cálculo da depreciação ---
                    var depreciacao = (valorImplemento * 0.05 * 10).toFixed(2);
                    row.find('.depreciacaoImplemento').val(formatarMoeda(depreciacao));

                    // --- Cálculo do preço do equipamento ---
                    var preco = (valorFipe + parseFloat(depreciacao)).toFixed(2);
                    row.find('.precoEquipamento').val(formatarMoeda(preco));

                    // --- Cálculo da classificação do bem ---
                    var percentual = 0;
                    if (parseFloat(preco) > 0) {
                        percentual = ((valorLocacao - maoObra) / parseFloat(preco) * 100).toFixed(1);
                    }

                    var campoClassificacao = row.find('.classificacaoBem');
                    campoClassificacao.val(formatarPercentual(percentual));

                    // --- Aplica cores conforme o valor ---
                    campoClassificacao.removeClass('percentual-alto percentual-baixo');
                    if (percentual > 3) {
                        campoClassificacao.css('box-shadow', 'inset 0 0 0 1000px #f8d7da');
                    } else {
                        campoClassificacao.css('box-shadow', 'inset 0 0 0 1000px #d4edda');
                    }
                });

                $(document).off('click', '.btn-editar-equipamento').on('click', '.btn-editar-equipamento', function () {
                    const $modal = $('#' + modalId);
                    const $row = $modal.find('#dataTableEdit tbody tr').eq(0);
                    const prefixo = $row.find('td').eq(0).text().trim();
                    if (!prefixo) {
                        FLUIGC.toast({
                            title: "Erro",
                            message: "Prefixo não encontrado para atualizar.",
                            type: "danger"
                        });
                        return;
                    }
                    if (usuarioLogado !== WCMAPI.userCode) {
                        FLUIGC.toast({
                            title: "Atenção",
                            message: "Este equipamento já está sendo analisado pelo usuário " + usuarioLogado + ".",
                            type: "warning"
                        });

                        $modal.find('#dataTableEdit input').prop('readonly', true);
                        $modal.find('#dataTableEdit .btnSalvarItem').prop('disabled', true);
                        return;
                    }

                    $modal.find('#dataTableEdit input').prop('readonly', false);
                    $modal.find('#dataTableEdit .btnSalvarItem').prop('disabled', false);
                    $modal.find('#dataTableEdit .depreciacaoImplemento, #dataTableEdit .precoEquipamento, #dataTableEdit .classificacaoBem')
                        .prop('readonly', true);

                    var c1 = DatasetFactory.createConstraint("PREFIXO", prefixo, prefixo, ConstraintType.MUST);
                    var c2 = DatasetFactory.createConstraint("MODO", "EDITAR_APENAS_STATUS", "EDITAR_APENAS_STATUS", ConstraintType.MUST);
                    var c3 = DatasetFactory.createConstraint("STATUS", "7", "7", ConstraintType.MUST);
                    var c4 = DatasetFactory.createConstraint("USUARIO_ANALISE", WCMAPI.userCode, WCMAPI.userCode, ConstraintType.MUST);

                    DatasetFactory.getDataset("dsUpdateAnaliseEquipamento", null, [c1, c2, c3, c4], null, {
                        success: function (ds) {
                            var statusResp = ds.values[0].status;
                            var mensagem = ds.values[0].mensagem;
                            FLUIGC.toast({
                                title: statusResp === "SUCCESS" ? "Sucesso: " : "Erro: ",
                                message: mensagem,
                                type: statusResp === "SUCCESS" ? "success" : "danger"
                            });
                        },
                        error: function (err) {
                            console.error("Erro ao atualizar status:", err);
                            FLUIGC.toast({
                                title: "Erro",
                                message: "Falha ao atualizar o status do equipamento.",
                                type: "danger"
                            });
                        }
                    });
                });


                $('#dataTableEdit').on('click', '.btnSalvarItem', function () {
                    var row = $(this).closest('tr');
                    var rowData = $('#dataTableEdit').DataTable().row(row).data();
                    var prefixo = rowData.prefixo;
                    var valorFipe = limparMoeda(row.find('.valorFipe').val());
                    var valorImplemento = limparMoeda(row.find('.valorImplemento').val());
                    var valorAtual = limparMoeda(row.find('.valorAtual').val());
                    var valorDepreciacao = limparMoeda(row.find('.depreciacaoImplemento').val());
                    var classificacaoBem = limparMoeda(row.find('.classificacaoBem').val());
                    var precoEquipamento = limparMoeda(row.find('.precoEquipamento').val());
                    var dataFinalizado = moment().format('DD/MM/YYYY');

                    var c1 = DatasetFactory.createConstraint("PREFIXO", prefixo, prefixo, ConstraintType.MUST);
                    var c2 = DatasetFactory.createConstraint("MODO", "EDITAR_TUDO", "EDITAR_TUDO", ConstraintType.MUST);
                    var c3 = DatasetFactory.createConstraint("VALOR_EQUIPAMENTO", valorAtual, valorAtual, ConstraintType.MUST);
                    var c4 = DatasetFactory.createConstraint("VALOR_FIPE", valorFipe, valorFipe, ConstraintType.MUST);
                    var c5 = DatasetFactory.createConstraint("VALOR_IMPLEMENTO", valorImplemento, valorImplemento, ConstraintType.MUST);
                    var c6 = DatasetFactory.createConstraint("VALOR_DEPRECIACAO", valorDepreciacao, valorDepreciacao, ConstraintType.MUST);
                    var c7 = DatasetFactory.createConstraint("PRECO_EQUIPAMENTO", precoEquipamento, precoEquipamento, ConstraintType.MUST);
                    var c8 = DatasetFactory.createConstraint("FINALIZADO_EM", dataFinalizado, dataFinalizado, ConstraintType.MUST);
                    var c9 = DatasetFactory.createConstraint("CLASSIFICACAO_BEM", classificacaoBem, classificacaoBem, ConstraintType.MUST);

                    DatasetFactory.getDataset("dsUpdateAnaliseEquipamento", null, [c1, c2, c3, c4, c5, c6, c7, c8, c9], null, {
                        success: function (ds) {
                            var status = ds.values[0].status;
                            var mensagem = ds.values[0].mensagem;
                            FLUIGC.toast({
                                title: status === "SUCCESS" ? "Sucesso: " : "Erro: ",
                                message: mensagem,
                                type: status === "SUCCESS" ? "success" : "danger"
                            });
                        },
                        error: function (err) {
                            console.error("Erro ao chamar dataset:", err);
                            FLUIGC.toast({
                                title: "Erro",
                                message: "Falha ao atualizar o equipamento.",
                                type: "danger"
                            });
                        }
                    });
                });
            },
            error: function (err) {
                console.error("Erro ao buscar dataset:", err);
                FLUIGC.toast({
                    title: "Erro",
                    message: "Não foi possível carregar os equipamentos.",
                    type: "danger"
                });
            }
        });
    }

});


function createMultipleLinks(anexoIds) {
    if (!anexoIds || anexoIds === "null" || anexoIds === "NULL" || anexoIds.toString().trim() === "") {
        return "-";
    }
    var ids = anexoIds.toString().split(',');
    var links = [];
    ids.forEach(function (id, index) {
        var cleanId = id.trim();
        if (cleanId && cleanId !== "null") {
            links.push(
                `<a href="/portal/p/embed/document/${cleanId}" target="_blank" style="color: #007bff; text-decoration: none; display: block; margin-bottom: 5px;">
                    <i class="flaticon flaticon-download icon-sm" aria-hidden="true"></i> Download ${links.length > 0 ? index + 1 : ''}
                </a>`
            );
        }
    });

    return links.length > 0 ? links.join('') : "-";
}

function formatarMoeda(valor) {
    if (valor == null || valor === "" || valor === "-") return "";
    let numero = parseFloat(String(valor).replace(/[^\d,.-]/g, '').replace(',', '.'));
    if (isNaN(numero)) return "";
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function limparMoeda(valor) {
    if (!valor) return 0;
    valor = String(valor).replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(valor) || 0;
}


function formatarPercentual(valor) {
    if (valor == null || valor === "" || isNaN(valor)) return "0%";
    return parseFloat(valor).toLocaleString('pt-BR', { minimumFractionDigits: 1 }) + '%';
}

