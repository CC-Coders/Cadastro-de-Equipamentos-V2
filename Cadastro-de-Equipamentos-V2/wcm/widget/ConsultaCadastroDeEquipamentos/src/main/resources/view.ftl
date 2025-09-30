<div id="MyWidget_${instanceId}" class="super-widget wcm-widget-class fluig-style-guide"
    data-params="MyWidget.instance()">

    <body>
        <div class="fluig-style-guide">
            <div class="panel panel-primary">
                <div class="panel-heading" style="padding: 10px">
                    <div class="details detailsHide"></div>
                    <h4 class="panel-title" style="display: inline-block; vertical-align: middle">Filtros de Pesquisa
                    </h4>
                </div>
                <div class="panel-body" style="display: black">
                    <div class="row">
                        <div class="col-md-3">
                            <div class="form-input">
                                <label>Pesquisar por:</label> <select name="pesquisar" id="pesquisar"
                                    class="form-control inputInfoChamado">
                                    <option value="ID">ID</option>
                                    <option value="Prefixo">Prefixo</option>
                                    <option value="Descrição">Descrição</option>
                                    <option value="Modelo">Modelo</option>
                                    <option value="Fabricante">Fabricante</option>
                                    <option value="CPF/CNPJ">CPF/CNPJ</option>
                                    <option value="Fornecedor">Fornecedor</option>
                                    <option value="Valor de Locação">Valor de Locação</option>
                                    <option value="Localização">Localização</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-9">
                            <div class="form-input">
                                <label>Termo:</label> <input type="text" id="termo" name="termo"
                                    class="form-control inputInfoChamado" />
                            </div>
                        </div>
                    </div>
                    <br />
                    <div style="text-align: right;">
                        <button id="button-search" class="btn btn-success">Buscar</button>
                    </div>
                </div>
                <br />

            </div>
            <br />
            <div class="panel panel-primary">
                <div class="panel-heading" style="padding: 10px">
                    <div class="details detailsHide"></div>
                    <h4 class="panel-title" style="display: inline-block; vertical-align: middle">Resultados</h4>
                </div>
                <div class="panel-body" style="display: black">
                    <table id="dataTableFilter" class="table table-bordered table-striped dataTable no-footer"
                        style="width: 100%">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>PREFIXO</th>
                                <th>DESCRIÇÃO</th>
                                <th>MODELO</th>
                                <th>FABRICANTE</th>
                                <th>CPF/CNPJ</th>
                                <th>FORNECEDOR</th>
                                <th>VALOR DE LOCAÇÃO</th>
                                <th>LOCALIZAÇÃO</th>
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