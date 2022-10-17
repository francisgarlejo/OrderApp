/* index.js
    Order App

    Revision History
        Francis Gerald H. Garlejo, 2022.08.11: Created, 2022.08.12: Revised
*/

// import the dependencies
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

//setting up Express Validator
const { check, validationResult } = require('express-validator'); // ES6 standard for destructuring an object

// Establish DB connection
const mongoose = require('mongoose');
const { Console } = require('console');
mongoose.connect('mongodb://localhost:27017/assignment5_DB');
var db = mongoose.connection;
const { Schema } = mongoose;

//Create the DB Schema
const contact = new mongoose.Schema({
    name: String,
    address: String,
    city: String,
    province: String,
    email: String,
    phone: String,
    prod1Quantity: String,
    prod2Quantity: String,
    product1FinalPrice: String,
    product2FinalPrice: String,
    shippingcharge: String,
    subtotal: String,
    salestax: String,
    finaltotal: String,

});

const myDatabase = mongoose.model("order_details", contact)

// set up variables to use packages
var myApp = express();
myApp.use(bodyParser.urlencoded({ extended: false }));

// set up views and public folders
myApp.set('views', path.join(__dirname, 'views'));
myApp.use(express.static(__dirname + '/public'));
myApp.set('view engine', 'ejs');
myApp.get('/', function (req, res) {
    res.render('home', {
        initName: null,
        initAddress: null,
        initCity: null,
        initProvince: null,
        initPostCode: null,
        initEmail: null,
        initPhone: null,
        initDeliveryTime: null
    }); // no need to add .ejs to the file name
});

//defining regular expressions
var phoneRegex = /^[0-9]{3}\-[0-9]{3}\-[0-9]{4}$/;
var emailRegex = /^(\w+)@([a-zA-Z]+)(\.[a-zA-Z]{2,3}){1,2}$/;
var postcodeRegex = /^(?!.*[DFIOQU])[A-VXY][0-9][A-Z] ?[0-9][A-Z][0-9]$/;

//function to check a value using regular expression
function checkRegex(userInput, regex) {
    if (regex.test(userInput)) {
        return true;
    }
    else {
        return false;
    }
}

// Custom phone validation function
function customPhoneValidation(value) {
    if (!checkRegex(value, phoneRegex)) {
        throw new Error('Phone number should be in the format: xxx-xxx-xxxx');
    }
    return true;
}

// Email validation function
function customEmailValidation(value) {
    if (!checkRegex(value, emailRegex)) {
        throw new Error('Email address should be in the format: test@gmail.com or test@gmail.com.ph');
    }
    return true;
}

//Post Code validation function
function postcodeValidation(value) {
    if (!checkRegex(value, postcodeRegex)) {
        throw new Error('Post Code should be in the right format: N2B 8X8');
    }
    return true;
}

function insert() {

}

myApp.post('/getDetails', [
    check('nameInput', 'Must have a name').not().isEmpty(),
    check('addInput', 'Must have an address').not().isEmpty(),
    check('cityInput', 'Must have a city').not().isEmpty(),
    check('provInput', 'Must have a province').not().isEmpty(),
    check('postCodeInput').custom(postcodeValidation),
    check('emailInput').custom(customEmailValidation),
    check('phoneInput').custom(customPhoneValidation),
    check('deliveryTime', 'Must choose the number of delivery days').not().isEmpty()

], function (req, res) {

    var name = req.body.nameInput;
    var address = req.body.addInput;
    var city = req.body.cityInput;
    var prov = req.body.provInput;
    var email = req.body.emailInput;
    var phone = req.body.phoneInput;
    var postcode = req.body.postCodeInput;
    var prod1Quantity = req.body.prod1Quantity;
    var prod2Quantity = req.body.prod2Quantity;
    var deliveryTime = req.body.deliveryTime;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors); // check what is the structure of errors
        res.render('home', {
            errors: errors.array(),
            initName: name,
            initAddress: address,
            initCity: city,
            initProvince: prov,
            initPostCode: postcode,
            initEmail: email,
            initPhone: phone,
            initDeliveryTime: deliveryTime
        });
    }
    else {
        if (prod1Quantity == 0 && prod2Quantity == 0) {
            var errorMessage = [{ msg: "We cannot generate the receipt because you haven't ordered anything!" },
            { msg: "The minimum purchase should be of $10." }]

            res.render('home', {
                errors: errorMessage,
                initName: name,
                initAddress: address,
                initCity: city,
                initProvince: prov,
                initPostCode: postcode,
                initEmail: email,
                initPhone: phone,
            });
        }
        var taxRate = 0;

        if (prov == "Alberta") {
            taxRate = 0.05;
        }

        if (prov == "BritishColumbia") {
            taxRate = 0.12;
        }
        if (prov == "Manitoba") {
            taxRate = 0.12;
        }
        if (prov == "NewBrunswick") {
            taxRate = 0.15;
        }
        if (prov == "NewfoundlandLabrador") {
            taxRate = 0.15;
        }
        if (prov == "NorthwestTerritories") {
            taxRate = 0.05;
        }
        if (prov == "NovaScotia") {
            taxRate = 0.15;
        }
        if (prov == "Nunavut") {
            taxRate = 0.05;
        }
        if (prov == "Ontario") {
            taxRate = 0.13;
        }
        if (prov == "PrinceEdwardIsland") {
            taxRate = 0.15;
        }
        if (prov == "Quebec") {
            taxRate = 0.14975;
        }
        if (prov == "Saskatchewan") {
            taxRate = 0.11;
        }
        if (prov == "Yukon") {
            taxRate = 0.05;
        }

        var shippingCharge;

        if (deliveryTime == 1) {
            shippingCharge = 25;
        }
        if (deliveryTime == 2) {
            shippingCharge = 20;
        }
        if (deliveryTime == 3) {
            shippingCharge = 15;
        }
        if (deliveryTime == 4) {
            shippingCharge = 10;
        }
        if (deliveryTime == 5) {
            shippingCharge = 5;
        }


        var prodOneFinalPrice = Number(prod1Quantity * 150);
        var prodTwoFinalPrice = Number(prod2Quantity * 110)
        var subTotal = Number(prod1Quantity * 150) + Number(prod2Quantity * 110)
        var finalTax = Number(subTotal * taxRate).toFixed(2);
        var finalTotal = Number(subTotal) + Number(finalTax) + Number(shippingCharge);
        finalTotal = finalTotal.toFixed(2);

        myDatabase.create({
            name: name,
            address: address,
            city: city,
            province: prov,
            email: email,
            phone: phone,
            prod1Quantity: prod1Quantity,
            prod2Quantity: prod2Quantity,
            product1FinalPrice: prodOneFinalPrice,
            product2FinalPrice: prodTwoFinalPrice,
            shippingcharge: shippingCharge,
            subtotal: subTotal,
            salestax: finalTax,
            finaltotal: finalTotal
        }).then((order) => {
            const retrieveDbDetails = {
                name: name,
                address: address,
                city: city,
                province: prov,
                email: email,
                phone: phone,
                prod1Quantity: prod1Quantity,
                prod2Quantity: prod2Quantity,
                product1FinalPrice: prodOneFinalPrice,
                product2FinalPrice: prodTwoFinalPrice,
                shippingcharge: shippingCharge,
                subtotal: subTotal,
                salestax: finalTax,
                finaltotal: finalTotal
            }

            var pageRetrieveData = {}
            console.log("This is the retrieve data = " + pageRetrieveData);

            myDatabase.findOne(retrieveDbDetails, 'name address city province email phone prod1Quantity prod2Quantity product1FinalPrice product2FinalPrice shippingcharge subtotal salestax finaltotal', function (err, order) {
                console.log("This is the order = " + order);

                if (order != null) {

                    pageRetrieveData.pageData_name = order.name;
                    pageRetrieveData.pageData_address = order.address;
                    pageRetrieveData.pageData_city = order.city;
                    pageRetrieveData.pageData_prov = order.province;
                    pageRetrieveData.pageData_email = order.email;
                    pageRetrieveData.pageData_phone = order.phone;
                    pageRetrieveData.pageData_prod1Quantity = order.prod1Quantity;
                    pageRetrieveData.pageData_prod2Quantity = order.prod2Quantity;
                    pageRetrieveData.pageData_prodOneFinalPrice = order.product1FinalPrice;
                    pageRetrieveData.pageData_prodTwoFinalPrice = order.product2FinalPrice;
                    pageRetrieveData.pageData_shippingCharge = order.shippingcharge;
                    pageRetrieveData.pageData_subTotal = order.subtotal;
                    pageRetrieveData.pageData_finalTax = order.salestax;
                    pageRetrieveData.pageData_finalTotal = order.finaltotal;
                    res.render('receipt', pageRetrieveData);
                }
            });
        })
    }
});

myApp.listen(8080);
console.log('Everthing executed fine.. Open http://localhost:8080/');
