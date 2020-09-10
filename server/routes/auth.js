const authRouter = require("express").Router();
const passport = require("passport");

authRouter.get("/github", passport.authenticate("github"));
authRouter.get(
  "/github/callback",
  passport.authenticate("github", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

authRouter.get("/logout", (request, response) => {
  request.logout();
  response.redirect("/");
});

module.exports = authRouter;
