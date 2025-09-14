define(['jquery', 'qlik'], function($, qlik) {
  return {
    paint: function($element) {
      if ($('#chatbot').length) return;

      $element.append(`
        <div id="chatbot" class="chat-container">
          <div id="chat-log"></div>
          <input id="chat-input" placeholder="Ask your question..." />
          <button id="chat-send">Send</button>
        </div>
      `);

      $('#chat-send').on('click', async () => {
        const query = $('#chat-input').val();
        if (!query) return;

        $('#chat-log').append(`<div class="user-msg">${query}</div>`);

        const resp = await fetch('http://localhost:3000/ai-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            objectId: 'your-object-id'
          })
        });

        const data = await resp.json();
        $('#chat-log').append(`<div class="bot-msg">${data.text}</div>`);

        if (data.chart) {
          $('#chat-log').append('<canvas id="chat-chart"></canvas>');
          new Chart($('#chat-chart'), data.chart);
        }

        if (data.excel) {
          $('#chat-log').append(`<a href="${data.excel}" target="_blank">Download Excel</a>`);
        }
      });
    }
  };
});
