window.onload = function () {
    document.getElementById("btn-sign-up").addEventListener('click', function (event) {
        event.preventDefault();
        //input
        var inputUsername = document.getElementById("username").value;
        var inputPassword = document.getElementById("pwd").value;
        var inputConfirmPassword = document.getElementById("confirm-pwd").value;

        // is validated
        if (validateForm(inputUsername, inputPassword, inputConfirmPassword)) {
            var signUpSection = document.getElementById("sign-up-section");
            var signUpForm = document.getElementById("sign-up-form");

            signUpForm.remove();

            //showLoader()
            var loader = document.createElement("div");

            loader.className = "loader-sign-up mx-auto mt-5";
            signUpSection.appendChild(loader);

            var fundingInstance;
            var account;
            // Get account
            web3.eth.getAccounts(function (error, accounts) {
                if (error) {
                    console.log(error);
                }
                account = accounts[0];
            });

            //Call to contract
            window.App.contracts.Funding.deployed().then(function (instance) {
                    fundingInstance = instance;
                    console.log(window.App.hexToBytes(inputUsername, 16));
                    console.log(window.App.hexToBytes(web3.sha3(inputPassword), 32));
                    // console.log(window.App.hexToBytes(web3.sha3(inputPassword)));
                    return fundingInstance.createAccount(
                        window.App.hexToBytes(inputUsername, 16), //bytes16 username
                        window.App.hexToBytes(web3.sha3(inputPassword), 32), { //bytes32 password
                            from: account,
                            gas: 3500000,
                            gasPrice: 100,
                        });
                }).then(function (result) {
                    console.log(result);
                    loader.remove();
                    if (result.receipt.status === "0x0") {
                        showAlert("fail", signUpSection);
                    } else {
                        showAlert("success", signUpSection);
                    }
                })
                .catch(function (err) {
                    loader.remove();
                    showAlert("fail", signUpSection);
                    console.log(err);
                });
        }
    });

    function validateForm(username, password, confirmPassword) {

        // Reset errors
        errorsArray = document.getElementsByClassName("errors");
        for (var i = 0; i < errorsArray.length; i++) {
            errorsArray[i].innerText = "";
        }

        //validate
        if (username.length < 4) {
            document.getElementById("error_username").innerText = "Username has at least 4 characters";
            return false;

        } else if (password.length < 3) {
            document.getElementById("error_password").innerText = "Password has at least 3 characters";
            return false;
        } else if (confirmPassword !== password) {
            document.getElementById("error_confirm_password").innerText = "Confirm password is not matched";
            return false;
        } else {
            document.getElementsByClassName("errors").innerText = "";
            return true;
        }
    }

    function showAlert(type, element) {
        var strong = document.createElement("strong");
        var message = "";
        var div = document.createElement("div");

        var backBtn = document.createElement("a");
        backBtn.className = "btn btn-primary btn-block";

        if (type === "success") {
            div.className = "alert alert-success";
            message = document.createTextNode("Your account is registed. Now you can log in with it!");

            backBtn.textContent = "Log In";
            backBtn.href = "/log-in.html";

            strong.textContent = "Succeeded! ";
        } else if (type === "fail") {

            div.className = "alert alert-danger";
            message = document.createTextNode("There was an error occurred during the process.");

            backBtn.textContent = "Home Page";
            backBtn.href = "/";

            strong.textContent = "Failed! ";
        }

        div.appendChild(strong);
        div.appendChild(message);

        element.appendChild(div);
        element.appendChild(backBtn);
    }
};