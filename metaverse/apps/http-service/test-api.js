import http from 'http';
const data = JSON.stringify({ username: 'admin', password: 'password' }); // assuming default admin exists
const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/signin',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const resData = JSON.parse(body);
    if(resData.token) {
      console.log('Got token:', resData.token);
      // Now get elements
      const req2 = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/v1/elements',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${resData.token}` }
      }, (res2) => {
        let body2 = '';
        res2.on('data', d => body2 += d);
        res2.on('end', () => {
          const els = JSON.parse(body2).elements;
          if(els && els.length > 0) {
            console.log('Found element:', els[0].id);
            // Delete it
            const req3 = http.request({
              hostname: 'localhost',
              port: 3000,
              path: `/api/v1/admin/element/${els[0].id}`,
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${resData.token}` }
            }, (res3) => {
              let body3 = '';
              res3.on('data', d => body3 += d);
              res3.on('end', () => {
                console.log('Delete response:', res3.statusCode, body3);
              });
            });
            req3.end();
          } else {
            console.log('No elements found');
          }
        });
      });
      req2.end();
    } else {
      console.log('Signin failed:', body);
    }
  });
});
req.write(data);
req.end();
