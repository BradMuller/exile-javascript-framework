/**
 * Calendário
 *
 */
(function (window, $e, $, undefined) {

    var plugin = function (labels) {
        var default_labels = {
            months:['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
            weekdays:['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
        };
        this.labels = default_labels;

        var today = Date.getToday();
        this.setCurrentDate(today);
        this.setDate(today);

        this.addEventListener([this.ev.DATE_CHANGED, this.ev.MONTH_CHANGED, this.ev.YEAR_CHANGED], [this, this.render]);
        this.render();

    };

    plugin.prototype = {

        labels:null,

        ev:{
            RENDERED:"RENDERED",
            CURRENT_DATE_CHANGED:"CURRENT_DATE_CHANGED",
            DATE_CHANGED:"DATE_CHANGED",
            MONTH_CHANGED:"MONTH_CHANGED",
            YEAR_CHANGED:"YEAR_CHANGED"
        },


        currentDate:null,
        navigationDate:null,

        /**
         * Getters & Setters
         */
        setCurrentDate:function (date) {
            this.currentDate = date;
            this.dispatchEvent(this.ev.CURRENT_DATE_CHANGED);
        },

        getCurrentDate:function () {
            return this.currentDate;
        },

        /**
         * Navegação
         */
        setDate:function (date) {
            this.navigationDate = date;
            this.dispatchEvent(this.ev.DATE_CHANGED);
        },

        getDate:function () {
            return this.navigationDate;
        },

        setMonth:function (month) {
            this.navigationDate.setMonth(month);
            this.dispatchEvent(this.ev.MONTH_CHANGED);
        },

        getMonth:function () {
            return this.navigationDate.getMonth();
        },

        setYear:function (year) {
            this.navigationDate.setYear(year);
            this.dispatchEvent(this.ev.YEAR_CHANGED);
        },

        getYear:function () {
            return this.navigationDate.getFullYear();
        },

        /**
         * Helpers
         */

        nextMonth:function () {
            this.setMonth(this.getMonth() + 1)
        },

        prevMonth:function () {
            this.setMonth(this.getMonth() - 1)
        },

        getMonthFirstDate:function () {
            return new Date(this.getYear(), this.getMonth(), 1);
        },

        getMonthLabel:function (month) {
            if (month == undefined) {
                return this.getMonthLabel(this.getMonth())
            }
            return this.labels.months[month];
        },

        getWeekdayLabel:function (day) {
            return this.labels.weekdays[day];
        },

        /**
         * Renderização externalizada
         */
        render:function () {

        }
    };

    $e.registerPlugin("Calendar", plugin)

})(window, window.Exile, window.jQuery);