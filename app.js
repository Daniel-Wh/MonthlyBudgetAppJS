/**
 * Global budget controller
 */
var budgetController = (function () {

    /**
     * Set budget value with current income and expense totals
     */
    var setBudget = function () {
        data.budget = data.totals.inc - data.totals.exp;
    };

    /**
     *  Expense class for expense items
     * @param {number} id 
     * @param {string} description 
     * @param {number} value 
     */
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    // add method to calculate the percentage of income each expense is
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            
        this.percentage = Math.round((this.value / totalIncome)*100);
        }
    };
    // getter for percentage of expense per item
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    /**
     * Income class for income items
     * @param {number} id 
     * @param {string} description 
     * @param {number} value 
     */
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    // structure for data used in application
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
        /**
         * Takes type (inc/exp), description, value, and instantiates Income item and adds to Income Array, updates totals
         * @param {string} type 
         * @param {string} des 
         * @param {number} val 
         */
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
        /**
         * receives type (inc/exp) and id, removes from data structure, updates totals value
         * @param {string} type 
         * @param {number} id 
         */
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
        },

        /**
         * Calculate budget 
         */
        calculateBudget: function () {
            setBudget();
            // calculate percentage of income expenses are taking
            if (data.totals.exp === 0 || data.totals.inc === 0) {
                data.percentage = 0;
            } else {
                data.percentage = Math.round(100 * (data.totals.exp / data.totals.inc))
            }


        },
        /**
         * determine percentage of total income each expense is
         */
        calculatePercentages: function (){

            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            })

        },

        /**
         * Getter for percentages
         */
        getPercentages: function(){
            var allPercentages = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            })
            return allPercentages;
        },
        /**
         * getter for budget struct
         */
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
    /**
     * takes list object of nodes (for dom manipulation), iterates through list and makes function call back on each item
     * @param {list} list 
     * @param {function} callback 
     */
    var nodeListForEach = function(list, callback){
        for(var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };
    /**
     * takes number and returns a string formatted for the dom (2314.45 ---> +2,314.45)
     * @param {number} num 
     * @param {string} type 
     */
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
        /**
         * returns values at type, description, and value 
         */
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },
        /**
         * adds list item to dom
         * @param {listItem} obj 
         * @param {string(inc/exp)} type 
         */
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
        /**
         * removes selected html element
         * @param {string} selectorID 
         */
        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        /**
         * clears input fields and then focuses on input
         */
        clearFields: function () {
            var fields, fieldsArr;
            // create list of elements 
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue); //will return list
            // convert list to array
            fieldsArr = Array.prototype.slice.call(fields);
            // empty values with for each
            fieldsArr.forEach(function (current, index, array) {
                current.value = '';
            });
            // focus on input description field
            fieldsArr[0].focus();


        },
        /**
         * update UI to reflect new budget value
         * @param {budget} obj 
         */
       displayBudget: function(obj){
           var type;
           // set type for formatting
           obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = '$' + formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = '$' + formatNumber(obj.incTotal, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = '$' + formatNumber(obj.expTotal, 'exp');
            // check that percentage is greater than 0, if not set to ---
            if(obj.percent > 0){
                document.querySelector(DOMstrings.expensesPercentage).textContent = obj.percent+'%';
            } else{
                document.querySelector(DOMstrings.expensesPercentage).textContent = '---';
            }

        },
        /**
         * set percentage of income on expense list items
         * @param {list} percentages 
         */
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
        /**
         * update UI to reflect current month and year
         */
        displayMonth: function(){
            var now, year, month;
            
            now = new Date(); // get date from system

            year = now.getFullYear(); // get year

            month = now.getMonth(); // get number representation of month for months array
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        /**
         * update focuse colors when +/- selected in UI
         */
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
        /**
         * return DOMstrings object
         */
        getDomstrings: function () {
            return DOMstrings;
        }
    }
})();


/**
 * Global app controller
 */
var controller = (function (budgetCtrl, UICtrl) {
    /**
     * initialize event listeners
     */
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
            type = splitID[0];
            id = parseFloat(splitID[1]);
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
        /**
         * initialize application, set initial ui values, display months and initialize event listeners
         */
        init: function () {
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