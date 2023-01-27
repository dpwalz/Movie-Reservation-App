import React, { useContext, useState } from "react";
import {Card, Row, Col} from "react-bootstrap/";
import { Container } from "./selectMovie.styles";
import SelectTheatre from './selectTheatre.sub';
import SelectSeat from "./selectSeat.sub";
import { MovieAPIContext } from "../../contexts/movie-api-provider";


const SelectMovie = ({ nextStep, handleChange, values }) => {
  const [data, setData] = useState(null);
  const { getAllMovies } = useContext(MovieAPIContext);
  const [showing, setShowing] = useState(null);
  const [seat, setSeat] = useState(null);
  const [showSeats, setShowSeats] = useState(false);

  //NOTE: getAllMovies function is using the Bearer jwt, so if they are logged in, the API will return all movies for logged in users or not. No need to check separately for users logged in here.
  React.useEffect(() => {
    async function fetchTickets() {
      setData(await getAllMovies());
    }
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    showing === null ? setShowSeats(false) : setShowSeats(true);
  }, [showing])

  const handleSelect = (newShowtime) => {
    setShowing(newShowtime);
  };

  const handleSeat = (newSeat) => {
    setSeat(newSeat);
  }

  return (
    <Container>
      <h1>Select Movie</h1>
      
      {data != null && (
      <>
      <Row xs={1} md={2} className="g-4">
        {data.map((m) => (
          <Col> 
            <Card style={{ width: '18rem' }}>
              <Card.Img style={{ height: '10rem' }} variant="top" src={require('../../images/' + m.movie_id + '.jpg')}
                alt={m.movie_name}/>
              <Card.Body>
                <Card.Title>
                  <h3>{m.movie_name}</h3>
                </Card.Title>
                <SelectTheatre handleClose={setSeat} movie_details={m} onSelect={handleSelect} selected_seat={seat}/>
              </Card.Body>
            </Card>
          </Col>
            ))}
      </Row>
      <SelectSeat showing={showing} handleShowing={handleSelect} onSeat={handleSeat} show={showSeats} handleClose={setShowSeats}/>
      </>
      )}
  </Container>
  );
};

export default SelectMovie;
