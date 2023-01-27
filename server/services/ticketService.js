const ticketModel = require("../models/Ticket");
const { getOneSeat, updateOneSeat } = require("../services/seatService");
const { makeNewRefund } = require("../services/refundService");
const { getOnePayment } = require("../services/paymentService");
const { getOneUser } = require("../services/userService");
const { sendTicketReceipt } = require("../services/emailService");
const constants = require("../config/constants");

const serviceMethods = {};

// Return all tickets.
serviceMethods.getAllTickets = async (query) => {
  try {
    const results = await ticketModel.getAllTickets(query);
    return results;
  } catch (err) {
    return err;
  }
};

// Return all tickets with detailed information.
serviceMethods.getAllTicketsDetailed = async (query) => {
  try {
    const results = await ticketModel.getAllTicketsDetailed(query);
    return results;
  } catch (err) {
    return err;
  }
};

// Get Tickets by ID only.
// RETURNS {user_id:"", seat_id:"", cost: "", show_time: ""}
serviceMethods.getTicketById = async (ticket_id) => {
  try {
    const results = await ticketModel.getTicketById(ticket_id);
    return results;
  } catch (err) {
    return err;
  }
};

// Get Detailed Tickets by ID only.
// RETURNS {user_id:"", seat_id:"", cost: "", show_time: ""}
serviceMethods.getOneTicket = async (ticket_id) => {
  try {
    const results = await ticketModel.getOneTicket(ticket_id);
    return results;
  } catch (err) {
    return err;
  }
};

// Create Ticket.
// REQUIRES: User_id, and the body to contain key for "seat_id" and "cost"
// RETURNS {user_id:"", seat_id:"", cost: "", isCredit: ""}
serviceMethods.createTicket = async (body, user_id) => {
  try {
    const { seat_id, payment_id } = body;
    let { email } = body;
    const isRegisteredUser = user_id != null;
    if (isRegisteredUser) {
      const user = await getOneUser(user_id);
      email = user.email_address;
      console.log(email);
    }
    // Get provided seat to ensure it is available
    const seat = await getOneSeat(seat_id, isRegisteredUser);
    if (!seat) throw new Error("Selected seat not found.");
    if (!seat.is_available) throw new Error("Selected seat is not available.");
    const payment = await getOnePayment(payment_id);
    if (!payment) throw new Error("Payment was not found");
    if (seat.cost > payment.total_amount)
      throw new Error("Payment insufficient.");
    const result = await ticketModel.createTicket(body, user_id);
    const update = await updateOneSeat(seat_id, true);
    //TODO: Suspending ticket email as a big has been identified after updating node on local
    // const send_email = await sendTicketReceipt(result.ticket_id, email);
    return result;
  } catch (err) {
    return err;
  }
};

// TODO: I think the  route should be POST /tickets/:ticket_id, body should be "cancel":true
// Cancel Ticket - Regardless of user type or date. Controller must do logic to
// determine additional details.
// REQUIRES: ticket_id, seat_id, and credit
// RETURNS {ticket_id:"", credit_available: ""}
serviceMethods.cancelTicketById = async (body, isRegisteredUser) => {
  try {
    const { ticket_id } = body;
    let ticket = await serviceMethods.getTicketById(ticket_id);
    if (!ticket) throw "Selected Ticket Not Found";
    const { user_id, seat_id, show_time } = ticket;
    const seat = await getOneSeat(seat_id, isRegisteredUser);
    if (!seat) throw "No Seat Found for Ticket";
    const { cost } = seat;
    isRegisteredUser = isRegisteredUser || user_id != null;
    if (!canCancel(show_time))
      throw "Show time less than 72 hours away, cancellation not fulfilled.";
    let credit = cost;
    const expiration_date = getExpirationDate();
    // Apply admin fee if the user is not registered.
    if (!isRegisteredUser) credit = cost * (1 - constants.ADMIN_FEE);
    const update = await updateOneSeat(seat_id, false);
    const results = await makeNewRefund(ticket_id, credit, expiration_date);
    // if(results.code == 'ER_DUP_ENTRY') throw "Ticket has already been cancelled"
    const update2 = await ticketModel.cancelTicketById(ticket_id);
    return results;
  } catch (err) {
    return err;
  }
};

module.exports = serviceMethods;

// canCancel checks the difference between the current time and the
// showtime. Returns true if the distance is >= 72 hours else returns
// false.
function canCancel(show_time) {
  // Add UTC OFFSET to compensate for Mountain Standard Time.
  let show_time_date = new Date(new Date(show_time) + constants.UTC_OFFSET);
  let current_date = new Date();
  difference = show_time_date.getTime() - current_date.getTime();
  hours = difference / (1000 * 3600);
  let cancel;
  hours >= 72 ? (cancel = true) : (cancel = false);
  return cancel;
}

function getExpirationDate() {
  let current_date = new Date();
  let exp_time = current_date.getTime() + constants.EXPIRATION_PERIOD;
  return new Date(exp_time);
}
