
var budgetController = (function () {


})();

var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn'
    }

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: document.querySelector(DOMstrings.inputValue).value
            }
        },
        getDomstrings: function () {
            return DOMstrings;
        }
    }
    //some code
})();


/**
 * Global app controller
 */
var controller = (function (budgetCtrl, UICtrl) {
    var eventListenersInit = function () {

        var DOM = UICtrl.getDomstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (e) {
            if (e.keyCode === 13) {
                ctrlAddItem();
            }
        })
    }


    var ctrlAddItem = function () {
        // 1. get field input
        var input = UICtrl.getInput();
        console.log(input)
        // 2. add. item to budget controller
        // 3. update the ui to reflect the value added
        // 4. calculate budget
        // 5. add the item to ui
    }

    return{
        init: function(){
            console.log('application has started');
            eventListenersInit();

        }
    }


})(budgetController, UIController);

controller.init();