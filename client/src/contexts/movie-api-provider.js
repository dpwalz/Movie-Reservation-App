import React, { createContext, useEffect } from "react";
import { useSessionStorageState } from "../hooks/useSessionStorageState";

const API_URL = "http://localhost:5000/api/v1/";

export const MovieAPIContext = createContext();

export function MovieAPIProvider(props) {
  // Create a token and studentInfo for the user and save in session storage. Default value is null.
  const [jwt, setJwt] = useSessionStorageState("jwt", null);
  // const [jwt, setJwt] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVXzAwMDMiLCJpYXQiOjE2NzAwNDg3NDZ9.W5cYzjzUAPpItVf-gCuFsUwAcCjmJjxTiTDJcQjLp9A")
  const [userId, setUserId] = useSessionStorageState("userId", null);

  // [] option will behave like componentDidMount and run only once at startup
  useEffect(() => {
    // Create an interceptor that looks for a new JWT. Refresh token if required.
    //TODO: Convert to fetch
    // axios.interceptors.response.use((res) => {
    //   const newToken = res.headers["X-New-Token"];
    //   if (newToken) {
    //     // set the new JWT in state and sync to localstorage
    //     setJwt(newToken);
    //   }
    //   return res;
    // });
  }, []);

  async function login(email, password) {
    // Send credentials to server and save the token from the response
    try {
      const response = await fetch(API_URL + "users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_address: email,
          password,
        }),
      });

      const body = await response.json();
      if (body.success === true) {
        // Set the token in session storage for use in later API calls
        const { token, user_id } = body.data;
        setJwt(token);
        setUserId(user_id);
        return true;
      } else return body.data;
    } catch (e) {
      console.log(e);
      return "Server communication error";
    }
  }

  function isLoggedIn() {
    return jwt != null;
  }

  async function getUserInfo() {
    try {
      const response = await fetch(API_URL + "users/" + userId, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      });
      const body = await response.json();
      if (body.success === true) {
        console.log(body.data);
        return body.data;
      } else return body.message;
    } catch (e) {
      console.log(e);
      return "Server communication error";
    }
  }

  //TODO: Added just to test. I don't think we need this function in the end.
  async function getAllUsers() {
    try {
      const response = await fetch(API_URL + "users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      });

      const body = await response.json();
      if (body.success === true) {
        // Set the token in session storage for use in later API calls
        console.log(body.data);
        return true;
      } else return body.message;
    } catch (e) {
      console.log(e);
      return "Server communication error";
    }
  }

  function logout() {
    setJwt(null);
    setUserId(null);
  }

  async function register(firstName, lastName, address, cc, email, password) {
    // Send credentials to server and save the token from the response
    try {
      const response = await fetch(API_URL + "users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email_address: email,
          password,
          address,
          credit_card: cc,
        }),
      });
      const body = await response.json();

      if (body.success) {
        //TODO: login
        return true;
      } else return body.message;
    } catch (e) {
      console.log(e);
      return "Server communication error";
    }
  }

  async function getRefundByTicket(ticket_id) {
    try {
      const response = await fetch(API_URL + `refunds/${ticket_id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      });
      const body = await response.json();
      if (body.success === true) return [true, body.data.credit_available];
      else return [false, body.message];
    } catch (e) {
      console.log(e);
      return "Server communication error";
    }
  }

  async function getTicketsForCurrentUser() {
    try {
      const response = await fetch(API_URL + `users/${userId}/tickets`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      });
      const body = await response.json();
      if (body.success === true) return body.data;
      else return [false, body.message];
    } catch (e) {
      console.log(e);
      return "Server communication error";
    }
  }

  async function getTicketById(ticket_id) {
    try {
      const response = await fetch(API_URL + `tickets/${ticket_id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      });
      const body = await response.json();
      if (body.success === true) return body.data;
      else return [];
    } catch (e) {
      console.log(e);
      return "Server communication error";
    }
  }

  async function cancelTicketById(ticket_id) {
    try {
      const response = await fetch(API_URL + `tickets/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticket_id,
        }),
      });
      const body = await response.json();
      if (body.success === true) return true;
      else return body.message;
    } catch (e) {
      console.log(e);
      return "Server communication error";
    }
  }

  async function makePayment(
    seat_id_number,
    credit_card_number,
    refund_ticket_id,
    applyRefund
  ) {
    try {
      const response = await fetch(API_URL + `payments/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seat_id: seat_id_number,
          credit_card: credit_card_number,
          use_credit: new Boolean(applyRefund),
          ticket_id: refund_ticket_id,
        }),
      });
      const body = await response.json();
      console.log('testing')
      console.log(body);
      if (body.success === true) return [true, body.data.payment_id];
      else return [false, body.message];
    } catch (e) {
      console.log(e);
      return "Server communication error";
    }
  }

  async function processTicket(seat_id, email, payment_id) {
    try {
      const response = await fetch(API_URL + `tickets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seat_id,
          email,
          payment_id,
        }),
      });
      const body = await response.json();
      console.log(body);
      if (body.success === true) return [true, body.data.ticket_id];
      else return [false, body.message];
    } catch (e) {
      console.log(e);
      return "Server communication error";
    }
  }

  async function getRefundByUser() {
    try {
      const response = await fetch(API_URL + `refunds/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      });
      const body = await response.json();
      console.log(body);
      if (body.success === true) return [true, body.data];
      else return [false, body.message];
    } catch (e) {
      console.log(e);
      return "Server communication error";
    }
  }

  async function getAllSeats() {
    try {
      const response = await fetch(API_URL + `seats/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      });
      const body = await response.json();
      if (body.success === true) return body.data;
      else return null;
    } catch (e) {
      console.log(e);
      return "Server communication error";
    }
  }

  async function getOneSeat(seat_id) {
    try {
      const response = await fetch(API_URL + `seats/${seat_id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      });
      const body = await response.json();
      console.log(body);
      if (body.success === true) return body.data;
      else return null;
    } catch (e) {
      console.log(e);
      return "Server communication error";
    }
  }

  async function getAllMovies(movie_id) {
    try {
      const response = await fetch(API_URL + `movies/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      });
      const body = await response.json();
      if (body.success === true) return body.data;
      else return null;
    } catch (e) {
      console.log(e);
      return "Server communication error";
    }
  }

  async function getOneMovie(movie_id) {
    try {
      const response = await fetch(API_URL + `movies/${movie_id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      });
      const body = await response.json();
      if (body.success === true) return body.data;
      else return null;
    } catch (e) {
      console.log(e);
      return "Server communication error";
    }
  }
  async function payMembershipFee(credit_card) {
    try {
      const response = await fetch(API_URL + `payments/${userId}`, {
        method: "PATCH", 
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
         credit_card,
        }),
      });
      const body = await response.json();
      if (body.success === true) return [true, body.data];
      else return [false, body.message];
    } catch (e) {
      console.log(e)
      return "Server communication error";
    }
  }

  return (
    <MovieAPIContext.Provider
      value={{
        login,
        isLoggedIn: isLoggedIn(),
        jwt,
        logout,
        register,
        getUserInfo,
        getAllUsers,
        cancelTicketById,
        getRefundByTicket,
        makePayment,
        processTicket,
        getRefundByUser,
        getAllSeats,
        getOneSeat,
        getAllMovies,
        getOneMovie,
        getTicketById,
        getTicketsForCurrentUser,
        payMembershipFee
      }}
    >
      {props.children}
    </MovieAPIContext.Provider>
  );
}
