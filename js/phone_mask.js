let phonePattern = {
    'ru': '+7 (d__) ___-__-__',
    'ua': '+38-d__-___-__-__',
    'by': '+375 d__ ___ ___',
    'kz': '+7 ___ ___ ____',
    'kg': '+996 ___ __ __ __',
    'md': '+373 ___ _____?',
    'az': '+994-___-__-__-__',
    'ge': '+995 d__ __ __ __',
    'es': '+34 d__ __ __ __',
    'pe': '+51 d__ ___ ___',
    'cl': '+56 d__ ___ ___',
    'ar': '+54 d__ ___ __ __',
    'co': '+57 d__ ___ __ __',
    'mx': '+52 d_ ____ ____',
    'it': '+39-d__-___-____',
    'esp': '+34 d__ __ __ __',
    'pt': '+351 d__ ___ ___',
    'br': '+55 d__ ____ ____',
    'prt': '+351 d__ ___ ___',
    'id': '+62 d__ ___ ___',
    'gr': '+30 d__ _______',
    'cy': '+357 d_ ______',
    'ro': '+40 d__ ___ __? _',
    'bg': '+359 d__ ___ __?',
    'cz': '+420 d__ ___ ___',
    'sk': '+421 d__ ___ ___',
    'si': '+386 d ___ __ __',
    'pl': '+48 d__ ___ ___',
    'al': '+355 d_ ___ ___?_',
    'rs': '+381 d_ _____?_',
    'ph': '+63 d ____ __?_',
    'hu': '+36 d ___ ____',
    'hr': '+385 d ____ __?_',
    'ba': '+387 d_ ______',
    /* --- */
};
let langPattern = {
    "al": 'Ju lutem, kontrolloni saktësinë e të dhënave',
    "co": 'Por favor ingrese un número de teléfono válido',
    "cz": 'Zadejte prosím platné telefonní číslo',
    "de": 'Bitte überprüfen Sie, ob die von Ihnen eingegebenen Informationen korrekt sind.',
    "es": 'Por favor ingrese un número de teléfono válido',
    "gr": 'Πληκτρολογηστε τον σωστο αριθμο τηλεφωνου',
    "hr": 'Molim Vas, unesite pravilan broj telefona',
    "hu": 'Kérjük adjon meg egy érvényes telefonszámot',
    "it": 'Si prega di inserire un numero di telefono valido',
    "mx": "Por favor ingrese un número de teléfono válido",
    "pe": 'Por favor ingrese un número de teléfono válido',
    "pl": 'Sprawdź, czy wprowadzone dane są poprawne',
    "pt": 'Digite o número de telefone correto',
    "ro": 'Vă rugăm să introduceți un număr de telefon corect',
    "sk": 'Prosím, skontrolujte zadané údaje',
    "ru": 'Пожалуйста, проверьте правильность введенных данных',
    "bg": 'Моля, въведете коректен номер телефона',
    'en': 'Please enter valid phone number in internation format',
};


var isTimeoutSeted = false;
var inputInterval;

function createInterval(input) {
    if (!isTimeoutSeted) {
        isTimeoutSeted = true;

        inputInterval = setInterval(() => {
            input.selectionStart = input.value.length
            input.setSelectionRange(input.value.length, input.value.length);
        }, 15)
    }
}
function deleteInterval() {
    clearInterval(inputInterval)
    isTimeoutSeted = false;
}
function setSelectionStart(input) {
    input.selectionStart = input.value.length
}

function mask(event) {
    let input = event.currentTarget;
    let geo = input.form.getAttribute('geo');
    let matrix = phonePattern[geo];
    let val = input.value.replace(/\D/g, "");
    let def = matrix.replace(/\D/g, "");

    if (event.type == 'input' && event.inputType == 'deleteContentBackward') {
        val = val.replace(/.$/, '');
    }

    if (!event.type == "blur") {
        setSelectionStart(input)
    }

    // Ставим интервал для инпута
    createInterval(input)

    if (event.type == "blur") {
        // Сбрасываем интервал для инпута
        deleteInterval()
        if (input.value.length == 2) {
            input.value = "";
        }
    }

    if (def.length >= val.length) {
        val = def;
    }

    let $i = 0;
    let $leadZero = false;
    let $tmp = matrix.replace(/./g, function (a) {
        if (/[d]/.test(a) && Number(val.charAt($i)) < 1 ) {
            $leadZero = true;
        }
        if ($leadZero) {
            if (a == "d") {
                return "_";
            }
            if (a == "?") {
                return " ";
            }
            return a;
        }

        if (/[_|d?\d]/.test(a) && $i < val.length) {
            if (a == "?") {
                //return " ";
            }
            return val.charAt($i++);
        }

        if (a == "?") {
            return " ";
        }

        return a;
    });

    input.value = $tmp;
}

//функция на проверку соответствия количества введенных в инпут символов, количеству необходимых в маске
function validate_form(form, alert_text = "Please enter valid phone number") {
    var input_ln = form.querySelector('input[name="phone"]').value.replace(/ /g, '').length,
        pattern_ln = phonePattern[form.getAttribute('geo')].replace(/\?| /g, '').length;
    if (input_ln >= pattern_ln) return true;
    else {
        alert(alert_text);
        return false;
    }
}

function checkNumber(number, geo) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://lead-r.ru/api3/check_phone_number?phone=' + number + "&geo=" + geo, false);
        xhr.send();
        if (xhr.status != 200) {
            return false;
        } else {
            let response = JSON.parse(xhr.response);
            if (!response || response.response.phone_valid == undefined) {
                return false;
            }
            return response.response.phone_valid;
        }
}

function validate_number(event, alert_text = "Please enter valid phone number in internation format") {
    let form = event.currentTarget,
        phoneInput = form.querySelector('input[name="phone"]'),
        geo = form.getAttribute('geo'),
        matrix = phonePattern[geo];

    if (langPattern[geo] !== undefined) {
        alert_text = langPattern[geo];
    }

    matrix = matrix.replaceAll("-", "\\-");
    matrix = matrix.replaceAll("d", "[1\-9]{1}");
    matrix = matrix.replaceAll("?", "\\d{0,1}");
    matrix = matrix.replaceAll(" ", "\\s");
    matrix = matrix.replaceAll("+", "\\+");
    matrix = matrix.replaceAll("(", "\\(");
    matrix = matrix.replaceAll(")", "\\)");
    matrix = matrix.replaceAll("_", "\\d{1}");

    let regExp = new RegExp(matrix, 'g');

    if (!regExp.test(phoneInput.value)) {
        console.log(regExp, phoneInput.value);
        event.preventDefault();
        phoneInput.value = "";
        alert(alert_text);
        return false;
    }

    let check = checkNumber(phoneInput.value, geo.toUpperCase());

    if (!check) {
        event.preventDefault();
        phoneInput.value = "";
        alert(alert_text);
        return false;
    }
}

//сама маска, срабатывающая от ивентов ввода, фокуса, потери фокуса и нажатия кнопки мыши
document.addEventListener("DOMContentLoaded", function () {

    const inputs = document.querySelectorAll('form input[name="phone"]')

    inputs.forEach(input => {
        if (input.parentElement.closest('form') != undefined) {
            let parentForm = input.parentElement.closest('form');
            parentForm.addEventListener('submit', validate_number, false);
        }
        input.addEventListener("input", mask, false);
        input.addEventListener("blur", mask, false);
        input.addEventListener("focus", mask, false);
    })
});