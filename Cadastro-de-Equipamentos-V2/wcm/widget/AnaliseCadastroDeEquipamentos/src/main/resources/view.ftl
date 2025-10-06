<div id="MyWidget_${instanceId}" class="super-widget wcm-widget-class fluig-style-guide"
    data-params="MyWidget.instance()">

    <body>
        <div class="fluig-style-guide">

            <div class="panel panel-primary" id="background">
                <div class="panel-heading" style="padding: 10px">
                    <div class="details detailsHide"></div>
                    <h4 class="panel-title" style="display: inline-block; vertical-align: middle">Análise de
                        Equipamentos</h4>
                </div>
                <div class="panel-body" style="display: black">
                    <div class="panel panel-primary" style="border: none; padding: 10px;">
                        <div class="panel-heading"
                            style="padding: 10px; color: #58595b; border-color: #58595b17; background-color: white; cursor: pointer;" id="filtrosHeader">
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


                        <div class="panel-body" id="filtrosBody" style="display: black">
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="form-input">
                                        <label>Nº da Solicitação:</label> <input type="number" id="solicitacao"
                                            name="solicitacao" class="form-control inputInfoChamado inputStyle" />
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-input">
                                        <label>Solicitante:</label> <input type="text" id="solicitante"
                                            name="solicitante" class="form-control inputInfoChamado" />
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-input">
                                        <label>Obra:</label> <input type="text" id="obra" name="obra"
                                            class="form-control inputInfoChamado" />
                                    </div>
                                </div>
                            </div>
                            <br />
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="form-input">
                                        <label>Data de Abertura:</label> <input type="text" id="dataAbertura"
                                            name="dataAbertura" class="form-control inputInfoChamado" />
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-input">
                                        <label>Criado em:</label> <input type="text" id="criado" name="criado"
                                            class="form-control inputInfoChamado date" />
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-input">
                                        <label>Finalizado em:</label> <input type="text" id="finalizado"
                                            name="finalizado" class="form-control inputInfoChamado date" />
                                    </div>
                                </div>
                            </div>
                            <br />
                            <div style="text-align: right;">
                                <button id="button-search" class="btn btn-success"
                                    style="background-color: #58595b; border-color: #58595b">Buscar</button>
                            </div>
                        </div>
                        <br />

                    </div>
                    <div class="panel panel-primary" style="border: none; padding: 10px;">
                        <div class="panel-heading"
                            style="padding: 10px; color: #58595b; border-color: #58595b17; background-color: white">
                            <div class="details detailsHide"></div>
                            <h4 class="panel-title" style="display: inline-block; vertical-align: middle">Resultados
                            </h4>
                        </div>
                        <div class="panel-body" style="display: black">
                            <table id="dataTableFilter" class="table table-bordered table-striped dataTable no-footer"
                                style="width: 100%">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nº DA SOLICITAÇÃO</th>
                                        <th>SOLICITANTE</th>
                                        <th>OBRA</th>
                                        <th>DATA DE ABERTURA</th>
                                        <th>CRIADO EM</th>
                                        <th>FINALIZADO EM</th>
                                        <th>STATUS</th>
                                        <th>AÇÕES</th>
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
</div>
</body>

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