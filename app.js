
var budgetController = (function () {

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: [],
            expCount: 0,
            incCount: 0
        },
        totals: {
            exp: 0,
            inc: 0
        }

    };

    return {
        addItem: function(type, des, val){
            var newItem, ID; // initialize newItem and ID;
            // first check if there are any items stores, if not ID is 0
            if(data.allItems[type+'Count'] === 0){
                ID = 0;
            } // if there is already an item, grab the id of the last item in the array and add 1
            else ID = data.allItems[type][data.allItems[type+'Count']].id + 1;
            
            
            if(type === 'exp'){
                newItem = new Expense(ID, des, val); 
            } else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            data.allItems[type].push(newItem);
            return newItem;
        }
    }

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
        var input, item;
        // 1. get field input
        input = UICtrl.getInput();
        console.log(input)
        // 2. add. item to budget controller
        item = budgetCtrl.addItem(input.type, input.description, input.value);
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