import React, { useState, useContext, useEffect } from 'react';
import {Button, Modal, Form, Col, Row, Accordion, Alert, ToggleButton } from 'react-bootstrap/';
import { FormWrapper } from './paymentForm.styles';
import { MovieAPIContext } from '../../contexts/movie-api-provider';

export default function RegisteredPaymentForm(props) {
    
    let seat_id = props.seat_id;


    const { getRefundByUser, makePayment, processTicket, getOneSeat } = useContext(MovieAPIContext);
    const [ showModal, setShow ] = useState(false);
    const [ userCredit, setUserCredit ] = useState([])
    const [ creditAlertState, setCreditAlertState ] = useState("success");
    const [ enableCreditButton, setCreditButton ] = useState(true);
    const [ fname, setFname ] = useState();
    const [ lname, setLname ] = useState();
    const [ cc_number, setCardNumber ] = useState();
    const [ ticket_id, setTicket ] = useState();
    const [ refund, setRefund ] = useState([]);
    const [ applyRefund, setApplyRefund ] = useState(false);
    const [ paymentSuccess, setPaymentSuccess ] = useState(null)
    const [ ticketConfirmation, setTicketConfirmation ] = useState(null);
    const [ payEnabled, setPayEnabled ] = useState(true);
    const [ seat_cost, setSeatDetails] = useState();
    const [ useOther, setUseOtherCreditCard] = useState(false);


    useEffect(() => {
        async function updateRefundsForUser() {
            try{
                const users_credit = await getRefundByUser();
                setUserCredit(users_credit);
                if(users_credit[0] === false) {
                    setCreditAlertState("danger"); 
                    setCreditButton(false);
                }
                else if(users_credit[1] === 0) {
                    setCreditAlertState("warning")
                    setCreditButton(false);
                }
                else {
                    setCreditAlertState("success"); 
                    setCreditButton(true);
                }
            } catch (e){
                console.log("error")
            }
            
        };
        updateRefundsForUser();
        
    }, []);

    useEffect(() => {
        async function getSeatCost() {
            try{
                const seat_details = await getOneSeat(seat_id);
                if(!seat_details) {
                    setSeatDetails("N/A");
                }
                else {
                    setSeatDetails(seat_details.cost);
                }
            } catch (e){
                console.log(e)
            }
        };
    getSeatCost();       
    }, [seat_id]);


    useEffect(() => {
        if(!useOther) setPayEnabled(true);
        else if(useOther && fname && lname && validateInputs())
            setPayEnabled(true);
        else {
            setPayEnabled(false);
        }
    });

    function validateInputs(){
        const reg1 = /^\d{16}$/i;
        if(reg1.test(cc_number)){
            return true;
        }
        return false;
    }

    const handleReturn = () => {
        handleClose();
        props.handleClose();
    }


    const handleClose = () => {
        setShow(false);
        setFname("");
        setLname("");
        setCardNumber("");
        setTicket("");
        setRefund([]);
        setApplyRefund(false);
        setPaymentSuccess(null);
        setPayEnabled(true);
        setTicketConfirmation(null);
    }
    const handleShow = () => setShow(true);


    const handleSubmit = async (event) => {
        try {
            const payment_result = await makePayment(seat_id, cc_number, ticket_id, applyRefund);
            if(payment_result[0] !== true) throw payment_result[1];
            const ticket_result = await processTicket(seat_id, "", payment_result[1]);
            if(ticket_result[0] !== true) throw ticket_result[1];
            setTicketConfirmation(ticket_result[1]);
            setPaymentSuccess(true);
        } catch (error) {
            setTicketConfirmation(error);
            setPaymentSuccess(false);
        }
    }

    return (
        <div>
            <Button variant="primary" onClick={handleShow}>Make Payment</Button>
            <Modal show={showModal} onHide={handleClose} >
                <Modal.Header>Payment</Modal.Header>
                <Modal.Body>
                    {paymentSuccess === true ? (
                        <Alert variant="success">
                            <Alert.Heading>Ticket Completed Successfully!</Alert.Heading>
                                <p>
                                    Here is your ticket id #: <b>{ticketConfirmation} </b>
                                    an email has been sent with your receipt and ticket confirmation.
                                </p>
                                <hr />
                                <div className="d-flex justify-content-end">
                                    <Button onClick={handleReturn} variant="outline-success">
                                        Return
                                    </Button>
                                </div>
                        </Alert>
                    ) : (ticketConfirmation && <Alert variant="danger">
                            <Alert.Heading>Processing Error</Alert.Heading>
                            <p>
                                {ticketConfirmation}
                            </p>
                            <div className="d-flex justify-content-end">
                                <Button onClick={handleClose} variant="outline-danger">
                                    Return
                                </Button>
                            </div>
                        </Alert>
                    )}
                    {paymentSuccess === true ? ( 
                        <div></div>
                     ) : (
                    <Accordion defaultActiveKey={['0']}>
                    <Accordion.Item eventkey="0">
                            <Alert variant="info">
                                <Alert.Heading>Checkout:</Alert.Heading>
                                    <p>
                                        Total Cost is: <b>${seat_cost}</b>.
                                    </p>
                                    <hr />
                            </Alert>
                        {userCredit[0]===true ? (
                            <Alert variant={creditAlertState}>You have ${userCredit[1]} in credit
                            <div className="d-grid gap-2">
                                <ToggleButton
                                    className="mb-2"
                                    id="toggle-check"
                                    type="checkbox"
                                    variant="outline-primary"
                                    checked={applyRefund}
                                    value="1"
                                    disabled = {!enableCreditButton}
                                    onChange={(e) => setApplyRefund(e.currentTarget.checked)}>
                                        Click to Apply Credit
                                </ToggleButton>
                            </div>
                            </Alert>     
                        ) : (!refund[0] && <Alert variant={creditAlertState}>Issue Retrieving Your Credit</Alert>)}            
                        </Accordion.Item>
                        <Accordion.Item eventkey="1">
                                <Accordion.Header>Use Different Credit Card</Accordion.Header>
                                <Accordion.Body>
                                <Form.Check
                                    
                                    type='checkbox'
                                    label = 'Use Different Credit Card?'
                                    onChange={(e) => setUseOtherCreditCard(e.target.checked)}
                                    />
                                    <FormWrapper onSubmit={handleSubmit}>
                                    <Row>
                                        <Form.Group as={Col} className="mb-3" controlId="fname">
                                            <Form.Label>First Name:</Form.Label>
                                            <Form.Control 
                                                type="name" 
                                                placeholder="First Name" 
                                                value={fname || ""} 
                                                onChange={(e) => setFname(e.target.value)} 
                                                required>
                                            </Form.Control>
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-3" controlId="lname">
                                            <Form.Label>Last Name:</Form.Label>
                                            <Form.Control 
                                                type="name" 
                                                placeholder="Last Name" 
                                                value={lname || ""} 
                                                onChange={(e) => setLname(e.target.value)} 
                                                required>
                                            </Form.Control>
                                        </Form.Group>
                                    </Row>
                                    <Form.Group className="mb-3" controlId="credit_card_number">
                                        <Form.Label>Enter Credit Card Number:</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            pattern="^[0-9]+$" 
                                            placeholder="XXXX XXXX XXXX XXXX" 
                                            value={cc_number || ""} 
                                            onChange={(e) => setCardNumber(e.target.value)} 
                                            required>
                                        </Form.Control>
                                    </Form.Group> 
                                </FormWrapper>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                )}
                </Modal.Body>
                {paymentSuccess === true ? ( 
                        <div></div>
                     ) : (
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        type="reset" 
                        onClick={handleClose}>
                            Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        type="button" 
                        onClick={handleSubmit}
                        disabled={!payEnabled}>
                            Pay
                    </Button>
                </Modal.Footer>
            )}
            </Modal>
        </div>
    )



}