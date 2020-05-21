
var budgetController = (function () {


    var setBudget = function () {
        data.budget = data.totals.inc - data.totals.exp;
    };

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var Income = function (id, description, value) {
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
        },
        budget: 0,
        percentage: -1

    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID, isEmpty; // initialize newItem and ID;

            // first check if there are any items stores, if not ID is 0
            if (data.allItems[type + 'Count'] === 0) {
                ID = 0;
            } else {
                ID = data.allItems[type][data.allItems[type + 'Count'] - 1].id + 1;
            }// if there is already an item, grab the id of the last item in the array and add 1



            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
                data.allItems.expCount++;
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
                data.allItems.incCount++;
            }
            data.allItems[type].push(newItem);
            data.totals[type] += val; // add value directly to total to avoid additional calculation
            return newItem;
        },
        calculateBudget: function () {
            setBudget();
            // calculate percentage of income expenses are taking
            if (data.totals.exp === 0 || data.totals.inc === 0) {
                data.percentage = 0;
            } else {
                data.percentage = Math.round(100 * (data.totals.exp / data.totals.inc))
            }


        },
        getBudget: function () {
            forReturn = {
                budget: data.budget,
                incTotal: data.totals.inc,
                expTotal: data.totals.exp,
                percent: data.percentage
            }
            return forReturn;
        }
    }

})();




/**
 * Controller for User Interface
 */
var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        expensesPercentage: '.budget__expenses--percentage'
    }

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;
            // create html string with placeholder tags
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div>' +
                    '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix">' +
                    '<div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // replace the placeholder tags with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            // insert html into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue); //will return list

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = '';
            });
            fieldsArr[0].focus();


        },

       displayBudget: function(obj){
            document.querySelector(DOMstrings.budgetLabel).textContent = '$' + obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = '$' + obj.incTotal;
            document.querySelector(DOMstrings.expensesLabel).textContent = '$' + obj.expTotal;
            if(obj.percent > 0){
                document.querySelector(DOMstrings.expensesPercentage).textContent = obj.percent+'%';
            } else{
                document.querySelector(DOMstrings.expensesPercentage).textContent = '---';
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

    var updateBudget = function () {
        // calc budget
        budgetCtrl.calculateBudget();
        // return the budget
        var budget = budgetCtrl.getBudget();
        // display the budget on the ui
        console.log(budget);
        UICtrl.displayBudget(budget);
    }

    var ctrlAddItem = function () {
        var input, item;
        // 1. get field input
        input = UICtrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. add. item to budget controller
            item = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. update the ui to reflect the value added
            UICtrl.addListItem(item, input.type);
            // 4. clear the fields after input
            UICtrl.clearFields();
            // 5. calculate  and update budget
            updateBudget();
        }
    }

    return {
        init: function () {
            console.log('application has started');
            UICtrl.displayBudget({
                budget: 0,
                incTotal: 0,
                expTotal: 0,
                percent: 0
            })
            eventListenersInit();

        }
    }


})(budgetController, UIController);

controller.init();