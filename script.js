import { create, all } from 'mathjs'

export default {
  data() {
    return {
      variables: [{name: 'SAGAH', type: 'variable'}, {'name': 'Participação', type: 'variable'}],
      variablesInFormula: [],
      variablesAux: [],
      variablesToSelect: [],
      functions: [{ name: 'Média', value: 'math.mean', color: '#79D3FF', type: 'function' }, { name: 'Min', value: 'math.min', color: 'green', type: 'function' }, { name: 'Máx', value: 'math.max', color: 'green', type: 'function' }, { name: 'Soma', value: 'math.sum', color: 'green', type: 'function' }],
      arithmetic: [{ name: 'Adição', value: ' + ', color: '#E587C4', type: 'arithmetical', icon: 'mdi-plus' }, { name: 'Subtração', value: ' -', color: '#E587C4', type: 'arithmetical', icon: 'mdi-minus' }, { name: 'Divisão', value: ' / ', color: '#E587C4', type: 'arithmetical', icon: 'mdi-slash-forward' }, { name: 'Multiplicação', value: ' * ', color: '#E587C4', type: 'arithmetical', icon: 'mdi-multiplication' }, { name: 'Valor', value: '', color: '#E587C4', type: 'equalValue', variable: 'value', icon: 'mdi-numeric' }, { name: 'Abrir Parênteses', value: '(', color: '#E587C4', type: 'arithmetical',icon: 'mdi-code-parentheses' }, { name: 'Fechar Parênteses', value: ')', color: '#E587C4', type: 'arithmetical', icon: 'mdi-code-parentheses' }],
      logical: [{ name: 'SE', value: '?', color: '#EF5350', type: 'logical' }, { name: 'FAÇA', value: ':', color: '#A56400', type: 'logical' }, { name: 'OU', value: ' or ', color: '#A56400', type: 'logical' }, { name: 'E', value: ' and ', color: '#A56400', type: 'logical' }, { name: '<', value: ' < ', color: '#A56400', type: 'logicalComp' }, { name: '>', value: ' > ', color: '#A56400', type: 'logicalComp' }, { name: '>=', value: ' >= ', color: '#A56400', type: 'logicalComp' }, { name: '<=', value: ' <= ', color: '#A56400', type: 'logicalComp' }, { name: '=', value: ' = ', color: '#A56400', type: 'logicalComp' }, { name: '<>', value: ' <> ', color: '#A56400', type: 'logicalComp' }],
      itemsFormula: [],
      message: '',
      errorMessage: false,
      showDialog: false,
      activeFunction: '',
      selectedVariables: [],
      variablesToFormula: [],
      math: '',
      testFormula: false,
      formula: '',
      resultFormula: '',
      result: false,
      formulaFromDb: '',
      successMessage: false,
      listGradingModel: [],
      gradingModels: [],
      selectedModel: ''
    };
  },
  methods: {
    openDialogFunction(value) { //method to open dialog
      this.showDialog = true;
      this.activeFunction = value;
    },
    showMessage(message, success) { //method to show error or success messages
      if(success == 'success'){
        this.message = message;
        this.successMessage = true;
        setTimeout(() => this.errorMessage = false, 5000);
      }
      else {
      this.message = message;
      this.errorMessage = true;
      setTimeout(() => this.errorMessage = false, 5000);
      }
    },
    calcularFunctions() { //method to calculate functions only
      let formula = this.itemsFormula;
      let functionAux = [];
      let formulaAux = '';
      let valueAux;
      for (const form of formula) { //check the method and add its variables do an array which will be consumed by the math.js
        if (form.value == "math.mean") {
          for (const variable of this.variablesAux) {
            functionAux.push(variable.value);
          }
          valueAux = this.math.mean(functionAux);
        }
        else if (form.value == "math.max") {
          for (const variable of this.variablesAux) {
            functionAux.push(variable.value);
          }
          valueAux = this.math.max(functionAux);
        }
        else if (form.value == "math.min") {
          for (const variable of this.variablesAux) {
            functionAux.push(variable.value);
          }
          valueAux = this.math.min(functionAux);
        }
        else if (form.value == "math.sum") {
          for (const variable of this.variablesAux) {
            functionAux.push(variable.value);
          }
          valueAux = this.math.sum(functionAux);
        }
        else { //if no method was listed, just replace the variables for its values and concatanate it, to build a string
          for (const variable of this.variablesAux) {
            if (form.variable == variable.name) {
              form.value = variable.value;
            }
          }
          formulaAux = formulaAux.concat(form.value);
          valueAux = true;
        }
      }
      if (valueAux == true) {
        formulaAux = formulaAux.split(':');
        valueAux = formulaAux[1];
      }
      return valueAux;
    },
    async salvarFormula() {
      let formula = this.itemsFormula;
      let formulaAux = '';
      for (const form of formula) {
        formulaAux = formulaAux.concat(form.variable); //concatenate all variables to build a string
      }
      if (formulaAux.includes(':')) {
        formulaAux = formulaAux.replace('?', ''); //replace original order with the '?' conditional sign to its proper position
        formulaAux = formulaAux.replace(":", " ? 1 : ");
      }
      try {
        if (this.itemsFormula.length > 0) {
          await this.testarFormula('validate'); //with the validate parameter, just check if the formula does not throw an error, if it does not, then it's valid
          this.resetData();
          location.reload();
        }
        else {
          throw new Error('You cannot do a formula without variables');
        }
      }
      catch (error) {
        this.result = false;
        this.showMessage('You had en error when trying to validate or save your formula. Please test it first to ensure the right syntax.');
      }
    },
    async testarFormula(method) {
      let formula = this.itemsFormula;
      let formulaAux = '';
      let resultAux = '';
      for (const form of formula) {
        if (formula.length == 1) {
          if (form.type == 'function') { //if there's only one item and it's a function, go straight to calcularFunctions method
            resultAux = this.calcularFunctions();
          }
        }
        else { //otherwise, iterate through variables replacing by its values: ex(x = 12) and then concatanate to build a string
          for (const variable of this.variablesAux) {
            if (form.variable == variable.name) {
              form.value = variable.value;
            }
          }
          formulaAux = formulaAux.concat(form.value);
        }
      }
      if (formulaAux.includes(':')) { //fix the order of the '?' sign to its proper location
        formulaAux = formulaAux.replace('?', '');
        formulaAux = formulaAux.replace(":", " ? 1 : ");
      }
      try {
        if (resultAux == '') { //if the result auxiliar was not filled yet, evaluate the expression (could be a condition or a simple operation) 
          resultAux = this.math.evaluate(formulaAux);
          if (method != 'validate') {
            this.result = true;
          }
        }
      }
      catch (e) {
        this.result = false;
        this.showMessage('You had a syntax error when testing your formula or the condition is false, try again.');
        this.resetData();
        return e;
      }
      if (resultAux == true) { // if it was a condition, execute the method 
        this.resultFormula = this.calcularFunctions();
        this.resetData();
        if (method != 'validate') {
          this.result = true;
        }
      }
      else { //otherwise, keep the value 
        this.resultFormula = resultAux;
        this.resetData();
        if (method != 'validate') {
          this.result = true;
        }
      }
    },
    resetData(param) {
      if (param == 'resetAll') { //active when clicking the 'limpar button', force an all reset (including from database)
        this.itemsFormula = [];
        this.variablesToFormula = [];
        this.variablesInFormula = [];
        this.variablesAux = [];
        for (const variable of this.variables) {
          const index = this.variables.indexOf(variable);
          variable.value = 'x' + (index + 1);
          variable.variable = 'x' + (index + 1);
          this.variablesToSelect.push(variable.name);
        }
        for (const func of this.functions) {
          func.variable = func.value;
        }
        for (const func of this.functions) {
          func.variable = func.value
        }
        for (const arit of this.arithmetic) {
          arit.variable = arit.value
        }
        for (const logic of this.logical) {
          logic.variable = logic.value
        }
      }
      else { //resetting variables when loading
        this.itemsFormula = [];
        this.variablesToFormula = [];
        this.variablesInFormula = [];
        this.variablesAux = [];
        for (const variable of this.variables) {
          const index = this.variables.indexOf(variable);
          variable.value = 'x' + (index + 1);
          variable.variable = 'x' + (index + 1);
          this.variablesToSelect.push(variable.name);
        }
        for (const func of this.functions) {
          func.variable = func.value;
        }
        for (const func of this.functions) {
          func.variable = func.value
        }
        for (const arit of this.arithmetic) {
          arit.variable = arit.value
        }
        for (const logic of this.logical) {
          logic.variable = logic.value
        }
      }
    },
    processVariablesToFormula() {
      let auxList = []
      for (const variable of this.variables) {
        for (const selectedVariable of this.selectedVariables) {
          if (variable.name === selectedVariable) {
            auxList.push(variable.variable)
          }
        }
      }
      this.variablesToFormula = auxList;
      this.addItemToFormula(this.activeFunction);
      this.selectedVariables = [];
      this.variablesToFormula = [];
      this.showDialog = false;
    },
    addItemToFormula(item) {
      let itemAux = '';
      if (item.type == 'variable') { //if it's a variable follow rules for adding it
        if (this.itemsFormula.length > 0) {
          if (this.itemsFormula[this.itemsFormula.length - 1].type == 'variable') {
            this.showMessage('You cannot insert two variables together, you must insert an operator between them');
          }
          else {
            this.variablesInFormula.push(JSON.parse(`{"name": "${item.value}", "value": "${item.value}", "from": "${item.name}"}`));
            this.itemsFormula.push(item);
          }
        }
        else {
          this.variablesInFormula.push(JSON.parse(`{"name": "${item.value}", "value": "${item.value}", "from": "${item.name}"}`));
          this.itemsFormula.push(item);
        }
      }
      if (item.type == 'equalValue') { //if it's an '=' sign, follow the rules to add it
        if (this.itemsFormula.length > 0) {
          if (this.itemsFormula[this.itemsFormula.length - 1].type == 'equalValue') {
            this.showMessage('You cannot insert two values together');
          }
          else {
            const value = prompt('Digite o valor:');
            itemAux = { value: value, variable: value, type: 'equalValue', name: value };
            this.itemsFormula.push(itemAux);
            itemAux = '';
          }
        }
        else {
          const value = prompt('Digite o valor:');
          itemAux = { value: value, variable: value, type: 'equalValue', name: value };
          this.itemsFormula.push(itemAux);
          itemAux = '';
        }
      }
      if (item.type == 'logicalComp' || item.type == 'function' || item.type == 'arithmetical' || item.type == 'logical') { //if it's an operator or function, follow the rules to add it
        if (item.value == ':') {
          if (this.itemsFormula.filter(c => c.value == '?') == false) {
            this.showMessage('You MUST have an IF when inserting a DO clause');
            return 0;
          }
        }
        if (this.itemsFormula.length > 0) { //if it's not the first item on formula
          if ((this.itemsFormula[this.itemsFormula.length - 1].variable == '?' && item.value != '(')) {
            if (this.itemsFormula[this.itemsFormula.length - 1].type == 'function' || this.itemsFormula[this.itemsFormula.length - 1].type == 'arithmetical' || this.itemsFormula[this.itemsFormula.length - 1].type == 'logical' && this.itemsFormula[this.itemsFormula.length - 1].value != ':' || this.itemsFormula[this.itemsFormula.length - 1].type == 'logicalComp') {
              this.showMessage('You cannot insert two operators together');
            }
          }
          else {
            if (item.type == 'function') { //if it's a function handle it and follow the rules to add it
              item.variable = item.variable.toString().split('(')[0];
              let aux = '';
              aux = item.variable + '(' + this.variablesToFormula.toString() + ')';
              item.variable = aux;
              for (const x of this.variablesToFormula) { //get all variables within the function
                for (const variable of this.variables) {
                  if (x == variable.variable) {
                    this.variablesInFormula.push(JSON.parse(`{"name": "${x}", "value": "${x}", "from": "${variable.name}"}`));
                  }
                }
              }
            }
            this.itemsFormula.push(item);
          }
        }
        else { //if it's the first item on formula
          if (item.type == 'logicalComp' || item.type == 'arithmetical') {
            if (item.name != '(') {
              this.showMessage('You cannot insert a logical comparator or an arithmetic operation in the first position of the formula');
            }
            else {
              this.itemsFormula.push(item);
            }
          }
          else {
            if (item.type == 'function') {
              item.variable = item.variable.toString().split('(')[0];
              let aux = '';
              aux = item.variable + '(' + this.variablesToFormula.toString() + ')';
              item.variable = aux;
              for (const x of this.variablesToFormula) {
                for (const variable of this.variables) {
                  if (x == variable.variable) {
                    this.variablesInFormula.push(JSON.parse(`{"name": "${x}", "value": "${x}", "from": "${variable.name}"}`));
                  }
                }
              }
            }
            this.itemsFormula.push(item);
          }
        }
      }
    },
    removeItemFromFormula(item) { //whenever an item is clicked it is removed from formula
      const index = this.itemsFormula.indexOf(item);
      if (index > -1) {
        this.itemsFormula.splice(index, 1);
      }
      for (let i = 0; i < this.variablesInFormula.length; i++) {
        if (this.variablesInFormula[i].name == item.variable) {
          this.variablesInFormula.splice(i, 1);
        }
      }
    }
  },
  watch: {
    variables() {
      this.resetData();
    },
    selectedModel() {
      for (const aux of this.listGradingModel.info.info) {
        if (this.selectedModel == aux.name) {
          for (let item of aux.items) {
            this.variables.push({ name: item.showName, type: 'variable' }) //store all variables from grading model 
          }
        }
      }
    },
    variablesInFormula() {
      this.variablesAux = [];
      let jsonObject = this.variablesInFormula.map(JSON.stringify);
      let uniqueSet = new Set(jsonObject);
      let uniqueArray = Array.from(uniqueSet).map(JSON.parse);
      this.variablesAux = uniqueArray; //create an aux list to store all unique items in variablesInFormula array
      console.log(this.variablesAux);
    },
  },
  async mounted() {
    const config = {}
    this.math = create(all, config); // create math component
    this.variablesInFormula = [];
    console.log(this.itemsFormula);
    this.resetData(); // reset all data set previously 
  }
};
