var MyWidget = SuperWidget.extend({
    //variáveis da widget
    variavelNumerica: null,
    variavelCaracter: null,

    //método iniciado quando a widget é carregada
    init: function () {

        var dataAtual = moment().format('DD/MM/YYYY');
        $('.date').val(dataAtual);
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
    }

});

