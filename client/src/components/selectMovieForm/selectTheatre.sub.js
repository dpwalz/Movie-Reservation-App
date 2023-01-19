import React, { useContext } from "react";
import {Button, Offcanvas, Accordion, Row } from "react-bootstrap/";
import { Container } from "./selectTheatre.styles";
import { MovieAPIContext } from "../../contexts/movie-api-provider";
import PaymentButton from "../paymentForm/paymentButtonForm.component";


export default function SelectTheatre(props) {

  const movie_details = props.movie_details;
  const { getOneMovie } = useContext(MovieAPIContext);
  const [data, setData] = React.useState([]);
  const [show, setShow] = React.useState(false);
  const [seat, setSeat] = React.useState(null);

  React.useEffect(() => {
    async function fetchTickets() {
      const details = await getOneMovie(movie_details.movie_id);
      setData(details.showings);
    }
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    setSeat(props.selected_seat);
  }, [props])


  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    props.handleClose(null);
  }

  const handleClick = (e) => {
    props.onSelect(e.target.value);
  }

  return (
    <div>
      <Button onClick={handleShow}>Select Movie</Button>
      <Offcanvas show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{movie_details.movie_name}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <h3>Select Theatre: </h3>
            {data.map((m) => (
              <Accordion>
                <Accordion.Item eventKey="0">
                <Accordion.Header>{m.theatre_name}</Accordion.Header>
                <Accordion.Body>
                  <h4>Select Showtime:</h4>
                  <Row>
                    <Button variant="outline-secondary" value={m.showing_id} onClick={handleClick}>{m.show_time}</Button>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>
              </Accordion>
            ))}
          {seat && <PaymentButton handleClose={handleClose} seat_id={seat}/>}

        </Offcanvas.Body>
      </Offcanvas>
    </div>
  )

};


