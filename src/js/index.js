Index = {
    web3Provider: null,
    contracts: {},

    init: function () {
        return Index.initWeb3();
    },

    initWeb3: function () {
        // Is there an injected web3 instance?
        if (typeof web3 !== 'undefined') {
            Index.web3Provider = web3.currentProvider;
        } else {
            // If no injected web3 instance is detected, fall back to Ganache
            Index.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(Index.web3Provider);

        return Index.initContract();
    },

    initContract: function () {
        $.getJSON('Funding.json', function (data) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract
            var FundingArtifact = data;
            Index.contracts.Funding = TruffleContract(FundingArtifact);

            // Set the provider for our contract
            Index.contracts.Funding.setProvider(Index.web3Provider);

            return Index.showCampaigns();
        });

        // return Index.bindEvents();
    },

    // bindEvents: function () {
    //     $(document).on('click', '#btn-create', Index.create);
    // },

    
    showCampaigns: function () {
        var fundingInstance;

        Index.contracts.Funding.deployed().then(function (instance) {
            fundingInstance = instance;
            return fundingInstance.getCampaignCount.call();

        }).then(function (length) {
            console.log("length: " + length.toString());
            return lengthOfCampaigns = length.toString();

        }).then(function () {
            Index.contracts.Funding.deployed().then(function (instance) {
                fundingInstance = instance;
                for (var i = 0; i < lengthOfCampaigns; i++) {

                    fundingInstance.getCampaign.call(i).then(function (campaign) {
                        var row = document.createElement("tr");
                        var col1 = document.createElement("td");
                        var col2 = document.createElement("td");
                        var col3 = document.createElement("td");
                        var col4 = document.createElement("td");
                        var col5 = document.createElement("td");
                        var donateBtn = document.createElement("a");
                        donateBtn.className = "btn btn-primary text-light";
                        donateBtn.innerText = "Donate";
                        donateBtn.href = "/donate.html?id=" + campaign[0].toNumber();

                        col1.appendChild(document.createTextNode(campaign[0].toNumber()));
                        col2.appendChild(document.createTextNode(campaign[1]));
                        col3.appendChild(document.createTextNode(campaign[2].toNumber()));
                        col4.appendChild(document.createTextNode(campaign[3].toNumber()));
                        col5.appendChild(donateBtn);

                        row.appendChild(col1);
                        row.appendChild(col2);
                        row.appendChild(col3);
                        row.appendChild(col4);
                        row.appendChild(col5);
                        document.getElementById("campaigns-tbody").appendChild(row);
                        console.log(campaign);
                    });

                }
            });
        });

    }

};

$(function () {
    $(window).load(function () {
        Index.init();
    });
});