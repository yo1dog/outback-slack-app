// a super simple server purely for proxying test HTTP requests
// to the Lambda. Basically an AWS API Gateway stand-in
// 
// responds to:
// GET /
// POST / 
// POST /webhook

const lamnda  = require('../app/lambda');
const http    = require('http');
const urlUtil = require('url');
const {IncomingMessage, ServerResponse} = http; // eslint-disable-line no-unused-vars

const PORT = parseInt(process.env.PORT, 10) || 3000; // eslint-disable-line no-process-env



// create and start the server
console.log(`Starting server on port ${PORT}...`);
const server = http.createServer(handleRequest);
server.listen(PORT, err => {
  if (err) {
    console.error('Failed to start server.');
    throw err;
  }
  
  console.log(`Server is listening on port ${PORT}`);
});


/**
 * Handles incoming requests
 * 
 * @param {IncomingMessage} req 
 * @param {ServerResponse} res 
 */
function handleRequest(req, res) {
  // get the request body
  getRequestBody(req, (err, bodyStr) => {
    if (err) throw err;
    
    console.log(`<<<<< Request: ${req.method} ${req.url} ${bodyStr}`);
    
    const url = urlUtil.parse(req.url, true);
    const method = req.method;
    const normPathname = url.pathname === '/' || !url.pathname.endsWith('/')? url.pathname : url.pathname.substring(0, url.pathname.length - 1);
    
    const isUnderstoodReq = (
      (method === 'GET'  && normPathname === '/'       ) ||
      (method === 'POST' && normPathname === '/'       ) ||
      (method === 'POST' && normPathname === '/webhook')
    );
    if (!isUnderstoodReq) {
      return sendResponse(res, 501, {}, 'Not Implemented');
    }
    
    // convert the HTTP request to a fake Lambda event
    const fakeEvent = {
      body: bodyStr,
      queryStringParameters: url.query
    };
    const fakeContext = {};
    
    // send the fake Lambda event to the handler
    lamnda.handler(fakeEvent, fakeContext, (err, result) => {
      if (err) {
        return sendResponse(res, 400, {}, err.stack); // return a 400 instead of a 500 because slack displays 4XXs and hides 5XXs
      }
      
      // convert the Lambda result into an HTTP response
      return sendResponse(res, result.statusCode, result.headers, result.body);
    });
  });
}

/**
 * @param {IncomingMessage} req 
 * @param {(err:Error, bodyStr:string) => void} cb 
 */
function getRequestBody(req, cb) {
  let bodyStr = '';
  req.setEncoding('utf8');
  
  req.on('error', err => {
    return cb(err);
  });
  req.on('data', chunk => {
    bodyStr += chunk;
  });
  req.on('end', () => {
    return cb(null, bodyStr);
  });
}

/**
 * @param {ServerResponse} res 
 * @param {number} statusCode 
 * @param {string} bodyStr 
 * @param {(err:Error) => void} [cb]
 */
function sendResponse(res, statusCode, headers, bodyStr, cb = null) {
  cb = cb || function(err) {
    if (err) throw err;
  };
  
  res.statusCode = statusCode;
  
  for (let headerName in headers) {
    res.setHeader(headerName, headers[headerName]);
  }
  
  res.write(bodyStr, 'utf8', err => {
    if (err) return cb(err);
    res.end();
    
    console.log(`>>>>> Response: ${statusCode} ${bodyStr}`);
    return cb();
  });
}