const NODE_ENV = process.env.NODE_ENV || "development";

const express = require("express");
const path = require("path");
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
// const session = require("express-session");
// const expressValidator = require("express-validator");
// const fileUpload = require("express-fileupload");
// const passport = require("passport");

/**
 * MongoDB configs
 */
// Connection URL
let url = "";
if (NODE_ENV !== "production") {
  // Development URL
  url = "mongodb://172.28.1.2:27017";
}
else {
  // Production URL
  // url = "";
}

// Database Name
const dbName = "inkcms";

(async () => {
  try {
    // Use the connect method to connect to the MongoDB server
    const dbConnection = await MongoClient.connect(url, { useNewUrlParser: true });

    // Store the MongoDB connection in a global variable that can be accessed throughout the app
    app.locals.db = dbConnection.db(dbName);
    // const db = dbConnection.db(dbName);

    // client.close();

    // Log the connection message
    const mongoServer = dbConnection.s.options.servers[0];
    console.log("Connected to MongoDB server at", mongoServer);
  }
  catch(err) {
    console.log(`MongoDB connection error: ${err}`);
  }
})();

// Initialize the app
const app = express();

// // View engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "ejs");

// // Set public folder
// app.use(express.static(path.join(__dirname, "public")));

// // Set global errors variable
// app.locals.errors = null;

// // Get Page Model
// const Page = require('./models/page');

// // Get all pages to pass to header.ejs
// Page.find({}).sort({ sorting: 1 }).exec(function(err, pages) {
//   if (err) {
//     console.log(err);
//   }
//   else {
//     app.locals.pages = pages;
//   }
// });

app.locals.pages = [];

// // Get Category Model
// const Category = require('./models/category');

// // Get all categories to pass to header.ejs
// Category.find(function(err, categories) {
//   if (err) {
//     console.log(err);
//   }
//   else {
//     app.locals.categories = categories;
//   }
// });

// // Express fileUpload middleware
// app.use(fileUpload());

// Body Parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// // Express Session middleware
// app.use(session({
//   secret: 'keyboard cat',
//   resave: true,
//   saveUninitialized: true,
//   // cookie: { secure: true }
// }));

// // Express Validator middleware
// app.use(expressValidator({
//   errorFormatter: function(param, msg, value) {
//     const namespace = param.split(".")
//     , root = namespace.shift()
//     , formParam = root;

//     while(namespace.length) {
//       formParam += "[" + namespace.shift() + "]";
//     }
//     return {
//       param : formParam,
//       msg   : msg,
//       value : value
//     };
//   },
//   customValidators: {
//     isImage: function(value, filename) {
//       const extension = (path.extname(filename)).toLowerCase();
//       switch (extension) {
//         case ".jpg":
//           return ".jpg";
//         case ".jpeg":
//           return ".jpeg";
//         case ".png":
//           return ".png";
//         case "":
//           return ".jpg";
//         default:
//           return false;
//       }
//     }
//   }
// }));

// // Express Messages middleware
// app.use(require('connect-flash')());
// app.use(function (req, res, next) {
//   res.locals.messages = require('express-messages')(req, res);
//   next();
// });

// // Passport Config
// require('./config/passport')(passport);
// // Passport Middleware
// app.use(passport.initialize());
// app.use(passport.session());

// /**
//  * Shopping Cart
//  * --------------
//  * The shopping cart is an array that holds objects. Each object represents a product.
//  * The shopping cart array is stored in a session and then made available to each request/response
//  * cycle via the "res.locals.cart" variable.
//  * But I will probably make the shopping cart more frontend centric. I will probably store
//  * the shopping cart array in localStorage and then work with it from there.
//  */
// app.get("*", function(req, res, next) {
//   // "req.session.cart" will be undefined until a user adds a product to their cart in the
//   // "/cart/add/:product" route. So you need to set the "cart" variable as an empty array by default.
//   const cart = [];
//   if (req.session.cart) {
//     cart = req.session.cart;
//   }

//   const items = 0;
//   for (let i = 0; i < cart.length; i++) {
//     items = items + cart[i].qty
//   }

//   // Set the "res.locals.cart" variable to equal "req.session.cart" so that the cart array is
//   // available in each request/response cycle.
//   res.locals.cart = req.session.cart;

//   // Set the "res.locals.items" variable to equal the value of "items" so that the "items" value is
//   // available in each request/response cycle.
//   res.locals.items = items;

//   // Create a global user variable. If the user is logged in, then the app will have access to the user variable. If the user is not logged in, then the user variable will be null.
//   res.locals.user = req.user || null;

//   // Call "next" to tell Express to continue on to the next route in the request lifecycle
//   next();
// });

// Define route modules
const pages = require("./routes/pages.js");
app.use("/pages", pages);

// const adminPages = require("./routes/admin-pages.js");
// app.use("/admin/pages", adminPages);

// const products = require("./routes/products.js");
// const cart = require("./routes/cart.js");
// const users = require("./routes/users.js");
// const adminCategories = require("./routes/admin_categories.js");
// const adminProducts = require("./routes/admin_products.js");

// app.use("/admin/categories", adminCategories);
// app.use("/admin/products", adminProducts);
// app.use("/products", products);
// app.use("/cart", cart);
// app.use("/users", users);

// Start the server
const port = 3000;
app.listen(port, function() {
  console.log(`Server started on port ${port}`);
});
