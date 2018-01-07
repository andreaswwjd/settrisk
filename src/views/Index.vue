<template>
  <div class="index">
    <div class="margintop" style="width:100%; height: 100px;"></div>
    <h1>Settrisk 3.0</h1>
    <router-link to="/new/user"><button class="big_btn">New User</button></router-link>
    <router-link to="/games"><button class="big_btn">Games</button></router-link>
    <router-link to="/new/board"><button class="big_btn">Maps Builder</button></router-link>
    <router-link to="/rules"><button class="big_btn">Rules</button></router-link>
    <router-link to="/guide"><button class="big_btn">Guide</button></router-link>
    <router-link to="/about"><button class="big_btn">About</button></router-link>
    <!-- <form name="swishPay" action="https://swicpc.bankgirot.se/swishcpcapi/api/v1/paymentrequests" method="post">
      <input type="text" name="payeePaymentReference" value="0123456789">
      <input type="text" name="callbackUrl" value="https://www.google.se/search?dcr=0&source=hp&q=success">
      <input type="text" name="payeeAlias" value="1239009903">
      <input type="text" name="amount" value="10">
      <input type="text" name="currency" value="SEK">
      <input type="text" name="message" value="Det här är ett test!">
      <input type="submit" value="Submit">
    </form> -->
    <!-- <button v-on:click="swish">Swisha!</button> -->
  </div>
</template>

<!-- {
"payeePaymentReference": "0123456789",
"callbackUrl": "https://example.com/api/swishcb/paymentrequests",
"payerAlias": "46701234567",
"payeeAlias": "1234760039",
"amount": "100",
"currency": "SEK",
"message": "Kingston USB Flash Drive 8 GB"
} -->

<script>
export default {
  name: 'index',
  data () {
    return {
      users: [],
      games: []
    }
  },
  computed: {
    
  },
  sockets:{
    connect: function(){
      console.log('socket connected')
    },
    authorized: function(val){
      console.log('this method was fired by the socket server. eg: io.emit("customEmit", data)')
      console.log(val)
    },
    
  },
  methods: {
    // swish: function(){
    //   var self = this;
    //   var xhttp = new XMLHttpRequest();
    //   xhttp.onreadystatechange = function() {
    //     if (this.readyState == 4 && this.status == 200) {
    //       console.log(this.responseText)
    //     }
    //   };
    //   xhttp.open("POST", "https://swicpc.bankgirot.se/swishcpcapi/api/v1/paymentrequests", true);
    //   xhttp.setRequestHeader('Content-Type', 'application/json');
    //   xhttp.send(JSON.stringify({
    //     "payeePaymentReference": "0123456789",
    //     "callbackUrl": "https://www.google.se/search?dcr=0&source=hp&q=success",
    //     "payerAlias": "46708236172",
    //     "payeeAlias": "1239009903",
    //     "amount": "10",
    //     "currency": "SEK",
    //     "message": "Det här är ett test!"
    //   }));
    // }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.games {
  overflow: hidden;
}
.index {
      max-width: 500px;
    margin: 0 auto;
}

</style>
