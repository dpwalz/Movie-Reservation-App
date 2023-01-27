import React, { useContext } from 'react';
import { Screen,Seat, SeatsContainer, Container} from "./selectSeat.styles";
import { Button, Modal } from 'react-bootstrap/';
import { MovieAPIContext } from "../../contexts/movie-api-provider";


export default function SelectSeat(props) {
    let seat_booked = false;
    const { getAllSeats } = useContext(MovieAPIContext);
    const [ showModal, setShow ] = React.useState(false);
    const [ seats, setSeats ] = React.useState([]);

    React.useEffect(() => {
        async function fetchSeats() {
            setSeats(await getAllSeats());
        }
        fetchSeats();
    }, [props]);

    // change so seats fetch more and change so return in payment closes 
    React.useEffect(() => {
        setShow(props.show);
    }, [props])

    const handleClose = () => {
        props.handleClose(false);
        props.handleShowing(null);
    }

    const handleClick = (e) => {
        let confirmation = window.confirm([`Choose Seat ${e.target.name}`]);
        if(confirmation){
            props.onSeat(e.target.value);
            handleClose();
        } 
    }

    return (
        <div>
            <Modal 
                show={showModal} 
                onHide={handleClose}
                fullscreen
            >
                <Modal.Header closeButton>Select Seat:</Modal.Header>
                <Modal.Body>
                    <Container>
                        <div style={{textAlign: "center"}}>Section A</div>
                        <SeatsContainer>
                        {
                            seats.map((s) => (
                                (s.showing_id === props.showing && s.seat_label.includes('A')) 
                                && (
                                    <Button style={{height: "4rem"}} onClick={handleClick} name={s.seat_label} value={s.seat_id} disabled={!s.is_available}>{s.seat_label}</Button> 
                                )
                            ))
                        }            
                        </SeatsContainer>
                    
                        <SeatsContainer>

                        <div style={{marginLeft: "10vw"}}>Section B</div>
                        <div style={{marginRight: "10vw"}}>Section C</div>

                        </SeatsContainer>

                        <SeatsContainer>

                            {
                                seats.map((s) => (
                                    (s.showing_id === props.showing && s.seat_label.includes('B')) 
                                    && (
                                        <Button style={{height: "4rem"}} onClick={handleClick} name={s.seat_label} value={s.seat_id} disabled={!s.is_available}>{s.seat_label}</Button> 
                                    )
                                ))
                            }
                                <Seat style={{border:"None"}}></Seat>
                                <Seat style={{border:"None"}}></Seat>
                            {
                                seats.map((s) => (
                                    (s.showing_id === props.showing && s.seat_label.includes('C')) 
                                    && (
                                        <Button style={{height: "4rem"}} onClick={handleClick} name={s.seat_label} value={s.seat_id} disabled={!s.is_available}>{s.seat_label}</Button> 
                                    )
                                ))
                            }

                        </SeatsContainer>

                        <div style={{textAlign: "center"}}>Section D</div>
                        <SeatsContainer>
                        {
                            seats.map((s) => (
                                (s.showing_id === props.showing && s.seat_label.includes('D')) 
                                && (
                                    <Button style={{height: "4rem"}} onClick={handleClick} name={s.seat_label} value={s.seat_id} disabled={!s.is_available}>{s.seat_label}</Button> 
                                )
                            ))
                        }
                        </SeatsContainer>
                    
                
                        <Screen>Screen</Screen>
                    </Container>
                </Modal.Body>
            </Modal>
        </div>
    )

} 



// const SelectSeat = ({prevStep, nextStep, handleChange, values}) =>{
//     const { getAllSeats } = useContext(MovieAPIContext);
//     const [data, setData] = React.useState(null);

//     const Continue = e => {
//         e.preventDefault();
//         console.log(values.seats);
//         nextStep();
//     }

//     const Previous = e => {
//         e.preventDefault();
//         prevStep();
//     }

//     React.useEffect(() => {
//         async function fetchSeats() {
//           setData(await getAllSeats());
//         }
//         fetchSeats();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//       }, []);

//     return (
//         <Container>
//             <div style={{textAlign: "center"}}>Section A</div>
//             <SeatsContainer>
//             {
//                 [...Array(10)].map((e, i) => <Seat key={i}>{i+1}</Seat>)
//             }
//             </SeatsContainer>
            
//             <SeatsContainer>

//             <div style={{marginLeft: "10vw"}}>Section B</div>
//             <div style={{marginRight: "10vw"}}>Section C</div>

//             </SeatsContainer>

//             <SeatsContainer>

//                 {
//                     [...Array(4)].map((e, i) => <Seat key={i}>{i+1}</Seat>)
//                 }
//                     <Seat style={{border:"None"}}></Seat>
//                     <Seat style={{border:"None"}}></Seat>
//                 {
//                     [...Array(4)].map((e, i) => <Seat key={i}>{i+1}</Seat>)
//                 }

//             </SeatsContainer>

//             <div style={{textAlign: "center"}}>Section D</div>
//             <SeatsContainer>
//             {
//                 [...Array(10)].map((e, i) => <Seat key={i}>{i+1}</Seat>)
//             }
//             </SeatsContainer>
            
        
//             <Screen>Screen</Screen>

//             {data != null && (
//             <Form>
//                 <Form.Select
//                     onChange={handleChange("seats")}
//                     defaultValue={values.seats}
//                 >
//                     <option value="">Open this select menu to select your seat</option>
//                     {data.map((s) => {
//                         if (s.showing_id === values.showtime && s.is_available === true)
//                             return <option value={s.seat_id}>{s.seat_label}</option>
//                     })}
//                 </Form.Select>
//             </Form>
//             )}

//             <Button onClick={Previous} style = {{marginTop: "5vh"}}>
//                 Back
//             </Button>
//             <Button onClick={Continue} style = {{float: "right", marginTop: "5vh"}}>
//                 Next
//             </Button>
//         </Container>)
// }

