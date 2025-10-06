var MyWidget = SuperWidget.extend({
    variavelNumerica: null,
    variavelCaracter: null,

    init: function () {
        console.log("18");
        var self = this;
        $("#button-search").click(function () {
            self.buscaResultados();
        });
        $('#filtrosHeader').click(function () {
            console.log("1")
            var filtrosBody = $('#filtrosBody');
            var setinha = $('#setinha');

            if (filtrosBody.is(':visible')) {
                console.log("2")
                filtrosBody.slideUp(300);
                setinha.css('transform', 'rotate(-90deg)');
            } else {
                console.log("3")
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

    executeAction: function (htmlElement, event) {
    },

    // buscaResultados: function () {
    //     var self = this;
    //     var filtro = $("#pesquisar").val();
    //     var valor = $("#termo").val();

    //     console.log("📥 Valores capturados:", { filtro: filtro, valor: valor });

    //     var constraints = [
    //         DatasetFactory.createConstraint("TIPOFILTRO", filtro, filtro, ConstraintType.MUST),
    //         DatasetFactory.createConstraint("VALORFILTRO", valor, valor, ConstraintType.MUST)
    //     ];

    //     console.log("📤 Constraints enviadas:", constraints);

    //     DatasetFactory.getDataset("dsConsultaVIEW_EQUIPAMENTOS_CONTRATOS", null, constraints, null, {
    //         success: function (dataset) {
    //             console.log("✅ Dataset retornado:", dataset);

    //             if (dataset.values && dataset.values.length > 0 && dataset.values[0].RESULT) {
    //                 console.log("📊 RESULT encontrado:", dataset.values[0].RESULT);
    //                 var dados = JSON.parse(dataset.values[0].RESULT);
    //                 console.log("📊 Dados parseados:", dados);
    //                 self.retornaDataset(dados); // popula a tabela
    //             } else {
    //                 console.warn("⚠️ Nenhum dado retornado ou RESULT vazio");
    //                 self.retornaDataset([]); // tabela vazia
    //             }
    //         },
    //         error: function (err) {
    //             console.error("❌ Erro ao buscar dataset:", err);
    //             self.retornaDataset([]); // evita crash
    //         }
    //     });
    // },
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
            STATUS: $("input[name='decisao']:checked").val() // ativo/inativo
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
        console.log("📤 Constraints enviadas:", constraints);

        DatasetFactory.getDataset("dsConsultaVIEW_EQUIPAMENTOS_CONTRATOS", null, constraints, null, {
            success: function (dataset) {
                console.log("✅ Dataset retornado:", dataset);

                if (dataset.values && dataset.values.length > 0 && dataset.values[0].RESULT) {
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
            }
        });
    },


    retornaDataset: function (dados) {

        if (!$.fn.DataTable.isDataTable("#dataTableFilter")) {
            $("#dataTableFilter").DataTable({
                data: dados,
                language: {
                    "sEmptyTable": "Nenhum registro encontrado",
                    "lengthMenu": "Resultados por página _MENU_",
                    "sInfo": "Mostrando de _START_ até _END_ de _TOTAL_ registros",
                    "sInfoEmpty": "Mostrando 0 até 0 de 0 registros",
                    "sInfoFiltered": "(Filtrados de _MAX_ registros)",
                    "sInfoPostFix": "",
                    "sInfoThousands": ".",
                    "sLengthMenu": "_MENU_ resultados por página",
                    "sLoadingRecords": "Carregando...",
                    "sProcessing": "Processando...",
                    "sZeroRecords": "Nenhum registro encontrado",
                    "sSearch": "Pesquisar",
                    "oPaginate": {
                        "sNext": "Próximo",
                        "sPrevious": "Anterior",
                        "sFirst": "Primeiro",
                        "sLast": "Último"
                    },
                    "oAria": {
                        "sSortAscending": ": Ordenar colunas de forma ascendente",
                        "sSortDescending": ": Ordenar colunas de forma descendente"
                    },
                    "select": {
                        "rows": {
                            "_": "Selecionado %d linhas",
                            "0": "Nenhuma linha selecionada",
                            "1": "Selecionado 1 linha"
                        }
                    },
                    "buttons": {
                        "copy": "Copiar para a área de transferência",
                        "copyTitle": "Cópia bem sucedida",
                        "copySuccess": {
                            "1": "Uma linha copiada com sucesso",
                            "_": "%d linhas copiadas com sucesso"
                        }
                    }
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
                        data: "VALOR_LOCACAO", title: "VALOR DE LOCAÇÃO", render: function (data, type, row) {
                            return (data ?? "-") === "-" ? "-" : data;
                        }
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
                        }
                    }
                ],
                destroy: true
            });
        } else {
            var table = $("#dataTableFilter").DataTable();
            table.clear();
            table.rows.add(dados).draw();
        }
    }

});
