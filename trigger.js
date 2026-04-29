const http = require('http');

http.get('http://localhost:3001/api/automations', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const automations = JSON.parse(data);
    if(automations.length > 0) {
      const id = automations[0].id;
      console.log('Triggering run for', id);
      const req = http.request(`http://localhost:3001/api/automations/${id}/run`, { method: 'POST' }, (res) => {
         let runData = '';
         res.on('data', chunk => runData += chunk);
         res.on('end', () => console.log('Run triggered:', runData));
      });
      req.end();
    } else {
      console.log('No automations found');
    }
  });
});
