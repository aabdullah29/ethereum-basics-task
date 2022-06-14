App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,

  init: function() {
    console.log("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function() {
    if ((typeof window.ethereum !== 'undefined') || (typeof window.web3 !== 'undefined')) {
      App.web3Provider = window.ethereum;
      web3 = new Web3(window['ethereum'] || window.web3.currentProvider)
    } else {
      // here you could use a different provider, maybe use an infura account, or maybe let the user know that they need to install metamask in order to continue
      App.web3Provider = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'))
      web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'))
    }

    //Old
    // if (typeof web3 !== 'undefined') {
    //   // If a web3 instance is already provided by Meta Mask.
    //   App.web3Provider = web3.currentProvider;
    //   web3 = new Web3(web3.currentProvider);
    // } else {
    //   // Specify default instance if no web3 instance provided
    //   App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    //   web3 = new Web3(App.web3Provider);
    // }
    
    return App.initContracts();
  },

  initContracts: function() {
    $.getJSON("saleFoxToken.json", function(saleFoxToken) {
      // pass the ABI and Byte code to "TruffleContract" in JSON form
      App.contracts.SaleFoxToken = TruffleContract(saleFoxToken);
      App.contracts.SaleFoxToken.setProvider(App.web3Provider);
      App.contracts.SaleFoxToken.deployed().then(function(saleFoxToken) {
        console.log("Fox Token Sale Address:", saleFoxToken.address);
      });
    }).done(function() {
      $.getJSON("FoxToken.json", function(foxToken) {
        // pass the ABI and Byte code to "TruffleContract" in JSON form
        App.contracts.FoxToken = TruffleContract(foxToken);
        App.contracts.FoxToken.setProvider(App.web3Provider);
        App.contracts.FoxToken.deployed().then(function(foxToken) {
          console.log("Fox Token Address:", foxToken.address);
        });

        App.listenForEvents();
        return App.render();
      });
    })
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.SaleFoxToken.deployed().then(function(instance) {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function(error, event) {
        console.log("event triggered", event);
        App.render();
      })
    })
  },

  render: function() {
    if (App.loading) {
      return;
    }
    App.loading = true;
    var loader  = $('#loader');
    var content = $('#content');
    loader.show();
    content.hide();
    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $('#accountAddress').html("Your Account: " + account);
      }
    })
    // Load token sale contract
    App.contracts.SaleFoxToken.deployed().then(function(instance) {
      saleFoxTokenInstance = instance;
      return saleFoxTokenInstance.tokenPrice();
    }).then(function(tokenPrice) {
      App.tokenPrice = tokenPrice;
      $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
      return saleFoxTokenInstance.tokensSold();
    }).then(function(tokensSold) {
      App.tokensSold = tokensSold.toNumber();
      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.tokensAvailable);
      var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%');
      // Load token contract
      App.contracts.FoxToken.deployed().then(function(instance) {
        foxTokenInstance = instance;
        return foxTokenInstance.balanceOf(App.account);
      }).then(function(balance) {
        $('.fet-balance').html(balance.toNumber());
        App.loading = false;
        loader.hide();
        content.show();
      })
    });
  },

  buyTokens: function() {
    $('#content').hide();
    $('#loader').show();
    var numberOfTokens = $('#numberOfTokens').val();
    
    App.contracts.SaleFoxToken.deployed().then(function(instance) {
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000 // Gas limit
      });
    }).then(function(result) {
      console.log("Tokens bought...")
      $('form').trigger('reset') // reset number of tokens in form
      // Wait for Sell event
    });
  }
}

$(function() {
  $(window).load(function() {
    App.init();
  })
});
