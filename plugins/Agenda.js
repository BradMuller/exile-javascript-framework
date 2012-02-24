/**
 * Agenda de horários
 *
 */
(function (window, $e, $, undefined) {

    var plugin = function (options) {

        this.setCurrentWeek(new Date());
        var _this = this;

        this.addEventListener([this.ev.WEEKLY_SCHEDULES_LOADED, this.ev.SCHEDULES_LOADED, this.ev.WEEK_CHANGE], function () {
            _this.refresh()
        });

        this.updateWeeklySchedule();
        this.init()
    };

    plugin.prototype = {

        /**
         * Eventos
         */
        ev:{
            // A semana mudou
            WEEK_CHANGE:"WEEK_CHANGE",
            WEEKLY_SCHEDULES_LOADED:"WEEKLY_SCHEDULES_LOADED",
            SCHEDULES_LOADED:"SCHEDULES_LOADED"
        },

        /**
         * Inicialização
         */
        init:function () {
            var _this = this;
            $(function () {
                _this.refresh()
            });
        },

        /**
         * Controle
         */

        /**
         * Guarda referência ao primeiro dia da semana atualmente selecionada
         */
        currentWeeksFirstDay:null,

        /**
         * Define a semana atual
         */
        setCurrentWeek:function (date) {

            // Se estivermos carregando alguma coisa, a opção é desabilidata
            if (this.isLoading()) {
                return;
            }

            if (!(date instanceof Date)) {
                this.e("Data inválida.")
            }

            this.currentWeeksFirstDay = new Date(date.getTime() - 86400 * 1000 * date.getDay());
            this.updateSchedule();
            this.dispatchEvent(this.ev.WEEK_CHANGE)
        },

        /**
         * Retorna as datas da semana dada
         */
        getWeekDates:function (weekdate) {
            var first_day = new Date(weekdate.getTime() - 86400 * 1000 * weekdate.getDay());
            var dates = [first_day];
            for (var i = 1; i < 7; i++) {
                dates.push(new Date(weekdate.getTime() + 86400 * 1000 * i))
            }
            return dates;
        },

        /**
         * Navega para a próxima semana
         */
        nextWeek:function () {
            this.setCurrentWeek(new Date(this.currentWeeksFirstDay.getTime() + 7 * 86400 * 1000))
        },

        /**
         * Navega para a semana anterior
         */
        previousWeek:function () {
            this.setCurrentWeek(new Date(this.currentWeeksFirstDay.getTime() - 7 * 86400 * 1000))
        },

        /**
         * Retorna o primeiro dia da semana atual
         */
        getCurrentWeeksFirstDay:function () {
            return this.currentWeeksFirstDay;
        },

        /**
         * Retorna o último dia da semana atual
         */
        getCurrentWeeksLastDay:function () {
            return new Date(this.currentWeeksFirstDay.getTime() + 86400 * 1000 * 6);
        },


        /**
         * Retorna os horários para um dado dia, ordenados pelo horário.
         */
        getDateSchedules:function (date) {
            var weekday = new Date(date.getTime() - 86400 * 1000 * date.getDay());

            var date_schedules = [];
            var weekly_schedules_defined = {};
            var i;
            // Adicionamos primeiramente as datas bem definidas
            var schedules = this.schedules[weekday.toDateString()];
            if (schedules) {
                var compare_date = date.getISODate();
                for (i = 0; i < schedules.length; i++) {
                    if (compare_date == schedules[i].horario.split(' ')[0]) {
                        date_schedules.push(schedules[i]);
                        date_schedules.last().hora = schedules[i].horario.substr(11, 5);
                        // Este é um horário semanal que já está bem definido
                        if (schedules[i].diaSemanal) {
                            weekly_schedules_defined[schedules[i].diaSemanal] = true;
                            date_schedules.last().semanal = true;
                        }
                    }
                }
            }

            // E então os horários semanais
            var compare_day = date.getDay();
            for (i = 0; i < this.weeklySchedules.length; i++) {
                if (this.weeklySchedules[i].dias) {
                    for (var j = 0; j < this.weeklySchedules[i].dias.length; j++) {
                        // É, de fato, o dia da semana que buscamos e não foi usado por um horário bem definido ainda
                        if (this.weeklySchedules[i].dias[j].dia == compare_day && !weekly_schedules_defined[this.weeklySchedules[i].dias[j].id]) {
                            date_schedules.push({
                                id:this.weeklySchedules[i].id,
                                nome:this.weeklySchedules[i].nome,
                                trajeto:this.weeklySchedules[i].trajeto,
                                dia:this.weeklySchedules[i].dias[j],
                                semanal:true,
                                hora:this.weeklySchedules[i].dias[j].horario.substr(0, 5)
                            });
                        }
                    }
                }
            }

            // Ordenação
            date_schedules.sort(function (a, b) {
                return a.hora > b.hora;
            });

            return date_schedules;
        },

        /**
         * Horários (dados)
         */

        /**
         * Atualiza os horários da semana atual
         */
        updateSchedule:function () {
            var _this = this;
            var _week = this.currentWeeksFirstDay.toDateString();
            if (!_this.schedules[_week]) {
                this.fetchSchedules(this.currentWeeksFirstDay, function (response) {
                    _this.schedules[_week] = response;
                    _this.dispatchEvent(_this.ev.SCHEDULES_LOADED)
                })
            }
        },

        /**
         * Atualiza os horários semanais
         */
        updateWeeklySchedule:function () {
            var _this = this;
            // Horários semanais
            this.json(this.weeklySchedulesURL, null, function (data) {
                _this.weeklySchedules = data;
                _this.dispatchEvent(_this.ev.WEEKLY_SCHEDULES_LOADED)
            })
        },

        /**
         * URL para busca de horários semanais
         */
        weeklySchedulesURL:'/ajax/horarios-semanais',

        /**
         * Horários semanais do usuário
         */
        weeklySchedules:{},

        /**
         * URL para busca de horários
         */
        schedulesURL:'/ajax/horarios',

        /**
         * Horários bem definidos, indexados pela data
         */
        schedules:{},

        /**
         * Busca no servidor os horários da semana dada
         */
        fetchSchedules:function (weekday, callback) {
            var dias = [];
            var weekdates = this.getWeekDates(weekday);
            for (var i = 0; i < weekdates.length; i++) {
                dias.push(weekdates[i].getDate() + '/' + (weekdates[i].getMonth() + 1) + '/' + weekdates[i].getFullYear())
            }
            this.json(this.schedulesURL, "dias=" + dias.join(','), callback)
        },

        /**
         * Renderização & Estado
         */

        /**
         * Controla a renderização
         */
        refresh:function () {
            if (this.weeklySchedules && this.schedules) {
                this.render();
            }
        },

        /**
         * Método abstrato, renderiza a agenda
         */
        render:function () {

        }


    };

    $e.registerPlugin("Agenda", plugin)

})(window, window.Exile, window.jQuery);