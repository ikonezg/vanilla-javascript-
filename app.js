/*****************************************************
 *
 *              BUDGET CONTROLLER
 *
 *****************************************************/

var budgetController = (function(){
    
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome){
        
        if(totalIncome > 0){
            this.percentage = Math.round( (this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        };
    };
    
    Expense.prototype.getPercentage = function(){
        
        return this.percentage;
        
    };
    
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
           sum += cur.value; 
        });
        data.totals[type] = sum;
    }
    
    //Global DATA structure
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        precentage: -1
    };
    
    return {
        addItem: function(type, des, val){
            var newItem, ID;
            //Create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0; 
            }
            //Create new Item based on Inc or Exp
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);    
            } else if(type ==='inc'){
                newItem = new Income(ID, des, val);
            };
            
            //Push it into our new structure 
            data.allItems[type].push(newItem);
            
            //Return the new element
            return newItem;
        },
        
        deleteItem: function(type, id){
            var ids, index;  //predavanje 82
            
            ids = data.allItems[type].map(function(current){  //stvatamo novu array da stvatnim adresama el
                return current.id;    
            });
            
            
            index = ids.indexOf(id);
            
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function(){
            
            //calculate total income and expeses
            calculateTotal('exp');
            calculateTotal('inc');
            //calculate the budget : income - expeses
            data.budget = data.totals.inc - data.totals.exp;
            //calculate precetage of income that we spent
            
            if(data.totals.inc > 0){
                data.precentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.precentage = -1;
            }
        },
        
        calculatePercentages: function(){
            
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);    
            });
            
        },
        
        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();    
            });    
            return allPerc; 
        },
        
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.precentage
            }    
        },
        
        testing: function(){
            console.log(data);
        }
    }
})();


/***********************************************************
 *
 *                      UI CONTROLLER
 *
 ************************************************************/

var UIController =(function(){
    
    
    
    //Holder za DOM stringove 
    var DOMString = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
        
    };
    
    
    var formatNumber = function(num, type){
            var numSplit, int, dec, sign;
            /*
            + or - before number exactly 2 decimal points comma separating the thousands
            2310.4536 -> 2,310.46
            */
            num = Math.abs(num);
            num = num.toFixed(2);
            numSplit = num.split('.');
            int = numSplit[0];
            if(int.length > 3){
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }
            
            dec = numSplit[1];
            
            type === 'exp' ? sign = '-' : sign = '+';
            return sign + ' ' + int + '.' + dec;
            
        };
    
    var nodeListForEach = function(list, callback){
            for(var i = 0; i < list.length; i++){
                callback(list[i], i);
            };    
        };
    
    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMString.inputType).value,  //will be inc  or exp
                description: document.querySelector(DOMString.inputDescription).value,
                value: parseFloat(document.querySelector(DOMString.inputValue).value)
            };
        },
        
        addListItem: function (obj, type){
            //HTML string with placeholder text
            var html, newHtml, element;
            
            if(type === 'inc'){
                element = DOMString.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                
            } else if(type === 'exp'){
                element = DOMString.expensesContainer;
                
                html ='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                
            };
            //Replace placeholder text with actual data
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            
            //Insert HTML into the DOM
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        
        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        
        
        clearFields: function(){
            var fields, fieldsArray;
            //stvaramo list a ne array 
            fields = document.querySelectorAll(DOMString.inputDescription + ', '+ DOMString.inputValue);   
            //moramo napraviti trik i pretvoriti u array sa slicekoji je u prototipu array
            fieldsArray = Array.prototype.slice.call(fields);
            
            fieldsArray.forEach(function(current, index, array){
                current.value = '';
            });
            
            fieldsArray[0].focus(); //return focus to value field
        },
        
        
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMString.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMString.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMString.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            

            if(obj.percentage > 0){
                document.querySelector(DOMString.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMString.percentageLabel).textContent = '---';
            };
            
        },
        
        
        displayPersentages: function(percentages){
            
            var fields = document.querySelectorAll(DOMString.expensesPercLabel);
            
            
            
            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                };
            });
            
            
        },
        
        
        displayMonth: function(){
            var now, year, month, months;
            now = new Date();
            year = now.getFullYear();
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            month = now.getMonth();
            
            document.querySelector(DOMString.dateLabel).textContent = months[month] + ', ' + year;
        },
        
        changeType: function(){
            
            var fields = document.querySelectorAll(
                DOMString.inputType + ',' +
                DOMString.inputDescription + ',' +
                DOMString.inputValue);
            
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');    
            });
            
            document.querySelector(DOMString.inputBtn).classList.toggle('red');
        },
        
        getDOMStrings: function(){
            return DOMString;
        }
        
    };
    
    
})();


/****************************************************************
 *
 *                      APP CONTROLLER
 *
 ****************************************************************/

var controller = (function(budgetCtrl, UICtrl){
    
    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMStrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            };
        });
        
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
        
    };
    
    
    var updateBudget = function(){
        //1. Calculate the budget 
        budgetCtrl.calculateBudget();
        
        //2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        //3. Display the budget on the UI   
        
        UICtrl.displayBudget(budget);
    };
    
    var updatePercentages = function(){
        
        // 1. Calculate the percentage
        budgetCtrl.calculatePercentages();
        // 2. Read percentages from budget controler
        var percentages = budgetCtrl.getPercentages();
        // 3. Update the UI with percentages
        UICtrl.displayPersentages(percentages);
    };
    
    
    var ctrlAddItem = function(){
        var input, newItem;
        
        //1.Get input data
        input = UICtrl.getInput();
                
        //Adding controlu ako je unesen podatak u field
        if(input.description !== '' && !isNaN(input.value) && input.value > 0){
            //2. Add item to the budget controller

            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add item to the UI

            UICtrl.addListItem(newItem, input.type);

            //4. Clear the fields

            UICtrl.clearFields();

            //5. Calculate and update budget
            updateBudget();
            
            //6. Calculate and update percentages
            updatePercentages();
            
        };
    };
    
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            splitID = itemID.split('-'); // pretvaramo string u array objekt
            type = splitID[0];           // spremamo type 
            ID = parseInt(splitID[1]);             // spremamo ID 
            
            //1. delete the item from the data structure 82.predavanje
            budgetCtrl.deleteItem(type, ID);
            
            //2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            
            //3. Update and show the new budget
            updateBudget();
        }
        
    };
    
    return {
        init: function(){
            console.log('Dinamo je startao !!!');
            
            UICtrl.displayMonth();
            
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            
            setupEventListeners();
            
        }
    };
    
})(budgetController, UIController);



/******************************************************************/
controller.init();





