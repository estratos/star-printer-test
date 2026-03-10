<template>
  <div class="app">
    <h1>Star Micronics WebPRNT Test App</h1>
    <p>This is a simple Vue.js app to test printing with Star WebPRNT SDK.</p>
    
    <div>
      <label for="url">Printer URL:</label>
      <input id="url" v-model="printerUrl" type="text" placeholder="http://localhost:8001/StarWebPRNT/SendMessage" />
    </div>
    
    <div>
      <label for="paperWidth">Paper Width:</label>
      <select id="paperWidth" v-model="paperWidth">
        <option value="inch2">2 Inch (203dpi/384dot)</option>
        <option value="inch3">3 Inch (203dpi/576dot) / 2 Inch (300dpi/576dot)</option>
        <option value="inch4">4 Inch (203dpi/832dot)</option>
      </select>
    </div>
    
    <button @click="sendPrintTest">Send Print Test</button>
    
    <div v-if="statusMessage" class="status">
      <p>{{ statusMessage }}</p>
    </div>
  </div>
</template>

<script>
// Note: You need to include StarWebPrintBuilder.js and StarWebPrintTrader.js in your index.html or import them if modularized.
// For simplicity, assume they are loaded globally via script tags in the HTML.

export default {
  data() {
    return {
      printerUrl: 'https://localhost:8001/StarWebPRNT/SendMessage',
      paperWidth: 'inch3',
      statusMessage: ''
    };
  },
  methods: {
    sendPrintTest() {
      this.statusMessage = 'Sending print request...';
      
      try {
        const builder = new StarWebPrintBuilder();
        let request = '';

        // Build a simple test receipt based on the sample
        request += builder.createInitializationElement();

        // Adjust based on paper width (simplified from sample)
        request += builder.createTextElement({ characterspace: 0 });

        request += builder.createAlignmentElement({ position: 'center' });
        request += builder.createTextElement({ data: 'Star WebPRNT Test Print\n' });
        request += builder.createTextElement({ data: 'Hello from Vue.js!\n' });
        request += builder.createAlignmentElement({ position: 'left' });

        request += builder.createTextElement({ data: '\nTest Item               $10.00\n' });
        request += builder.createTextElement({ data: 'Another Item            $20.00\n' });
        request += builder.createTextElement({ emphasis: true, data: 'Total                  $30.00\n' });

        request += builder.createCutPaperElement({ feed: true });

        // Create trader and send
        const trader = new StarWebPrintTrader({ url: this.printerUrl });

        trader.onReceive = (response) => {
          let msg = 'Print Success: ' + response.traderSuccess + '\n';
          msg += 'Status: ' + response.traderStatus;
          this.statusMessage = msg;
          alert(msg); // For debugging
        };

        trader.onError = (response) => {
          let msg = 'Error: Status ' + response.status + '\n';
          msg += 'Response: ' + response.responseText;
          this.statusMessage = msg;
          alert(msg); // For debugging SSL/network issues
        };

        trader.sendMessage({ request });
      } catch (error) {
        this.statusMessage = 'Error: ' + error.message;
        alert('Error: ' + error.message);
      }
    }
  }
};
</script>

<style>
.app {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
.status {
  margin-top: 20px;
  padding: 10px;
  background: #f0f0f0;
  border: 1px solid #ccc;
}
</style>