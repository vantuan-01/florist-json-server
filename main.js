const jsonServer = require("json-server");
const server = jsonServer.create();

const routerDb = jsonServer.router("db.json");

const middlewares = jsonServer.defaults();
const queryString = require("query-string");

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.get("/echo", (req, res) => {
  res.jsonp(req.query);
});

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);
server.use((req, res, next) => {
  if (req.method === "POST") {
    req.body.createdAt = Date.now();
    req.body.updatedAt = Date.now();
  } else if (req.method === "PATCH") {
    req.body.updatedAt = Date.now();
  }
  // Continue to JSON Server router
  next();
});

routerDb.render = (req, res) => {
  // check GET with pagination
  // if yes, custom output

  const headers = res.getHeaders();
  const totalCountHeader = headers["x-total-count"];
  console.log("header :", totalCountHeader);
  if (req.method === "GET" && totalCountHeader) {
    const queryParam = queryString.parse(req._parsedUrl.query);
    console.log("query : ", queryParam);
    const result = {
      data: res.locals.data,
      pagination: {
        _page: Number.parseInt(queryParam._page) || 1,
        _limit: Number.parseInt(queryParam._limit) || 10,
        _totalRows: Number.parseInt(totalCountHeader),
      },
    };
    return res.jsonp(result);
  }
  res.jsonp(res.locals.data);
};

// Start server

server.use("/api/product", routerDb);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log("JSON Server is running");
});
