const API_KEY = 'f60be61434c1ef821b51a265';
const EXCHANGE_API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;
const CURRENCY_API_URL = 'https://openexchangerates.org/api/currencies.json';

let exchangeRates = {};
let currencyNames = {};
const fromCurrencySelect = document.getElementById('fromCurrency');
const toCurrencySelect = document.getElementById('toCurrency');
const convertButton = document.getElementById('convert');
const loadingDiv = document.getElementById('loading');

const fetchCurrencyNames = async () => {
    try {
        const response = await fetch(CURRENCY_API_URL);
        if (!response.ok) {
            throw new Error('No se pudieron obtener los nombres de las monedas');
        }
        currencyNames = await response.json();
    } catch (error) {
        console.error('Error al obtener los nombres de las monedas:', error);
    }
};

const fetchExchangeRates = async () => {
    try {
        await fetchCurrencyNames();
        const response = await fetch(EXCHANGE_API_URL);
        if (!response.ok) {
            throw new Error('No se pudieron obtener las tasas de cambio');
        }
        const data = await response.json();
        exchangeRates = data.conversion_rates;
        
        const currencies = Object.keys(exchangeRates);
        currencies.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency;
            option.textContent = `${currency} - ${currencyNames[currency] || currency}`;
            fromCurrencySelect.appendChild(option.cloneNode(true));
            toCurrencySelect.appendChild(option);
        });

        convertButton.disabled = false;
        loadingDiv.style.display = 'none';
    } catch (error) {
        document.getElementById('error').textContent = error.message;
        loadingDiv.textContent = 'Error al cargar las divisas.';
    }
};

const convertCurrency = (amount, fromCurrency, toCurrency) => {
    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];
    return (amount * toRate / fromRate).toFixed(2);
};

convertButton.addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('amount').value);
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;

    if (isNaN(amount)) {
        document.getElementById('error').textContent = 'Por favor, ingrese una cantidad válida.';
        return;
    }

    const result = convertCurrency(amount, fromCurrency, toCurrency);
    document.getElementById('result').textContent = 
        `${amount} ${fromCurrency} (${currencyNames[fromCurrency]}) = ${result} ${toCurrency} (${currencyNames[toCurrency]})`;
    document.getElementById('error').textContent = '';
});

fetchExchangeRates();