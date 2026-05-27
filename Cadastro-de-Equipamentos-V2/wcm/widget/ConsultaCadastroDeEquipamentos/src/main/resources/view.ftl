<div id="ConsultaCadastroDeEquipamentos_${instanceId}" class="super-widget wcm-widget-class fluig-style-guide"
    data-params="ConsultaCadastroDeEquipamentos.instance()">

    <body>
        <div class="fluig-style-guide">
            <div class="panel panel-primary" id="background">
                <div class="panel-heading" style="padding: 10px">
                    <div class="details detailsHide"></div>
                    <h4 class="panel-title" style="display: inline-block; vertical-align: middle">Consulta de
                        Equipamentos</h4>
                </div>
                <div class="panel-body" style="display: black">
                    <div class="panel panel-primary" style="border: none; padding: 10px;">
                        <div class="panel-heading"
                            style="padding: 10px; color: #58595b; border-color: #58595b17; background-color: white; cursor: pointer;"
                            id="filtrosHeader">
                            <div class="details detailsHide"></div>
                            <h4 class="panel-title" style="display: inline-block; vertical-align: middle; width: 100%;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div style="display: flex; align-items: center;">
                                        <span class="fluigicon fluigicon-filter"
                                            style="margin-right: 8px; font-size: 16px;"></span>
                                        Filtros de Pesquisa
                                    </div>
                                    <span id="setinha"
                                        style="transition: transform 0.3s; font-size: 16px; color: #58595b; background: #f8f9fa; padding: 8px; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                                        <span class="fluigicon fluigicon-chevron-down"></span>
                                    </span>
                                </div>
                            </h4>
                        </div>
                        <div class="panel-body" id="filtrosBody" style="display: block">

                            <div class="row">
                                <div class="col-md-4">
                                    <div class="form-input">
                                        <label>Prefixo:</label> <input type="text" id="prefixo" name="prefixo"
                                            class="form-control inputInfoChamado inputStyle" />
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-input">
                                        <label>Descrição:</label> <input type="text" id="descricao" name="descricao"
                                            class="form-control inputInfoChamado" />
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-input">
                                        <label>Modelo:</label> <input type="text" id="modelo" name="modelo"
                                            class="form-control inputInfoChamado" />
                                    </div>
                                </div>
                            </div>
                            <br />
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="form-input">
                                        <label>Fabricante:</label> <input type="text" id="fabricante" name="fabricante"
                                            class="form-control inputInfoChamado" />
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-input">
                                        <label>CPF/CNPJ:</label> <input type="text" id="cpf" name="cpf"
                                            class="form-control inputInfoChamado" />
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-input">
                                        <label>Fornecedor:</label> <input type="text" id="fornecedor" name="fornecedor"
                                            class="form-control inputInfoChamado" />
                                    </div>
                                </div>
                            </div>
                            <br />
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="form-input">
                                        <label>Valor de Locação:</label> <input type="text" id="valorLocacao"
                                            name="valorLocacao" class="form-control inputInfoChamado" />
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-input">
                                        <label>Localização:</label>
                                            <select name="ocalizacao" id="localizacao" class="form-control inputInfoChamado"> 
                                           </select>
                                    </div>
                                </div>
                                 <div class="col-md-4">
                                    <div class="form-input">
                                        <label>Contrato:</label> <input type="text" id="contrato"
                                            name="contrato" class="form-control inputInfoChamado" />
                                    </div>
                                </div>
                               </div>
                                    <br />
                                <div class="row">
                                    <div class="col-md-4">
                                         <div class="form-input">
                                            <label>Coligada:</label> <input type="text" id="coligada"
                                            name="coligada" class="form-control inputInfoChamado" />
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div id="divResolucaoChamado">
                                            <div id="divAtivo" style="display: inline-block">
                                                <label for="decisaoAtivo"
                                                    style="margin-right: 2%; padding-top: 2px">Ativo</label>
                                                <div class="switch switch-success">
                                                    <input class="switch-input" type="radio" name="decisao"
                                                        id="decisaoAtivo" value="Ativo" />
                                                    <label class="switch-button switchRedGreen"
                                                        for="decisaoAtivo">Toggle</label>
                                                </div>
                                            </div>
                                            <div id="divInativo" style="display: inline-block">
                                                <label for="decisaoInativo"
                                                    style="margin-right: 2%; padding-top: 2px">Inativo</label>
                                                <div class="switch switch-danger">
                                                    <input class="switch-input inputCheckbox" type="radio" name="decisao"
                                                        id="decisaoInativo" value="Inativo" /> <label
                                                        class="switch-button switchRedGreen"
                                                        for="decisaoInativo">Toggle</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                            </div>
                            <br />
                            <div style="text-align: right;">
                                <button id="button-search" class="btn btn-success"
                                    style="background-color: #58595b; border-color: #58595b">Buscar</button>
                            </div>
                        </div>
                    </div>
                    <br />

                    <div class="panel panel-primary" style="border: none; padding: 10px;">
                        <div class="panel-heading"
                            style="padding: 10px; color: #58595b; border-color: #58595b17; background-color: white">
                            <div class="details detailsHide"></div>
                            <h4 class="panel-title" style="display: inline-block; vertical-align: middle">Resultados
                            </h4>
                        </div>
                        <div class="panel-body" style="display: black">
                            <table id="dataTableFilter" class="table table-bordered dataTable no-footer"
                                style="width: 100%">
                                <thead>
                                    <tr>
                                        <th>Prefixo</th>
                                        <th>Descrição</th>
                                        <th>Modelo</th>
                                        <th>Fabricante</th>
                                        <th>CPF/CNPJ</th>
                                        <th>Fornecedor</th>
                                        <th>Valor de Locação</th>
                                        <th>Localização</th>
                                        <th>Status</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal fade" id="modalDetalhesEquipamento" tabindex="-1" role="dialog"
            aria-labelledby="modalDetalhesLabel" aria-hidden="true">
            <div class="modal-dialog modal-xl" role="document" style="max-width: 1000px;">
                <div class="modal-content">
                    <div class="modal-header" style="background-color: #58595b; color: white;">
                        <h4 class="modal-title" id="modalDetalhesLabel">Detalhes do Equipamento</h4>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"
                            style="color: white; opacity: 1;">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body" id="conteudoModalEquipamento"
                        style="background-color: #edecec; max-height: 70vh; overflow-y: auto">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
    </body>
    
    <!-- Castilho Dev Guide -->
<!--     <script src="/castilho_dev_guide/resources/js/castilho-utils.js"></script> -->
<!--     <script src="/castilho_dev_guide/resources/js/castilho-consultas-rm.js"></script> -->
    
    <!-- React -->
    <script src="https://cdn.jsdelivr.net/npm/react@17/umd/react.development.js" crossorigin></script>
    <script src="https://cdn.jsdelivr.net/npm/react-dom@17/umd/react-dom.development.js" crossorigin></script>
    <script src="https://cdn.jsdelivr.net/npm/babel-core@6.26.0/browser.min.js"></script>
    
    <!-- ChartJS -->    
    <script src="https://cdn.jsdelivr.net/npm/chart.js" crossorigin></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-moment@^1"></script>
    
    <!-- vcXMLRPC -->
    <script src="/webdesk/vcXMLRPC.js"></script>
    <!-- DataTables -->
    
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.4/css/jquery.dataTables.css" />
    <script src="https://cdn.datatables.net/1.13.4/js/jquery.dataTables.js"></script>
    
    <!-- DateRangePicker -->
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js"></script>
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js"></script>

</div>