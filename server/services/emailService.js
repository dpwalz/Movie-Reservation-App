const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");

const { getOneTicket } = require("../models/Ticket");
const { getPresaleMovieTitles } = require("../models/Movie");
const { getAllUsers } = require("../models/User");
const { getUserByEmail } = require("./userService");

const serviceMethods = {};
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "TheOnlyMovieTheatreEver@gmail.com",
    pass: "lgfcyyfytsbimuko",
  },
});
// point to the template folder
transporter.use(
  "compile",
  hbs({
    viewEngine: {
      extname: ".handlebars",
      layoutsDir: "./views",
      defaultLayout: false,
      partialsDir: "../views",
    },
    viewPath: "./views",
    extName: ".handlebars",
  })
);
const sender = '"Group 2 Movie Theatres" <TheOnlyMovieTheatreEver@gmail.com>';

const sendTicketReceiptService = (recipient, ticket, url) => {
  try {
    const result = transporter.sendMail({
      from: sender,
      to: "derek.walz90@gmail.com",
      subject: "Your Movie Ticket Receipt",
      template: "receipt", // email.handlebars in the views folder
      context: {
        ticket: ticket,
        url: url,
      },
    });
    return result;
  } catch (err) {
    return err;
  }
};

const sendMovieNewsService = async (recipient, first_name) => {
  try {
    const presaleMovies = await getPresaleMovieTitles();
    const result = transporter.sendMail({
      from: sender,
      to: recipient,
      subject: "Your latest Movie News!",
      template: "movieNews", // email.handlebars in the views folder
      context: {
        name: first_name,
        presaleMovies: presaleMovies,
      },
    });
    return result;
  } catch (err) {
    console.log(err);
    return err;
  }
};

//TODO: Get user email and name
//TODO: No errors thrown on ticket not found?
//TODO: Add link to cancel ticket
serviceMethods.sendTicketReceipt = async (ticket_id, email) => {
  ticket = await getOneTicket(ticket_id);
  url = "http://localhost:3000/ticket/" + ticket_id;
  result = await sendTicketReceiptService(email, ticket, url);
  if (result.accepted.length > 0) return { successes: [email] };
  else return { failures: [email] };
};

serviceMethods.sendMovieNewsAllUsers = async () => {
  const users = await getAllUsers();
  const recipients = users.map((u) => ({
    email: u.email_address,
    first_name: u.first_name,
  }));
  const successes = [];
  const failures = [];
  for (let i = 0; i < recipients.length; i++) {
    result = await sendMovieNewsService(
      recipients[i].email,
      recipients[i].first_name
    );
    if (result.accepted.length > 0) successes.push(recipients[i].email);
    else failures.push(recipients[i].email);
  }
  return { successes, failures };
};

serviceMethods.sendWelcomeEmail = async (email, first_name) => {
  // send movie news to a user when they first register
  result = await sendMovieNewsService(email, first_name);
  if (result.accepted.length > 0) return { successes: [email] };
  else return { failures: [email] };
};

module.exports = serviceMethods;
