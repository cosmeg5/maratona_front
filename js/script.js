//Abrir modal
const newTransaction = document.querySelector("#newtransaction");
//Adicionar a class active ao modal
newTransaction.addEventListener("click", () => {
    var active = document.querySelector('.modal-overlay');
    active.classList.add("active");   
})


const cansel = document.querySelector(".cansel");
//Remover a class active ao modal
cansel.addEventListener("click", function() {
    var active = document.querySelector('.modal-overlay');
    active.classList.remove("active");   
})

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    },
}

const Transaction = {
    all: Storage.get(),

    add(transactions){
        Transaction.all.push(transactions)

        App.reload();
    },

    remove(index) {
        Transaction.all.splice(index, 1);

        App.reload();
    },

    incomes() {
       let income = 0
        Transaction.all.forEach(function(transactions) {
            if(transactions.amount > 0) {
                income = income + transactions.amount
            }
        })
       return income
    },
    expenses() {
        let expenses = 0
        Transaction.all.forEach(function(transactions) {
            if(transactions.amount < 0) {
                expenses = expenses + transactions.amount;
            }
        })
       return expenses;
    },
    total() {
       let entrada = Transaction.incomes();
       let saida = Transaction.expenses();
       let total = entrada + saida;

       return total;
    },

}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transactions, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transactions, index);
        tr.dataset.index = index
        
        DOM.transactionsContainer.appendChild(tr);
    },
    innerHTMLTransaction(transactions, index) {
        const CSSclass = transactions.amount < 0 ? "saida" : "entrada";

        const amount = Utils.formatCurrency(transactions.amount);

        const html = `
            <td>${transactions.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td>${transactions.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="assets/minus.svg" alt="remover transação"/>
            </td>`; 

            return html;
    },

    updateBalance() {
        const entradas = document.querySelector("#entradaDisplay").innerHTML = Utils.formatCurrency(Transaction.incomes());

        const saidas = document.querySelector("#saidaDisplay").innerHTML = Utils.formatCurrency(Transaction.expenses());
        const saldo = document.querySelector("#saldo").innerHTML = Utils.formatCurrency(Transaction.total());
    },
    clearTransaction() {
        DOM.transactionsContainer.innerHTML = "";
    },
}

const Utils = {
    formatAmount(value) {
        value = value * 100;
        return Math.round(value);
    },

   formatDate(date) {
       const splitteDate = date.split("-")
        return `${splitteDate[2]}/${splitteDate[1]}/${splitteDate[0]}`;
    },

    formatCurrency(value) {
       const signal = Number(value) < 0 ? "-" : "";
      
       value = String(value).replace(/\D/g, "");

       value = Number(value) / 100;

       value = value.toLocaleString("pt-BR", {
           style: "currency",
           currency: "BRL",
       })

       return signal + value;
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },
   
    formatData() {

    },
    close() {
        var active = document.querySelector('.modal-overlay');
        active.classList.remove("active");   
    },

    validateFields() {
        const { description, amount, date} = Form.getValues();
        if(description.trim()=== "" || amount.trim() === "" || date.trim() === "" ) {
            throw new Error("Por favor, preencha todos os Campos")

        } 
    },

    formatValues() {
         let { description, amount, date} = Form.getValues();

         amount = Utils.formatAmount(amount);

         date = Utils.formatDate(date);

         return {
             description,
             amount,
             date
         }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault();
      
        try {
            Form.validateFields();
            const transaction = Form.formatValues();
            Transaction.add(transaction)
            Form.clearFields();
            Form.close();

        }catch(error) {
            alert(error.message)
        }

    }
}

const App = {
    init() {
        Transaction.all.forEach(function(transactions, index) {
            DOM.addTransaction(transactions, index);
        })
        
        DOM.updateBalance();

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransaction();
        App.init();
    },
}

App.init();