
var budgetController = (function () {


    var setBudget = function () {
        data.budget = data.totals.inc - data.totals.exp;
    };

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            
        this.percentage = Math.round((this.value / totalIncome)*100);
        }
    };
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
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

        deleteItem: function(type, id){
            var index, val;
            /* Both functions work but 
            ids = data.allItems[type].map(function(current, index){
                return current.id;
            });
            index = ids.indexOf(id);
            if(index !== -1){
                data.totals[type] - data.allItems[type][index]
                data.allItems[type].splice(index, 1);
            } else {
                console.log('Item not found');
            }
            console.log(data.allItems[type])
            */

           for(var i = 0; i < data.allItems[type].length; i++){
               if(data.allItems[type][i].id == id){
                    index = i;
                    val = data.allItems[type][i].value;
               }
           }
           data.totals[type] -= val;
           data.allItems[type].splice(index, 1);
           data.allItems[type+'Count']--;
           console.log(data.allItems[type]);
           console.log(data.totals[type])
           
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
        calculatePercentages: function (){

            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            })

        },

        getPercentages: function(){
            var allPercentages = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            })
            return allPercentages;
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
        expensesPercentage: '.budget__expenses--percentage',
        deleteContainer: '.container',
        expensesPercentageLabe: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var nodeListForEach = function(list, callback){
        for(var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    var formatNumber = function(num, type){
        var numSplit, int, dec, sign;
        // + or - before number, 2 decimal points, comma separating thousands
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0]; // first half of the split 
        dec = numSplit[1]; // second half
        if(int.length > 3){
            int = int.substr(0,int.length - 3) + ',' + int.substr(int.lenth - 3, 3);
        };
        type === 'exp' ? sign = '-' : sign = '+';
        return sign + int + '.' + dec;

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
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div>' +
                    '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix">' +
                    '<div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // replace the placeholder tags with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            // insert html into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
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
           var type;
           obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = '$' + formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = '$' + formatNumber(obj.incTotal, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = '$' + formatNumber(obj.expTotal, 'exp');
            if(obj.percent > 0){
                document.querySelector(DOMstrings.expensesPercentage).textContent = obj.percent+'%';
            } else{
                document.querySelector(DOMstrings.expensesPercentage).textContent = '---';
            }

        },
        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabe);
            
            
            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else {
                    current.textContent = '---'
                }
            })

        },

        displayMonth: function(){
            var now, year, month;
            
            now = new Date();

            year = now.getFullYear();

            month = now.getMonth();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

            document.querySelector(DOMstrings.dateLabel).textContent = months[month -1] + ' ' + year;
        },

        changeType: function(){
            var fields;

            fields = document.querySelectorAll(
                DOMstrings.inputType + ', ' +
                DOMstrings.inputDescription + ', ' +
                DOMstrings.inputValue
            )

            nodeListForEach(fields, function(current){
                current.classList.toggle('red-focus');
            })
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
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
        });

        document.querySelector(DOM.deleteContainer).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    }

    var updateBudget = function () {
        // calc budget
        budgetCtrl.calculateBudget();
        // return the budget
        var budget = budgetCtrl.getBudget();
        // display the budget on the ui
        console.log(budget);
        UICtrl.displayBudget(budget);
    };
    var updatePercentages = function(){
        // calc percentages
        budgetCtrl.calculatePercentages();
        // get percentages
        var perc = budgetCtrl.getPercentages();
        // update ui to reflect new percentages
        UICtrl.displayPercentages(perc);
    };

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
            // 6. calculate and update percentages
            updatePercentages();
        }
    }

    var ctrlDeleteItem = function(e){
        var itemID, splitID;


        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){ // only works cause there are no other divs with id's
            splitID = itemID.split('-'); // array with 2 values, the value before and after '-'
            console.log(splitID);
            type = splitID[0];
            id = parseFloat(splitID[1]);
            console.log(id);
            // 1. delete Item from data structure
            budgetCtrl.deleteItem(type, id);
            // 2. delete item from UI
            UICtrl.deleteListItem(itemID);
            // 3. update budget
            updateBudget();
            // 5. calculate and update percentages
            updatePercentages();
        }
        

    }

    return {
        init: function () {
            console.log('application has started');
            UICtrl.displayBudget({ // initialize budget display values
                budget: 0,
                incTotal: 0,
                expTotal: 0,
                percent: 0
            });
            UICtrl.displayMonth();
            eventListenersInit();

        }
    }


})(budgetController, UIController);

controller.init();