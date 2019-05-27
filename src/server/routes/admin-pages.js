const express = require("express");
const router = express.Router();

/**
 * update the "app.locals.pages" global variable
 * ----------------------------------------------
 * Set the "app.locals.pages" global variable to the updated "pages" array along with the updated
 * sorting. If this function were not here, then the pages that are listed in the "pages" array,
 * along with the order of those pages, would not display accurately in the header navigation or
 * in the "/admin/pages" page.
 */
function updateAppLocalsPages(request) {
  try {
    const req = request;
    return async function() {
      try {
        // Reference the MongoDB connection
        const db = req.app.locals.db;

        const pages = await db.collection("pages").find({}).sort({ sort: 1 });

        req.app.locals.pages = pages;
      }
      catch(err) {
        console.log("admin-pages.js, updateAppLocalsPages returned function Error:", err);
      }
    }
  }
  catch(err) {
    console.log("admin-pages.js, updateAppLocalsPages Error:", err);
  }
}


/*
 * Add a new page
 */
router.post("/add-page", async (req, res, next) => {
  let flash = { type: null, msg: "" };

  try {
    // Reference the MongoDB connection
    const db = req.app.locals.db;

    // // validate the data that is passed to the route
    // req.checkBody("title", "Title must have a value.").notEmpty();
    // req.checkBody("content", "Content must have a value.").notEmpty();

    const title = req.body.title;
    // The slug value is used to create unique pages. If another page already has the same slug,
    // then you need to use a different slug.
    // For the slug value that was entered by the user, replace any spaces with hyphens and make
    // all characters lowercase
    let slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
    // If no slug is entered, then use the title as the slug
    if (slug === "") {
      slug = title.replace(/\s+/g, "-").toLowerCase();
    }
    const content = req.body.content;

    const page = await db.collection("pages").findOne({ slug: slug });

    if (page) {
      flash = {
        type: "error",
        msg: "That page title or slug is already being used. Please choose another one."
      };
    }
    else {
      await db.collection("pages").insertOne({
        title: title,
        slug: slug,
        content: content,
        sort: 100
      });

      // Invoke "updateAppLocalsPages" and execute the function that is returned.
      updateAppLocalsPages(req)();

      flash = {
        type: "success",
        msg: "Page successfully added!"
      };
    }

    res.send(flash);
  }
  catch(err) {
    console.log(`\n [ENDPONT]: ${req.path} \n [ERROR]: ${err} `);
    next(err);
  }

    // const errors = req.validationErrors();

    // if (errors) {
    //   res.render("admin/add_page", {
    //     errors: errors,
    //     title: title,
    //     slug: slug,
    //     content: content
    //   });
    // } else {
    //   Page.findOne({ slug: slug }, function(err, page) {
    //     if (page) {
    //       req.flash("danger", "Page slug exists, choose another.");
    //       res.render("admin/add_page", {
    //         title: title,
    //         slug: slug,
    //         content: content
    //       });
    //     } else {
    //       const page = new Page({
    //         title: title,
    //         slug: slug,
    //         content: content,
    //         sorting: 100
    //       });

    //       page.save(function(err) {
    //         if (err) return console.log(err);

    //         // Invoke "updateAppLocalsPages" and execute the function that is returned.
    //         updateAppLocalsPages(req)();

    //         req.flash("success", "Page added!");
    //         res.redirect("/admin/pages");
    //       });
    //     }
    //   });
    // }
});


// Exports
module.exports = router;
