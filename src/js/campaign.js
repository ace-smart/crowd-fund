Campaign = {
    web3Provider: null,
    contracts: {},

    init: function () {
        var campUsername = document.getElementById("username");
        if (campUsername) {
            campUsername.value = web3.toAscii(window.App.account.username);
        }
        // Set datePicker to today
        // MM-DD-YYYY
        Date.prototype.toDateInputValue = (function () {
            var local = new Date(this);
            local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
            return local.toJSON().slice(0, 10);
        });
        document.getElementById('datePicker').value = new Date().toDateInputValue();
        return Campaign.initWeb3();
    },

    initWeb3: function () {
        // Is there an injected web3 instance?
        if (typeof web3 !== 'undefined') {
            Campaign.web3Provider = web3.currentProvider;
        } else {
            // If no injected web3 instance is detected, fall back to Ganache
            Campaign.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(Campaign.web3Provider);

        return Campaign.initContract();
    },

    initContract: function () {
        $.getJSON('Funding.json', function (data) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract
            var FundingArtifact = data;
            Campaign.contracts.Funding = TruffleContract(FundingArtifact);

            // Set the provider for our contract
            Campaign.contracts.Funding.setProvider(Campaign.web3Provider);

        });

        return Campaign.bindEvents();
    },

    bindEvents: function () {
        $(document).on('click', '#btn-create', Campaign.create);
    },

    create: function (event) {
        event.preventDefault();

        //showLoader()
        document.getElementById("loader").classList.remove("d-none");


        //save to ipfs
        var jsonData = {
            "nameOfCampaign": document.getElementById("name").value,
            "createdByUsername": document.getElementById("username").value,
            "dateCreated": document.getElementById("datePicker").value,
            "description": document.getElementById("description").value,
        };
        console.log(jsonData);
        window.App.addDataToIpfs(jsonData);// convert to ipfsHash
        var ipfsHash = localStorage.getItem("ipfsHash");
        var fundingInstance;
        var account;

        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }
            account = accounts[0];
        });
        Campaign.contracts.Funding.deployed().then(function (instance) {
            fundingInstance = instance;
            // Execute adopt as a transaction by sending account 
            return fundingInstance.createCampaign(window.App.account.username,
                window.App.hexToBytes(jsonData.nameOfCampaign,"bytes"),
                window.App.hexToBytes(ipfsHash,"bytes"), {
                from: account,
                gas: 3500000,
                gasPrice: 100,
            });
        }).then(function (result) {
            console.log(result);
            document.getElementById("loader").classList.add("d-none");
            if (result.receipt.status === "0x0") {
                var error = document.getElementById("error_txt");
                error.className = "alert alert-danger my-3";
                error.innerHTML = "<strong>Failed!</strong> The operation was interupted with errors";
            } else {
                var success = document.getElementById("error_txt");
                success.className = "alert alert-success my-3";
                success.innerHTML = "<strong>Success!</strong>The campaign is created!";
            }
        }).catch(function (error) {
            console.log(error.message);
        });
    },

};

$(function () {
    $(window).load(function () {
        Campaign.init();
    });
});